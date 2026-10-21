import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  CreditCard,
  Plus,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  Zap,
  Globe,
  RefreshCw } from
'lucide-react';

type ProviderStatus = 'not_configured' | 'test_pending' | 'validating' | 'working' | 'attention' | 'failed' | 'disabled';

interface PaymentProvider {
  id: string;
  name: string;
  provider_type: string;
  description: string | null;
  environment: 'sandbox' | 'production';
  status: ProviderStatus;
  is_default: boolean;
  configured_credentials: string[];
  last_test_at: string | null;
  created_at: string;
}

const statusConfig: Record<ProviderStatus, {label: string;color: string;icon: React.ReactNode;}> = {
  not_configured: { label: 'Não configurado', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> },
  test_pending: { label: 'Teste pendente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  validating: { label: 'Validando...', color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  working: { label: 'Funcionando', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  attention: { label: 'Atenção', color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-4 h-4" /> },
  failed: { label: 'Falha', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  disabled: { label: 'Desativado', color: 'bg-gray-100 text-gray-500', icon: <XCircle className="w-4 h-4" /> }
};

const providerTypes: Record<string, {name: string;logo: string;}> = {
  mercadopago: { name: 'Mercado Pago', logo: '🟢' },
  asaas: { name: 'Asaas', logo: '🔵' }
};

export default function PaymentProviders() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    if (!supabase) return;

    try {
      const { data } = await supabase.functions.invoke('admin-providers', {
        body: { action: 'list' }
      });

      if (data?.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTest = async (providerId: string) => {
    if (!supabase) return;

    setTestingId(providerId);
    try {
      await supabase.functions.invoke('test-integration', {
        body: { providerId }
      });
      await fetchProviders();
    } catch (error) {
      console.error('Error testing provider:', error);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_0a43f2a1de" className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_53397cc63e">
          <h1 data-ev-id="ev_80ca6a6ce8" className="text-2xl font-bold text-gray-900">Pagamentos e APIs</h1>
          <p data-ev-id="ev_a856434159" className="text-gray-600 mt-1">Configure provedores de pagamento e métodos aceitos</p>
        </div>
        <Link data-ev-id="ev_803fe4f40a"
        to="/admin/pagamentos/novo"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">

          <Plus className="w-5 h-5" />
          Adicionar provedor
        </Link>
      </div>

      {/* Tabs */}
      <div data-ev-id="ev_8481811df3" className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button data-ev-id="ev_f7b867d711" className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
          Provedores
        </button>
        <Link data-ev-id="ev_bcc5031e41"
        to="/admin/pagamentos/metodos"
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">

          Métodos
        </Link>
        <Link data-ev-id="ev_ec731f4e17"
        to="/admin/pagamentos/cupons"
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">

          Cupons
        </Link>
        <Link data-ev-id="ev_f90044b7f9"
        to="/admin/pagamentos/webhooks"
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">

          Webhooks
        </Link>
      </div>

      {/* Providers List */}
      {isLoading ?
      <div data-ev-id="ev_e6d33ffc05" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div> :
      providers.length === 0 ?
      <div data-ev-id="ev_b8c4999e20" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div data-ev-id="ev_50e2993e23" className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 data-ev-id="ev_5a8f2e0205" className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum provedor configurado
          </h3>
          <p data-ev-id="ev_dd6f222997" className="text-gray-600 mb-6 max-w-md mx-auto">
            Adicione um provedor de pagamento para começar a aceitar Pix, cartão de crédito e boleto.
          </p>
          <Link data-ev-id="ev_51c31ab9eb"
        to="/admin/pagamentos/novo"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">

            <Plus className="w-5 h-5" />
            Adicionar provedor de pagamento
          </Link>
        </div> :

      <div data-ev-id="ev_21cfc34f6c" className="flex flex-col gap-4">
          {providers.map((provider) => {
          const status = statusConfig[provider.status];
          const type = providerTypes[provider.provider_type] || { name: provider.provider_type, logo: '💳' };

          return (
            <div data-ev-id="ev_d1b5e6d6b0"
            key={provider.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">

                <div data-ev-id="ev_37de8d76b5" className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Provider Info */}
                  <div data-ev-id="ev_e6fa4736b0" className="flex items-start gap-4 flex-1">
                    <div data-ev-id="ev_9d0312d415" className="text-3xl">{type.logo}</div>
                    <div data-ev-id="ev_5de572aadd" className="flex-1">
                      <div data-ev-id="ev_548250fc30" className="flex items-center gap-3 flex-wrap">
                        <h3 data-ev-id="ev_d3563fe496" className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                        {provider.is_default &&
                      <span data-ev-id="ev_74b363ce7f" className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                            Padrão
                          </span>
                      }
                        <span data-ev-id="ev_4b4a8ea422" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <p data-ev-id="ev_84c148a8e2" className="text-sm text-gray-600 mt-1">
                        {type.name} • {provider.environment === 'sandbox' ? 'Ambiente de testes' : 'Produção'}
                      </p>
                      {provider.configured_credentials.length > 0 &&
                    <p data-ev-id="ev_f275dd76d7" className="text-xs text-gray-500 mt-2">
                          Credenciais configuradas: {provider.configured_credentials.join(', ')}
                        </p>
                    }
                    </div>
                  </div>

                  {/* Actions */}
                  <div data-ev-id="ev_f77f82fc21" className="flex items-center gap-3">
                    <button data-ev-id="ev_07ff48e7cb"
                  onClick={() => handleTest(provider.id)}
                  disabled={testingId === provider.id || provider.configured_credentials.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

                      {testingId === provider.id ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Zap className="w-4 h-4" />
                    }
                      Testar
                    </button>
                    <Link data-ev-id="ev_65243ce126"
                  to={`/admin/pagamentos/${provider.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">

                      <Settings className="w-4 h-4" />
                      Configurar
                    </Link>
                  </div>
                </div>
              </div>);

        })}
        </div>
      }

      {/* Help Section */}
      <div data-ev-id="ev_1240c099ad" className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <h3 data-ev-id="ev_c7b1f2bd38" className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
        <ol data-ev-id="ev_392fa449a0" className="text-sm text-blue-800 flex flex-col gap-2">
          <li data-ev-id="ev_7d40e37e7d" className="flex items-start gap-2">
            <span data-ev-id="ev_a2ae17653f" className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span data-ev-id="ev_aaaddd577e">Adicione um provedor de pagamento (Mercado Pago ou Asaas)</span>
          </li>
          <li data-ev-id="ev_75fb98f547" className="flex items-start gap-2">
            <span data-ev-id="ev_1fb4ceeffc" className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span data-ev-id="ev_c103de1884">Insira suas credenciais (Access Token, API Key) — elas são criptografadas e nunca aparecem no navegador</span>
          </li>
          <li data-ev-id="ev_1445c67245" className="flex items-start gap-2">
            <span data-ev-id="ev_d0c49bebb3" className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span data-ev-id="ev_d09fde23dd">Teste a integração para verificar se as credenciais estão corretas</span>
          </li>
          <li data-ev-id="ev_b783b377de" className="flex items-start gap-2">
            <span data-ev-id="ev_3f3c3014af" className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span data-ev-id="ev_932ffd797e">Configure o webhook no painel do provedor para receber notificações de pagamento</span>
          </li>
          <li data-ev-id="ev_cfd131cf41" className="flex items-start gap-2">
            <span data-ev-id="ev_8e25c4e141" className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
            <span data-ev-id="ev_1ae71d17f9">Ative os métodos de pagamento que deseja oferecer (Pix, Cartão, Boleto)</span>
          </li>
        </ol>
      </div>
    </AdminLayout>);

}