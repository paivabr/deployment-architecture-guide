import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageCircle,
  Phone,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Info } from
'lucide-react';

export default function WhatsAppSettings() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error';text: string;} | null>(null);

  // Auto-reply settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Olá! Obrigado por entrar em contato. Em breve retornaremos.');
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      eq('category', 'whatsapp');

      if (data) {
        data.forEach((s) => {
          const val = s.value as string;
          switch (s.key) {
            case 'phone_number_id':if (val) setPhoneNumberId(val);break;
            case 'access_token':if (val) setAccessToken(val);break;
            case 'verify_token':if (val) setVerifyToken(val);break;
            case 'is_configured':setIsConfigured(val === 'true');break;
            case 'auto_reply_enabled':setAutoReplyEnabled(val === 'true');break;
            case 'welcome_message':if (val) setWelcomeMessage(val);break;
            case 'business_hours_only':setBusinessHoursOnly(val === 'true');break;
          }
        });
      }
    } catch (err) {
      console.error('Error loading WhatsApp settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings to database
  const handleSave = async () => {
    if (!supabase) return;

    if (!phoneNumberId || !accessToken) {
      setMessage({ type: 'error', text: 'Preencha o Phone Number ID e o Access Token.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const scope = 'private' as const;
      const settings = [
        { category: 'whatsapp', key: 'phone_number_id', value: phoneNumberId, scope },
        { category: 'whatsapp', key: 'access_token', value: accessToken, scope },
        { category: 'whatsapp', key: 'verify_token', value: verifyToken, scope },
        { category: 'whatsapp', key: 'is_configured', value: 'true', scope },
        { category: 'whatsapp', key: 'auto_reply_enabled', value: autoReplyEnabled.toString(), scope },
        { category: 'whatsapp', key: 'welcome_message', value: welcomeMessage, scope },
        { category: 'whatsapp', key: 'business_hours_only', value: businessHoursOnly.toString(), scope },
      ];


      for (const setting of settings) {
        const { error } = await supabase.
        from('settings').
        upsert(setting, { onConflict: 'category,key' });

        if (error) throw error;
      }

      // Update integration status
      await supabase
        .from('settings')
        .upsert(
          { category: 'integrations', key: 'whatsapp_status', value: 'connected', scope },
          { onConflict: 'category,key' }
        );

      setIsConfigured(true);
      setMessage({ type: 'success', text: 'Configurações do WhatsApp salvas com sucesso!' });
    } catch (err) {
      console.error('Error saving WhatsApp settings:', err);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_4752c072a2" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_93de20b177" className="mb-8">
        <h1 data-ev-id="ev_764befdd88" className="text-2xl font-bold text-gray-900">Atendimento e WhatsApp</h1>
        <p data-ev-id="ev_d0892a4dee" className="text-gray-600 mt-1">Configure a integração com WhatsApp Business API</p>
      </div>

      {message &&
      <div data-ev-id="ev_4bbf5f0dc7" className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
      message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`
      }>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      }

      <div data-ev-id="ev_86f4269059" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_ff4a92cb4b" className="lg:col-span-2 flex flex-col gap-6">
          {/* API Configuration */}
          <div data-ev-id="ev_210c7492d6" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_548eb02e58" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" /> Configuração da API
            </h2>

            <div data-ev-id="ev_e49adba489" className="flex flex-col gap-4">
              <div data-ev-id="ev_90260f6e43">
                <label data-ev-id="ev_f0bf4393cf" className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                <input data-ev-id="ev_0f4acb94cb"
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Ex: 123456789012345"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>

              <div data-ev-id="ev_e61be725f5">
                <label data-ev-id="ev_ad69f9ee9a" className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <div data-ev-id="ev_23c8c26e4a" className="relative">
                  <input data-ev-id="ev_61688a4a86"
                  type={showToken ? 'text' : 'password'}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Seu token de acesso"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none pr-12" />

                  <button data-ev-id="ev_ec617108f1"
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">

                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div data-ev-id="ev_5502a256c4">
                <label data-ev-id="ev_f5a7a33e6e" className="block text-sm font-medium text-gray-700 mb-1">Verify Token (Webhook)</label>
                <input data-ev-id="ev_900432afdd"
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Token para verificação do webhook"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          </div>

          {/* Auto Reply */}
          <div data-ev-id="ev_09a26d9c92" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_82b38b723e" className="text-lg font-semibold text-gray-900 mb-4">Resposta Automática</h2>

            <div data-ev-id="ev_9d58588430" className="flex flex-col gap-4">
              <label data-ev-id="ev_42264a7f1c" className="flex items-center gap-3 cursor-pointer">
                <input data-ev-id="ev_49ac036b56"
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />

                <span data-ev-id="ev_12115e2ba8" className="text-gray-700">Habilitar resposta automática</span>
              </label>

              {autoReplyEnabled &&
              <>
                  <div data-ev-id="ev_9ef718e926">
                    <label data-ev-id="ev_8be46e3218" className="block text-sm font-medium text-gray-700 mb-1">Mensagem de boas-vindas</label>
                    <textarea data-ev-id="ev_a0400a0d26"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />

                  </div>

                  <label data-ev-id="ev_2124dc579e" className="flex items-center gap-3 cursor-pointer">
                    <input data-ev-id="ev_f9271002cd"
                  type="checkbox"
                  checked={businessHoursOnly}
                  onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />

                    <span data-ev-id="ev_0dfb6ef5b5" className="text-gray-700">Apenas fora do horário comercial</span>
                  </label>
                </>
              }
            </div>
          </div>

          {/* Save Button */}
          <div data-ev-id="ev_fefc1e1abf" className="flex justify-end">
            <button data-ev-id="ev_2c23ca6fdf"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">

              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_550a72994d" className="flex flex-col gap-6">
          {/* Status */}
          <div data-ev-id="ev_d1887cbe03" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_501408490d" className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div data-ev-id="ev_9e16b80fce" className={`flex items-center gap-2 p-3 rounded-lg ${
            isConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`
            }>
              {isConfigured ?
              <><CheckCircle className="w-5 h-5" /> Configurado</> :

              <><AlertCircle className="w-5 h-5" /> Pendente</>
              }
            </div>

            {isConfigured &&
            <div data-ev-id="ev_0bf50c8e35" className="mt-4">
                <p data-ev-id="ev_d40f03aa21" className="text-sm text-gray-500 mb-2">Número conectado</p>
                <div data-ev-id="ev_77ab3e9afb" className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span data-ev-id="ev_1a4e643ff9" className="font-mono text-gray-700">Configurado</span>
                </div>
              </div>
            }
          </div>

          {/* Instructions */}
          <div data-ev-id="ev_99085616df" className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 data-ev-id="ev_acc0e373ad" className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" /> Como configurar
            </h3>
            <ol data-ev-id="ev_c8569d6f91" className="text-sm text-blue-700 flex flex-col gap-2 list-decimal pl-4">
              <li data-ev-id="ev_e0074f5dc5">Acesse o Meta Business Suite</li>
              <li data-ev-id="ev_93e9905f8a">Crie um app de WhatsApp Business</li>
              <li data-ev-id="ev_ab5d3ff4a2">Copie o Phone Number ID</li>
              <li data-ev-id="ev_1af8053ae7">Gere um Access Token permanente</li>
              <li data-ev-id="ev_326502f986">Configure o webhook com o Verify Token</li>
            </ol>
          </div>

          {/* Webhook Info */}
          <div data-ev-id="ev_d227579bec" className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 data-ev-id="ev_7640012041" className="font-semibold text-gray-900 mb-2">URL do Webhook</h3>
            <p data-ev-id="ev_191362ec8e" className="text-sm text-gray-500 mb-2">Use esta URL nas configurações do Meta:</p>
            <code data-ev-id="ev_bd5f4a8ba4" className="text-xs bg-gray-200 px-2 py-1 rounded block break-all">
              {window.location.origin}/api/whatsapp/webhook
            </code>
          </div>
        </div>
      </div>
    </AdminLayout>);

}