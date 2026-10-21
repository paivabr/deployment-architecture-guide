import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Info } from
'lucide-react';

type ProviderType = 'mercadopago' | 'asaas';
type Environment = 'sandbox' | 'production';

interface ProviderConfig {
  name: string;
  description: string;
  credentials: {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
    type: 'text' | 'password';
    helpText?: string;
  }[];
}

const providerConfigs: Record<ProviderType, ProviderConfig> = {
  mercadopago: {
    name: 'Mercado Pago',
    description: 'Aceite Pix, cartão de crédito, débito e boleto via Mercado Pago.',
    credentials: [
    {
      key: 'access_token',
      label: 'Access Token',
      placeholder: 'APP_USR-...',
      required: true,
      type: 'password',
      helpText: 'Encontre em: Mercado Pago > Suas integrações > Credenciais'
    },
    {
      key: 'public_key',
      label: 'Public Key',
      placeholder: 'APP_USR-...',
      required: false,
      type: 'text',
      helpText: 'Necessário para pagamentos com cartão'
    },
    {
      key: 'webhook_secret',
      label: 'Segredo do Webhook',
      placeholder: '',
      required: false,
      type: 'password',
      helpText: 'Configure após criar o webhook no Mercado Pago'
    }]

  },
  asaas: {
    name: 'Asaas',
    description: 'Aceite Pix, cartão de crédito e boleto via Asaas. Emite notas fiscais.',
    credentials: [
    {
      key: 'api_key',
      label: 'API Key',
      placeholder: '$aact_...',
      required: true,
      type: 'password',
      helpText: 'Encontre em: Asaas > Configurações > Integrações > API'
    },
    {
      key: 'webhook_token',
      label: 'Token do Webhook',
      placeholder: '',
      required: false,
      type: 'password',
      helpText: 'Configure após criar o webhook no Asaas'
    }]

  }
};

