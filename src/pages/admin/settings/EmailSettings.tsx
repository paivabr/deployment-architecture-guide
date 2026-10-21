import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Mail,
  Save,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  AlertCircle,
  FileText } from
'lucide-react';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  enabled: boolean;
}

const defaultTemplates: EmailTemplate[] = [
{ id: '1', key: 'welcome', name: 'Boas-vindas', subject: 'Bem-vindo(a) à plataforma!', enabled: true },
{ id: '2', key: 'purchase_confirmed', name: 'Compra confirmada', subject: 'Sua compra foi aprovada!', enabled: true },
{ id: '3', key: 'password_reset', name: 'Recuperação de senha', subject: 'Redefina sua senha', enabled: true },
{ id: '4', key: 'course_reminder', name: 'Lembrete de curso', subject: 'Continue seu curso!', enabled: false },
{ id: '5', key: 'certificate_ready', name: 'Certificado disponível', subject: 'Seu certificado está pronto!', enabled: true }];


export default function EmailSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resend settings
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Test email
  const [testEmail, setTestEmail] = useState('');

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', ['email_from', 'email_from_name', 'email_reply_to', 'email_configured']);

      data?.forEach((s) => {
        if (s.key === 'email_from') setFromEmail(s.value as string || '');
        if (s.key === 'email_from_name') setFromName(s.value as string || '');
        if (s.key === 'email_reply_to') setReplyTo(s.value as string || '');
        if (s.key === 'email_configured') setIsConfigured(s.value === true);
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!supabase) return;
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // Save settings
      const settings = [
      { key: 'email_from', value: fromEmail, category: 'email', scope: 'private' as const },
      { key: 'email_from_name', value: fromName, category: 'email', scope: 'private' as const },
      { key: 'email_reply_to', value: replyTo, category: 'email', scope: 'private' as const }];


      for (const s of settings) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { ...s, value: s.value as never },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      // If API key provided, save via edge function (encrypted)
      if (apiKey) {
        const { error: fnError } = await supabase.functions.invoke('admin-providers', {
          body: { action: 'save-email-key', apiKey }
        });
        if (fnError) throw fnError;
        setIsConfigured(true);
        setApiKey('');
      }

      setSuccess('Configurações salvas!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setIsTesting(true);
    setError('');
    setSuccess('');

    try {
      const { error: fnError } = (await supabase?.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'E-mail de teste',
          html: '<h1>Teste</h1><p>Se você recebeu este e-mail, a integração está funcionando!</p>'
        }
      })) || {};

      if (fnError) throw fnError;
      setSuccess('E-mail de teste enviado!');
    } catch (err) {
      setError('Falha ao enviar e-mail de teste');
    } finally {
      setIsTesting(false);
    }
  };

  const toggleTemplate = (id: string) => {
    setTemplates(templates.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_5c456024d6" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_64e9a317e0" className="mb-8">
        <h1 data-ev-id="ev_c26420a655" className="text-2xl font-bold text-gray-900">E-mails e Notificações</h1>
        <p data-ev-id="ev_916077adf6" className="text-gray-600 mt-1">Configure o envio de e-mails com Resend</p>
      </div>

      <div data-ev-id="ev_055bbae685" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_aa5dbafe6c" className="lg:col-span-2 flex flex-col gap-6">
          {/* Resend Config */}
          <div data-ev-id="ev_e265963f16" className="bg-white rounded-xl border border-gray-200 p-6">
            <div data-ev-id="ev_6b71d80b6a" className="flex items-center gap-3 mb-6">
              <div data-ev-id="ev_e9dd08721f" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div data-ev-id="ev_af9138172f">
                <h2 data-ev-id="ev_afcf6ba908" className="text-lg font-semibold text-gray-900">Resend</h2>
                <p data-ev-id="ev_e3103997cf" className="text-sm text-gray-500">Provedor de e-mail transacional</p>
              </div>
              {isConfigured && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
            </div>

            {error &&
            <div data-ev-id="ev_67b628ad54" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            }
            {success &&
            <div data-ev-id="ev_cd61f12411" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            }

            <div data-ev-id="ev_7d1967ddb3" className="flex flex-col gap-4">
              <div data-ev-id="ev_75ac113382">
                <label data-ev-id="ev_1f524ec8ad" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key {isConfigured && <span data-ev-id="ev_7fb69a1d3a" className="text-green-600">✓ Configurada</span>}
                </label>
                <div data-ev-id="ev_a92c312366" className="relative">
                  <input data-ev-id="ev_6e9626f016"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isConfigured ? '••••••••' : 're_...'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none pr-12" />

                  <button data-ev-id="ev_ee725c503c" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p data-ev-id="ev_9387c20086" className="mt-1 text-xs text-gray-500">Obtenha em <a data-ev-id="ev_5cd857c631" href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></p>
              </div>

              <div data-ev-id="ev_93ebd94195" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_023908842c">
                  <label data-ev-id="ev_afd9f0e103" className="block text-sm font-medium text-gray-700 mb-1">E-mail remetente</label>
                  <input data-ev-id="ev_72638b88b4"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="contato@seudominio.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
                <div data-ev-id="ev_66084b2a4a">
                  <label data-ev-id="ev_edb9894823" className="block text-sm font-medium text-gray-700 mb-1">Nome do remetente</label>
                  <input data-ev-id="ev_d06a8679dc"
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Sua Plataforma"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>

              <div data-ev-id="ev_9f3af5d1a2">
                <label data-ev-id="ev_afbf2cb577" className="block text-sm font-medium text-gray-700 mb-1">E-mail de resposta (Reply-To)</label>
                <input data-ev-id="ev_0f58009490"
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="suporte@seudominio.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>

              <button data-ev-id="ev_3087f48e5d" onClick={handleSave} disabled={isSaving} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar configurações</>}
              </button>
            </div>
          </div>

          {/* Templates */}
          <div data-ev-id="ev_9c861bc910" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_e71e5879ce" className="text-lg font-semibold text-gray-900 mb-4">Templates de E-mail</h2>
            
            <div data-ev-id="ev_df7c4db291" className="flex flex-col gap-3">
              {templates.map((template) =>
              <div data-ev-id="ev_2fa2f1d821" key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div data-ev-id="ev_c4a47544fc" className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div data-ev-id="ev_d35f486b8d">
                      <p data-ev-id="ev_2ab13a36d7" className="font-medium text-gray-900">{template.name}</p>
                      <p data-ev-id="ev_4c1a7dd0e2" className="text-sm text-gray-500">{template.subject}</p>
                    </div>
                  </div>
                  <button data-ev-id="ev_7ae0f85f65"
                onClick={() => toggleTemplate(template.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                template.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`
                }>

                    {template.enabled ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_2e41df7786" className="flex flex-col gap-6">
          {/* Test Email */}
          <div data-ev-id="ev_c80b6ed9d2" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_5ad34d38fb" className="text-lg font-semibold text-gray-900 mb-4">Testar envio</h2>
            
            <div data-ev-id="ev_73ce3596a1" className="flex flex-col gap-4">
              <div data-ev-id="ev_a164b81e6b">
                <label data-ev-id="ev_c31db0d15a" className="block text-sm font-medium text-gray-700 mb-1">E-mail de destino</label>
                <input data-ev-id="ev_4fa56c3727"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <button data-ev-id="ev_9de8e14b76"
              onClick={handleTestEmail}
              disabled={isTesting || !testEmail || !isConfigured}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">

                {isTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar teste</>}
              </button>
              {!isConfigured &&
              <p data-ev-id="ev_b4b5f532b7" className="text-xs text-gray-500 text-center">Configure a API Key primeiro</p>
              }
            </div>
          </div>

          {/* Info */}
          <div data-ev-id="ev_3eeb6204d6" className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 data-ev-id="ev_2640acf744" className="font-semibold text-blue-900 mb-2">Sobre o Resend</h3>
            <p data-ev-id="ev_770e497e43" className="text-sm text-blue-800 mb-4">
              O Resend é um serviço de e-mail moderno com alta taxa de entrega. O plano gratuito inclui 3.000 e-mails/mês.
            </p>
            <a data-ev-id="ev_c0b75136cf" href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              Criar conta no Resend →
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>);

}