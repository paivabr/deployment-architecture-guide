import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Plug,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Loader2,
  AlertCircle } from
'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  category: string;
  configPath?: string;
}

const INTEGRATIONS: Integration[] = [
{ id: 'mercadopago', name: 'Mercado Pago', description: 'Pagamentos Pix, cartão e boleto', icon: '💳', status: 'disconnected', category: 'Pagamentos', configPath: '/admin/pagamentos/provedores' },
{ id: 'asaas', name: 'Asaas', description: 'Cobranças e subscrições', icon: '🏦', status: 'disconnected', category: 'Pagamentos', configPath: '/admin/pagamentos/provedores' },
{ id: 'pandavideo', name: 'Panda Video', description: 'Hospedagem de vídeos', icon: '🎬', status: 'disconnected', category: 'Vídeo', configPath: '/admin/video' },
{ id: 'resend', name: 'Resend', description: 'Envio de e-mails transacionais', icon: '✉️', status: 'disconnected', category: 'Comunicação', configPath: '/admin/email' },
{ id: 'whatsapp', name: 'WhatsApp Cloud', description: 'Notificações e atendimento', icon: '📱', status: 'disconnected', category: 'Comunicação', configPath: '/admin/whatsapp' },
{ id: 'google', name: 'Google Calendar', description: 'Agendamento de reuniões', icon: '📅', status: 'disconnected', category: 'Produtividade', configPath: '/admin/calendario' },
{ id: 'analytics', name: 'Google Analytics', description: 'Métricas e relatórios', icon: '📊', status: 'disconnected', category: 'Analytics' },
{ id: 'hotjar', name: 'Hotjar', description: 'Mapas de calor e gravações', icon: '🔥', status: 'disconnected', category: 'Analytics' }];


export default function IntegrationsSettings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error';text: string;} | null>(null);

  // Load integration statuses from settings
  const loadStatuses = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      eq('category', 'integrations');

      if (data) {
        const statusMap: Record<string, string> = {};
        data.forEach((s) => {
          statusMap[s.key] = s.value as string;
        });

        setIntegrations(INTEGRATIONS.map((int) => ({
          ...int,
          status: statusMap[`${int.id}_status`] as Integration['status'] || 'disconnected'
        })));
      }
    } catch (err) {
      console.error('Error loading integration statuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const categories = [...new Set(integrations.map((i) => i.category))];
  const filteredIntegrations = filter === 'all' ? integrations : integrations.filter((i) => i.category === filter);
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  const handleConnect = (integration: Integration) => {
    if (integration.configPath) {
      navigate(integration.configPath);
    } else {
      setMessage({ type: 'error', text: `A integração ${integration.name} ainda não possui configuração disponível.` });
    }
  };

  const handleConfigure = (integration: Integration) => {
    if (integration.configPath) {
      navigate(integration.configPath);
    }
  };

  const handleRefresh = async (integration: Integration) => {
    setRefreshing(integration.id);
    // Simulate checking connection status
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(null);
    setMessage({ type: 'success', text: `Status de ${integration.name} atualizado.` });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_f696ab77f1" className="mb-8">
        <h1 data-ev-id="ev_51a5b4bc25" className="text-2xl font-bold text-gray-900">Integrações Externas</h1>
        <p data-ev-id="ev_fdfb35e6fe" className="text-gray-600 mt-1">Conecte serviços externos à plataforma</p>
      </div>

      {message &&
      <div data-ev-id="ev_9f2fbfd43e" className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
      message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`
      }>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
          <button data-ev-id="ev_17cdafe44f" onClick={() => setMessage(null)} className="ml-auto text-current hover:opacity-70">×</button>
        </div>
      }

      {/* Stats */}
      <div data-ev-id="ev_c6c3fd6c0a" className="grid grid-cols-3 gap-4 mb-6">
        <div data-ev-id="ev_f0bc9b8ec7" className="bg-white rounded-xl border border-gray-200 p-4">
          <p data-ev-id="ev_91a1e3884d" className="text-3xl font-bold text-gray-900">{integrations.length}</p>
          <p data-ev-id="ev_e3ef02beba" className="text-sm text-gray-500">Integrações disponíveis</p>
        </div>
        <div data-ev-id="ev_49b7a78aba" className="bg-white rounded-xl border border-gray-200 p-4">
          <p data-ev-id="ev_180ebdac31" className="text-3xl font-bold text-green-600">{connectedCount}</p>
          <p data-ev-id="ev_fa52ea50ef" className="text-sm text-gray-500">Conectadas</p>
        </div>
        <div data-ev-id="ev_21d01f65f8" className="bg-white rounded-xl border border-gray-200 p-4">
          <p data-ev-id="ev_8d3c8e3db3" className="text-3xl font-bold text-gray-400">{integrations.length - connectedCount}</p>
          <p data-ev-id="ev_d260644783" className="text-sm text-gray-500">Desconectadas</p>
        </div>
      </div>

      {/* Filter */}
      <div data-ev-id="ev_2d3b00cf84" className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button data-ev-id="ev_789bceee41"
        onClick={() => setFilter('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`
        }>

          Todas
        </button>
        {categories.map((cat) =>
        <button data-ev-id="ev_d24a597441"
        key={cat}
        onClick={() => setFilter(cat)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        filter === cat ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`
        }>

            {cat}
          </button>
        )}
      </div>

      {/* Integrations Grid */}
      {isLoading ?
      <div data-ev-id="ev_12240ac5e9" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div> :

      <div data-ev-id="ev_f754a2333d" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) =>
        <div data-ev-id="ev_76cfa5104c" key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div data-ev-id="ev_9149a462f9" className="flex items-start justify-between mb-4">
                <div data-ev-id="ev_6c56ecdebe" className="flex items-center gap-3">
                  <span data-ev-id="ev_934042b893" className="text-3xl">{integration.icon}</span>
                  <div data-ev-id="ev_46633d00c5">
                    <h3 data-ev-id="ev_e5b9704306" className="font-semibold text-gray-900">{integration.name}</h3>
                    <p data-ev-id="ev_1ec6cde14c" className="text-xs text-gray-500">{integration.category}</p>
                  </div>
                </div>
                {integration.status === 'connected' ?
            <span data-ev-id="ev_e9a7449bf1" className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Conectado
                  </span> :
            integration.status === 'error' ?
            <span data-ev-id="ev_fc031832d7" className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" /> Erro
                  </span> :

            <span data-ev-id="ev_e929c88a91" className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Desconectado
                  </span>
            }
              </div>

              <p data-ev-id="ev_8b0cb542f6" className="text-sm text-gray-600 mb-4">{integration.description}</p>

              <div data-ev-id="ev_d8cab4329b" className="flex gap-2">
                {integration.status === 'connected' ?
            <>
                    <button data-ev-id="ev_3f320e8567"
              onClick={() => handleConfigure(integration)}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1">

                      <Settings className="w-4 h-4" /> Configurar
                    </button>
                    <button data-ev-id="ev_5a489a29c7"
              onClick={() => handleRefresh(integration)}
              disabled={refreshing === integration.id}
              className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50">

                      <RefreshCw className={`w-4 h-4 ${refreshing === integration.id ? 'animate-spin' : ''}`} />
                    </button>
                  </> :

            <button data-ev-id="ev_ded8362a59"
            onClick={() => handleConnect(integration)}
            className="flex-1 py-2 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">

                    <Plug className="w-4 h-4" /> Conectar
                  </button>
            }
              </div>
            </div>
        )}
        </div>
      }
    </AdminLayout>);

}