export default function NewProvider() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [isDefault, setIsDefault] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSelectType = (type: ProviderType) => {
    setSelectedType(type);
    setName(providerConfigs[type].name);
    setDescription(providerConfigs[type].description);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !supabase) return;

    setError('');
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('admin-providers', {
        body: {
          action: 'create',
          data: {
            name,
            provider_type: selectedType,
            description,
            environment,
            is_default: isDefault,
            credentials
          }
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      navigate('/admin/pagamentos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar provedor');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCredentialVisibility = (key: string) => {
    setShowCredentials((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AdminLayout>
      <button data-ev-id="ev_72d2fb2587"
      onClick={() => step === 1 ? navigate('/admin/pagamentos') : setStep(1)}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">

        <ArrowLeft className="w-4 h-4" />
        {step === 1 ? 'Voltar' : 'Escolher outro provedor'}
      </button>

      <div data-ev-id="ev_1fa8a6bdb1" className="max-w-2xl">
        <h1 data-ev-id="ev_1cf862b797" className="text-2xl font-bold text-gray-900 mb-2">Adicionar provedor de pagamento</h1>
        <p data-ev-id="ev_f850f0b9f4" className="text-gray-600 mb-8">
          {step === 1 ? 'Escolha o provedor que deseja configurar' : `Configurar ${providerConfigs[selectedType!]?.name}`}
        </p>

        {/* Step 1: Choose Provider */}
        {step === 1 &&
        <div data-ev-id="ev_30c7dd3c69" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(providerConfigs) as ProviderType[]).map((type) =>
          <button data-ev-id="ev_0e8572abaf"
          key={type}
          onClick={() => handleSelectType(type)}
          className="p-6 bg-white border-2 border-gray-200 hover:border-primary rounded-xl text-left transition-colors">

                <div data-ev-id="ev_32c437f0b3" className="text-3xl mb-3">
                  {type === 'mercadopago' ? '🟢' : '🔵'}
                </div>
                <h3 data-ev-id="ev_ad4c560cc3" className="text-lg font-semibold text-gray-900">
                  {providerConfigs[type].name}
                </h3>
                <p data-ev-id="ev_d2ad57d9c4" className="text-sm text-gray-600 mt-1">
                  {providerConfigs[type].description}
                </p>
              </button>
          )}
          </div>
        }

        {/* Step 2: Configure Provider */}
        {step === 2 && selectedType &&
        <form data-ev-id="ev_fb33988ba7" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error &&
          <div data-ev-id="ev_be9b932530" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p data-ev-id="ev_9139271f85" className="text-sm text-red-700">{error}</p>
              </div>
          }

            {/* Basic Info */}
            <div data-ev-id="ev_d58539a909" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_020a29d994" className="text-lg font-semibold text-gray-900 mb-4">Informações básicas</h2>
              
              <div data-ev-id="ev_5799fac3fc" className="flex flex-col gap-4">
                <div data-ev-id="ev_72c78ab7cb">
                  <label data-ev-id="ev_d141720d33" htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da integração
                  </label>
                  <input data-ev-id="ev_fe9d0564f3"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

                </div>

                <div data-ev-id="ev_62a34a9714">
                  <label data-ev-id="ev_239d9eec23" htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <input data-ev-id="ev_7a588ea511"
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />

                </div>

                <div data-ev-id="ev_ebd577b60b">
                  <label data-ev-id="ev_661dfc37fc" className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
                  <div data-ev-id="ev_ade52957ce" className="flex gap-4">
                    <label data-ev-id="ev_f1ff4a3cc5" className="flex items-center gap-2 cursor-pointer">
                      <input data-ev-id="ev_b651167e3f"
                    type="radio"
                    name="environment"
                    value="sandbox"
                    checked={environment === 'sandbox'}
                    onChange={() => setEnvironment('sandbox')}
                    className="w-4 h-4 text-primary" />

                      <span data-ev-id="ev_75d5304949" className="text-gray-700">🧪 Testes (Sandbox)</span>
                    </label>
                    <label data-ev-id="ev_4749132454" className="flex items-center gap-2 cursor-pointer">
                      <input data-ev-id="ev_f30a72ac89"
                    type="radio"
                    name="environment"
                    value="production"
                    checked={environment === 'production'}
                    onChange={() => setEnvironment('production')}
                    className="w-4 h-4 text-primary" />

                      <span data-ev-id="ev_211e6d8282" className="text-gray-700">🚀 Produção</span>
                    </label>
                  </div>
                  {environment === 'production' &&
                <p data-ev-id="ev_ab2f6b0020" className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                      ⚠️ Cobranças reais serão efetuadas. Certifique-se de que as credenciais estão corretas.
                    </p>
                }
                </div>

                <label data-ev-id="ev_e8b2a23d96" className="flex items-center gap-2 cursor-pointer">
                  <input data-ev-id="ev_ea63f9d016"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-primary rounded" />

                  <span data-ev-id="ev_a333bbb132" className="text-gray-700">Definir como provedor padrão</span>
                </label>
              </div>
            </div>

            {/* Credentials */}
            <div data-ev-id="ev_ddbf594265" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_d55e88ddeb" className="text-lg font-semibold text-gray-900 mb-4">Credenciais</h2>
              <p data-ev-id="ev_680a550202" className="text-sm text-gray-600 mb-4">
                Suas credenciais são criptografadas e nunca são exibidas no navegador após o cadastro.
              </p>
              
              <div data-ev-id="ev_2197e344a9" className="flex flex-col gap-4">
                {providerConfigs[selectedType].credentials.map((cred) =>
              <div data-ev-id="ev_275ba9e88b" key={cred.key}>
                    <label data-ev-id="ev_134914c531" htmlFor={cred.key} className="block text-sm font-medium text-gray-700 mb-1">
                      {cred.label}
                      {cred.required && <span data-ev-id="ev_f8d98c9b20" className="text-red-500">*</span>}
                    </label>
                    <div data-ev-id="ev_96948036f6" className="relative">
                      <input data-ev-id="ev_7ca31daf2b"
                  id={cred.key}
                  type={cred.type === 'password' && !showCredentials[cred.key] ? 'password' : 'text'}
                  value={credentials[cred.key] || ''}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, [cred.key]: e.target.value }))}
                  required={cred.required}
                  placeholder={cred.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-12" />

                      {cred.type === 'password' &&
                  <button data-ev-id="ev_155ec826da"
                  type="button"
                  onClick={() => toggleCredentialVisibility(cred.key)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">

                          {showCredentials[cred.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                  }
                    </div>
                    {cred.helpText &&
                <p data-ev-id="ev_310cb2dab6" className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {cred.helpText}
                      </p>
                }
                  </div>
              )}
              </div>
            </div>

            {/* Submit */}
            <div data-ev-id="ev_e5a3a03c5c" className="flex gap-4">
              <button data-ev-id="ev_bdf68be6fe"
            type="button"
            onClick={() => navigate('/admin/pagamentos')}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">

                Cancelar
              </button>
              <button data-ev-id="ev_24bdf781b5"
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">

                {isLoading ?
              <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </> :

              'Salvar provedor'
              }
              </button>
            </div>
          </form>
        }
      </div>
    </AdminLayout>);

}