# Arquitetura de Plataformas — qual serviço usar para cada coisa

> Resumo: **não** dá para rodar tudo bem em uma única plataforma. O núcleo (banco, auth, arquivos, funções de servidor, segredos) fica no **Cloud Backend** da Sticklight. Vídeo, e-mail transacional, pagamentos e WhatsApp **precisam** de serviços externos com conta própria.

---

## 1. Mapa de responsabilidades

| Necessidade | Plataforma recomendada | Alternativas | Por quê |
|---|---|---|---|
| Banco de dados (cursos, usuários, pedidos, configurações) | **Cloud Backend — Database (PostgreSQL + RLS)** | — | Já integrado, com permissões por linha (RLS) e migrações versionadas |
| Autenticação e sessões | **Cloud Backend — Auth users** | — | E-mail/senha, convites, recuperação de senha |
| Segredos (tokens de API, chave de criptografia) | **Cloud Backend — Secrets** | — | Nunca ficam no código nem no navegador |
| Lógica de servidor (checkout, webhooks, teste de integração) | **Cloud Backend — Functions (Edge Functions)** | — | É onde o token privado pode ser usado com segurança |
| Imagens (capas de curso, logo, banners) | **Cloud Backend — Storage/Files** | Cloudinary, Cloudflare Images, Bunny | Storage resolve 95% dos casos. Cloudinary/Cloudflare só se você precisar de redimensionamento automático, WebP/AVIF on-the-fly e CDN agressivo |
| **Vídeo das aulas** | **Mux**, **Cloudflare Stream** ou **Panda Video** (BR) | Vimeo OTT, Bunny Stream | ⚠️ **Não hospede vídeo no Storage do banco.** Sem HLS/transcodificação/proteção de link o custo explode e o player trava. Panda Video é o mais comum no mercado BR de cursos |
| Transmissão ao vivo | **Cloudflare Stream Live**, **Mux Live** | YouTube Live não listado + Zoom | Live exige ingest RTMP + playback HLS |
| E-mail transacional (convite de moderador, recuperação de senha, confirmação de compra) | **Resend** (simples) ou **Brevo** / **SendGrid** | Amazon SES (mais barato, mais trabalhoso) | O Auth só envia e-mail real depois que você configurar SMTP próprio |
| Pagamentos | **Mercado Pago** e/ou **Asaas** | Pagar.me, Stripe (não faz Pix nativo no BR do mesmo jeito) | Pix + cartão + boleto com webhook confiável |
| Notas fiscais (se vender) | **Asaas** (emite NF) ou **NFE.io**, **eNotas** | — | Opcional na v1 |
| WhatsApp / atendimento | **Meta WhatsApp Cloud API** (oficial) | Z-API, Evolution API (não oficiais, risco de banimento) | Oficial exige verificação de empresa no Meta Business |
| Calendário e reuniões | **Google Calendar API + Meet** | Zoom API, Daily.co, Cal.com | Meet é grátis dentro do Workspace |
| Monitoramento de erros | **Sentry** | — | Já existe conector disponível |
| Hospedagem do front + domínio + SSL | **Sticklight** (Settings → Domains) | — | Publicação e domínio próprio pelo painel |
| Backup do banco | Rotina de export via Function + **Cloudflare R2** / **Backblaze B2** | — | Guardar fora do mesmo provedor do banco |

---

## 2. Stack mínima para começar (recomendada)

1. **Cloud Backend** (banco + auth + storage + functions + secrets)
2. **Mercado Pago** (Pix + cartão) — conta de testes primeiro
3. **Resend** (e-mails transacionais + SMTP do Auth)
4. **Panda Video** ou **Cloudflare Stream** (vídeo das aulas)
5. **Sticklight Domains** (domínio + HTTPS)

Isso cobre: vender curso, liberar acesso por webhook, enviar e-mail, entregar vídeo protegido.

## 3. Stack completa (fase 2)

Acrescente: **Asaas** (segundo provedor / boleto / NF), **WhatsApp Cloud API**, **Google Calendar + Meet**, **Sentry**, **R2** para backup.

---

## 4. Ordem de custo (referência, varia)

| Item | Custo típico inicial |
|---|---|
| Cloud Backend | incluso no plano |
| Mercado Pago / Asaas | sem mensalidade, taxa por transação |
| Resend | plano gratuito até ~3k e-mails/mês |
| Panda Video / Cloudflare Stream | por hora armazenada + minutos entregues |
| WhatsApp Cloud API | por conversa iniciada |
| Sentry | plano gratuito atende início |

---

## 5. O que **não** fazer

- ❌ Guardar token privado de pagamento em variável `VITE_*` (vai parar no navegador).
- ❌ Subir MP4 das aulas para o Storage e servir por URL pública.
- ❌ Liberar o curso quando o comprador volta para a página de sucesso — só o **webhook** confirma.
- ❌ Calcular preço final no front-end.
- ❌ Marcar uma integração como "Funcionando" só porque a credencial foi preenchida.
