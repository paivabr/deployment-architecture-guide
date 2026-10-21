import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Zap,
  Copy,
  ExternalLink,
  ToggleLeft,
  ToggleRight } from
'lucide-react';

interface PaymentMethod {
  id: string;
  method_type: string;
  is_enabled: boolean;
  display_name: string;
}

interface Provider {
  id: string;
  name: string;
  provider_type: string;
  description: string;
  environment: 'sandbox' | 'production';
  status: string;
  is_default: boolean;
  configured_credentials: string[];
  payment_methods: PaymentMethod[];
  last_test_at: string | null;
  last_test_result: {checks?: {name: string;passed: boolean;message: string;}[];} | null;
}

const credentialFields: Record<string, {key: string;label: string;placeholder: string;}[]> = {
  mercadopago: [
  { key: 'access_token', label: 'Access Token', placeholder: 'APP_USR-...' },
  { key: 'public_key', label: 'Public Key', placeholder: 'APP_USR-...' },
  { key: 'webhook_secret', label: 'Segredo do Webhook', placeholder: '' }],

  asaas: [
  { key: 'api_key', label: 'API Key', placeholder: '$aact_...' },
  { key: 'webhook_token', label: 'Token do Webhook', placeholder: '' }]

};

export default function ProviderConfig() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isDefault, setIsDefault] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  const webhookUrl = `https://vzqevpwjyyagehoqktqv.supabase.co/functions/v1/payment-webhook?provider=${provider?.provider_type || ''}`;

  const fetchProvider = useCallback(async () => {
    if (!supabase || !id) return;
    try {
      const { data } = await supabase.functions.invoke('admin-providers', {
        body: { action: 'get', providerId: id }
      });
      if (data?.provider) {
        setProvider(data.provider);
        setName(data.provider.name);
        setDescription(data.provider.description || '');
        setEnvironment(data.provider.environment);
        setIsDefault(data.provider.is_default);
      }
    } catch (err) {
      setError('Erro ao carregar provedor');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const handleSave = async () => {
    if (!supabase || !id) return;
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-providers', {
        body: {
          action: 'update',
          providerId: id,
          data: { name, description, environment, is_default: isDefault, credentials: Object.keys(credentials).length > 0 ? credentials : undefined }
        }
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setSuccess('Configurações salvas!');
      setCredentials({});
      fetchProvider();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!supabase || !id) return;
    setIsTesting(true);
    setError('');
    try {
      await supabase.functions.invoke('test-integration', { body: { providerId: id } });
      fetchProvider();
    } catch (err) {
      setError('Erro ao testar integração');
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleMethod = async (methodId: string, currentEnabled: boolean) => {
    if (!supabase) return;
    try {
      await supabase.from('payment_methods_config').update({ is_enabled: !currentEnabled }).eq('id', methodId);
      fetchProvider();
    } catch (err) {
      setError('Erro ao atualizar método');
    }
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setSuccess('URL copiada!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_14a67d96a7" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>);

  }

  if (!provider) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_df7fd47434" className="text-center py-12">
          <p data-ev-id="ev_004bf25030" className="text-gray-600">Provedor não encontrado</p>
        </div>
      </AdminLayout>);

  }

  const fields = credentialFields[provider.provider_type] || [];

  return (
    <AdminLayout>
      <button data-ev-id="ev_87491cdb13" onClick={() => navigate('/admin/pagamentos')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div data-ev-id="ev_436582bef4" className="flex flex-col lg:flex-row gap-6">
        {/* Main Config */}
        <div data-ev-id="ev_20f240a73c" className="flex-1 flex flex-col gap-6">
          <div data-ev-id="ev_4bc4e61626" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_eab0698aee" className="text-lg font-semibold text-gray-900 mb-4">Configurações</h2>
            
            {error &&
            <div data-ev-id="ev_af5972f0d8" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            }
            {success &&
            <div data-ev-id="ev_0875d3e0d5" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            }

            <div data-ev-id="ev_1491d7af5f" className="flex flex-col gap-4">
              <div data-ev-id="ev_d2c0089e52">
                <label data-ev-id="ev_d2063885da" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input data-ev-id="ev_d21a18cf58" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div data-ev-id="ev_d74dbee925">
                <label data-ev-id="ev_41380ba749" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input data-ev-id="ev_d694ba1dc4" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>
              <div data-ev-id="ev_561ebb11a2">
                <label data-ev-id="ev_dcedfa1900" className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
                <div data-ev-id="ev_05c1dab9c7" className="flex gap-4">
                  <label data-ev-id="ev_018c34d01c" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_c90075cf94" type="radio" checked={environment === 'sandbox'} onChange={() => setEnvironment('sandbox')} className="w-4 h-4 text-primary" />
                    <span data-ev-id="ev_7e502b2db6">🧪 Testes</span>
                  </label>
                  <label data-ev-id="ev_c71b75c9cc" className="flex items-center gap-2 cursor-pointer">
                    <input data-ev-id="ev_b9c3703cd3" type="radio" checked={environment === 'production'} onChange={() => setEnvironment('production')} className="w-4 h-4 text-primary" />
                    <span data-ev-id="ev_881f682a8e">🚀 Produção</span>
                  </label>
                </div>
                {environment === 'production' &&
                <p data-ev-id="ev_ea32243f09" className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">⚠️ Cobranças reais serão efetuadas</p>
                }
              </div>
              <label data-ev-id="ev_fa9ec9b847" className="flex items-center gap-2 cursor-pointer">
                <input data-ev-id="ev_f8cfe03e3c" type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                <span data-ev-id="ev_444d01ea85">Definir como provedor padrão</span>
              </label>
            </div>
          </div>

          {/* Credentials */}
          <div data-ev-id="ev_0c437ace1a" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_62a94d37fb" className="text-lg font-semibold text-gray-900 mb-2">Credenciais</h2>
            <p data-ev-id="ev_5e407e4695" className="text-sm text-gray-600 mb-4">Deixe em branco para manter as credenciais atuais.</p>
            
            <div data-ev-id="ev_4414d65619" className="flex flex-col gap-4">
              {fields.map((field) => {
                const isConfigured = provider.configured_credentials.includes(field.key);
                return (
                  <div data-ev-id="ev_5fb160a629" key={field.key}>
                    <label data-ev-id="ev_4dc4405043" className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {isConfigured && <span data-ev-id="ev_b7fc4bfb81" className="ml-2 text-xs text-green-600">✓ Configurada</span>}
                    </label>
                    <div data-ev-id="ev_349a93dc4c" className="relative">
                      <input data-ev-id="ev_ab06118eb1"
                      type={showCredentials[field.key] ? 'text' : 'password'}
                      value={credentials[field.key] || ''}
                      onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={isConfigured ? '••••••••' : field.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-12" />

                      <button data-ev-id="ev_a85746a1a9" type="button" onClick={() => setShowCredentials((prev) => ({ ...prev, [field.key]: !prev[field.key] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showCredentials[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>);

              })}
            </div>

            <button data-ev-id="ev_908ea6df9a" onClick={handleSave} disabled={isSaving} className="mt-6 w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar alterações'}
            </button>
          </div>

          {/* Webhook */}
          <div data-ev-id="ev_07491722d5" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_ab14382d54" className="text-lg font-semibold text-gray-900 mb-2">Webhook</h2>
            <p data-ev-id="ev_7bfb4f46f1" className="text-sm text-gray-600 mb-4">Configure essa URL no painel do {provider.provider_type === 'mercadopago' ? 'Mercado Pago' : 'Asaas'}.</p>
            
            <div data-ev-id="ev_e34f58f596" className="flex items-center gap-2">
              <input data-ev-id="ev_b0daf7b587" type="text" value={webhookUrl} readOnly className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600" />
              <button data-ev-id="ev_5948cf9d9b" onClick={() => copyToClipboard(webhookUrl)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <a data-ev-id="ev_94b779e2d2" href={provider.provider_type === 'mercadopago' ? 'https://www.mercadopago.com.br/developers/panel/app' : 'https://www.asaas.com/config/webhooks'} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Abrir painel do provedor <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_cccbe5d399" className="w-full lg:w-80 flex flex-col gap-6">
          {/* Status */}
          <div data-ev-id="ev_bf9da6b809" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_4487cd39b6" className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            
            <div data-ev-id="ev_2cdf164415" className={`p-4 rounded-lg ${provider.status === 'working' ? 'bg-green-50' : provider.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <div data-ev-id="ev_d0afb682eb" className="flex items-center gap-2 mb-2">
                {provider.status === 'working' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-yellow-600" />}
                <span data-ev-id="ev_5db6d9173a" className={`font-medium ${provider.status === 'working' ? 'text-green-900' : 'text-yellow-900'}`}>
                  {provider.status === 'working' ? 'Funcionando' : provider.status === 'failed' ? 'Falha' : 'Pendente'}
                </span>
              </div>
              {provider.last_test_result?.checks?.map((check, i) =>
              <div data-ev-id="ev_c6e56c4c17" key={i} className="flex items-center gap-2 text-sm mt-1">
                  {check.passed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <span data-ev-id="ev_6d29824302">{check.name}: {check.message}</span>
                </div>
              )}
            </div>

            <button data-ev-id="ev_9888cc425d" onClick={handleTest} disabled={isTesting || provider.configured_credentials.length === 0} className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {isTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Testando...</> : <><Zap className="w-4 h-4" /> Testar integração</>}
            </button>
          </div>

          {/* Payment Methods */}
          <div data-ev-id="ev_594ec53f85" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_eb38141468" className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h2>
            
            {provider.payment_methods.length === 0 ?
            <p data-ev-id="ev_75d250a609" className="text-sm text-gray-500">Teste a integração para ver os métodos disponíveis.</p> :

            <div data-ev-id="ev_b273c8f191" className="flex flex-col gap-3">
                {provider.payment_methods.map((method) =>
              <button data-ev-id="ev_7221371feb" key={method.id} onClick={() => handleToggleMethod(method.id, method.is_enabled)} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span data-ev-id="ev_397e8a9918" className="font-medium text-gray-900">{method.display_name}</span>
                    {method.is_enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
              )}
              </div>
            }
          </div>
        </div>
      </div>
    </AdminLayout>);

}