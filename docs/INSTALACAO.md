# Passo a passo de instalação e configuração

Guia operacional do zero até o sistema rodando com pagamentos reais.
Veja também: [`PLATAFORMAS.md`](./PLATAFORMAS.md) para saber **qual serviço usar para cada coisa**.

Legenda:
- 🧑 **Você faz** (fora do código — criar conta, copiar chave)
- 🤖 **Eu faço** (no projeto — tabelas, telas, funções)

---

## FASE 0 — Contas a criar antes de tudo 🧑

| Serviço | Onde criar | O que você vai precisar copiar |
|---|---|---|
| Mercado Pago | painel de desenvolvedores do Mercado Pago | `Access Token` (teste **e** produção), `Public Key`, `Client Id`, segredo do webhook |
| Asaas (opcional) | painel do Asaas | `API Key` sandbox e produção, token de webhook |
| Resend (e-mail) | resend.com | `API Key` + domínio verificado (registro DNS SPF/DKIM) |
| Panda Video / Cloudflare Stream | painel do provedor | `API Key` + `Library/Account Id` |
| WhatsApp Cloud API (opcional) | Meta Business | `Phone Number Id`, `Permanent Token`, `Verify Token` |
| Google Cloud (Calendar/Meet, opcional) | console.cloud.google.com | `Client Id`, `Client Secret`, OAuth redirect |

> ⚠️ Verificação de domínio de e-mail e verificação de empresa no Meta levam de **horas a dias**. Comece por elas.

---

## FASE 1 — Ligar o Cloud Backend 🤖

1. Ativo o Cloud Backend do projeto (banco PostgreSQL + Auth + Storage + Functions + Secrets).
2. A partir daí, aparecem no Studio as abas: **Database, Files, Auth users, Functions, Secrets, Logs**.

Nada para você fazer aqui além de aprovar.

---

## FASE 2 — Estrutura do banco (uma migração) 🤖

Crio em uma única migração, já com RLS ativa:

**Identidade e permissão**
- `profiles` (criado automaticamente no cadastro)
- `user_roles` (`admin`, `moderator`, `teacher`, `student`)
- `audit_log` (quem mudou o quê, sem gravar segredo)

**Conteúdo**
- `categories`, `courses`, `modules`, `lessons`, `lesson_assets`
- `pages` (páginas institucionais com slug), `menu_items`, `home_sections`
- `custom_fields` (campos adicionais com tipos autorizados)

**Comércio**
- `payment_providers` (nome, provedor, ambiente, status, padrão)
- `payment_provider_credentials` (valores **criptografados**, nunca lidos pelo front)
- `payment_methods_config` (Pix / crédito / débito / boleto ligado ou desligado)
- `checkout_settings`, `coupons`
- `orders`, `order_items`, `payments`, `enrollments`
- `webhook_events` (com chave única por `provider + event_id` → sem duplicação)

**Configuração**
- `settings` com escopo: `public` | `private` | `secret` | `admin` | `draft`
- `settings_versions` (histórico e restauração das configurações não secretas)

---

## FASE 3 — Segredos do servidor 🧑🤖

1. 🤖 Eu crio a chave mestra de criptografia como segredo (`APP_ENCRYPTION_KEY`) — **nunca** fixa no código.
2. 🧑 Você cola, pelo painel, as credenciais dos provedores. Elas vão **criptografadas** para o banco.
3. A tela sempre devolve `Credencial configurada`, nunca o valor.

Segredos previstos:

```
APP_ENCRYPTION_KEY        (gerado, obrigatório)
MP_WEBHOOK_SECRET         (Mercado Pago)
ASAAS_WEBHOOK_TOKEN       (Asaas)
RESEND_API_KEY            (e-mail)
VIDEO_API_KEY             (Panda / Cloudflare)
WHATSAPP_TOKEN            (opcional)
```

---

## FASE 4 — Funções de servidor (Edge Functions) 🤖

| Função | Papel |
|---|---|
| `admin-providers` | salvar / editar / revogar credenciais (valida papel admin no servidor) |
| `test-integration` | botão **Testar integração**: valida credencial, ambiente, métodos disponíveis e webhook |
| `create-checkout` | calcula o preço **no servidor** e cria a cobrança no provedor |
| `payment-webhook` | recebe o evento, **valida assinatura**, deduplica, atualiza pedido e libera matrícula |
| `send-email` | convites de moderador e avisos transacionais |
| `invite-user` | cria o usuário, atribui papel e dispara o convite |

Estados da integração exibidos no painel: `Não configurado · Teste pendente · Em validação · Funcionando · Atenção necessária · Falha · Desativado`.

---

## FASE 5 — Painel administrativo 🤖

Central de Configurações com as 15 áreas do módulo: Gerais, Identidade visual, Páginas e conteúdo, Cursos e categorias, Usuários e permissões, Pagamentos e APIs, E-mails, Armazenamento, Vídeos, Calendário, WhatsApp, Segurança, Integrações, Logs, Backup.

Tudo persistido no banco — sem nova publicação para mudar preço, cupom, método de pagamento, curso ou página.

---

## FASE 6 — Webhooks 🧑

1. O painel mostra a URL de recebimento, ex.:
   - Mercado Pago: `https://vzqevpwjyyagehoqktqv.supabase.co/functions/v1/payment-webhook?provider=mercadopago`
   - Asaas: `https://vzqevpwjyyagehoqktqv.supabase.co/functions/v1/payment-webhook?provider=asaas`
2. 🧑 Você cola essa URL no painel do provedor (Mercado Pago → Webhooks / Asaas → Integrações).
3. 🧑 Copia o segredo de assinatura e cola no nosso painel.
4. 🤖 O botão **Testar integração** confirma se o evento chega e é validado.

> Quando o provedor permitir cadastro automático de webhook por API, o painel faz sozinho. Quando não permitir, ele mostra o passo manual.

---

## FASE 7 — Testes antes de vender 🧑

- [ ] Ambiente = **Testes**. Fazer uma compra com cartão de teste do provedor.
- [ ] Pix de teste gera QR Code e o webhook chega.
- [ ] Pagamento recusado **não** libera o curso.
- [ ] Pagamento aprovado cria `enrollment` e o aluno vê o curso.
- [ ] Evento duplicado não processa duas vezes.
- [ ] Desligar o Pix no painel remove a opção do checkout (sem publicar de novo).
- [ ] Convidar um moderador e confirmar o e-mail recebido.
- [ ] Logar como aluno e confirmar que a área de configurações é inacessível.

---

## FASE 8 — Produção 🧑🤖

1. 🧑 Configurar SMTP próprio em **Cloud → Auth users → Authentication Settings → Custom SMTP** (com a chave do Resend). Sem isso, e-mails reais não saem.
2. 🧑 Ligar "Exigir verificação de e-mail" se quiser.
3. 🧑 Apontar o domínio em **Settings → Domains**.
4. 🤖 Trocar o ambiente do provedor para **Produção** — exige confirmação administrativa explícita na tela.
5. 🧑 Fazer uma compra real de valor baixo e estornar.
6. 🤖 Rotina de backup agendada.

---

## O que é código vs. o que é contratação

| Já implementável aqui | Depende de você / do fornecedor |
|---|---|
| Painel, banco, permissões, cursos, páginas, cupons, checkout, webhooks, criptografia de credenciais | Conta no Mercado Pago/Asaas, aprovação de Pix, domínio de e-mail verificado, conta de vídeo, verificação de empresa no WhatsApp, emissão de NF |

Nenhuma integração será marcada como "Funcionando" no painel sem teste real de conectividade.
