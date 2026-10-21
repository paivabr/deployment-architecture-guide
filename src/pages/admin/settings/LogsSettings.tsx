import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  ScrollText,
  RefreshCw,
  Download,
  Loader2,
  User,
  Calendar,
  CheckCircle } from
'lucide-react';

interface LogEntry {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  created_at: string;
  user_email?: string;
}

export default function LogsSettings() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState<{type: 'success' | 'error';text: string;} | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      let query = supabase.
      from('audit_log').
      select('id, user_id, action, table_name, record_id, created_at').
      order('created_at', { ascending: false }).
      limit(100);

      if (filter !== 'all') {
        query = query.eq('action', filter);
      }

      const { data } = await query;
      setLogs(data as LogEntry[] || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':return 'bg-green-100 text-green-700';
      case 'update':return 'bg-blue-100 text-blue-700';
      case 'delete':return 'bg-red-100 text-red-700';
      default:return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':return 'Criação';
      case 'update':return 'Atualização';
      case 'delete':return 'Exclusão';
      default:return action;
    }
  };

  const handleExport = () => {
    if (logs.length === 0) {
      setMessage({ type: 'error', text: 'Não há logs para exportar.' });
      return;
    }

    // Create CSV content
    const headers = ['Data/Hora', 'Ação', 'Tabela', 'ID do Registro', 'ID do Usuário'];
    const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleString('pt-BR'),
    getActionLabel(log.action),
    log.table_name || '-',
    log.record_id || '-',
    log.user_id || '-']
    );

    const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].
    join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    setMessage({ type: 'success', text: 'Logs exportados com sucesso!' });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_1d7b5a2efe" className="mb-8">
        <h1 data-ev-id="ev_005317fb36" className="text-2xl font-bold text-gray-900">Registros e Diagnóstico</h1>
        <p data-ev-id="ev_a6e8afb5ad" className="text-gray-600 mt-1">Acompanhe as ações realizadas no sistema</p>
      </div>

      {message &&
      <div data-ev-id="ev_6078f484b9" className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
      message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`
      }>
          <CheckCircle className="w-5 h-5" />
          {message.text}
          <button data-ev-id="ev_e024fda841" onClick={() => setMessage(null)} className="ml-auto text-current hover:opacity-70">×</button>
        </div>
      }

      {/* Filters and Actions */}
      <div data-ev-id="ev_e4c8b0145c" className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div data-ev-id="ev_3df7bdd612" className="flex gap-2 flex-wrap">
          {['all', 'create', 'update', 'delete'].map((f) =>
          <button data-ev-id="ev_d875a2e0f0"
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          filter === f ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`
          }>

              {f === 'all' ? 'Todos' : f === 'create' ? 'Criação' : f === 'update' ? 'Atualização' : 'Exclusão'}
            </button>
          )}
        </div>
        <div data-ev-id="ev_c1fc2d0322" className="flex gap-2">
          <button data-ev-id="ev_80d9d5175b"
          onClick={fetchLogs}
          disabled={isLoading}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">

            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button data-ev-id="ev_9a14265c2a"
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">

            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ?
      <div data-ev-id="ev_c3504cc791" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div> :
      logs.length === 0 ?
      <div data-ev-id="ev_c21c114ab4" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_96727889ed" className="text-lg font-semibold text-gray-900 mb-2">Nenhum log encontrado</h3>
          <p data-ev-id="ev_84c965a0d5" className="text-gray-600">As ações dos usuários aparecerão aqui.</p>
        </div> :

      <div data-ev-id="ev_47ece5c692" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div data-ev-id="ev_22360fcf68" className="overflow-x-auto">
            <table data-ev-id="ev_853972253f" className="w-full">
              <thead data-ev-id="ev_4cd57b29ea" className="bg-gray-50 border-b border-gray-200">
                <tr data-ev-id="ev_bc05f310bd">
                  <th data-ev-id="ev_6665f9077a" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                  <th data-ev-id="ev_c31780be2a" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                  <th data-ev-id="ev_b90031d780" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th data-ev-id="ev_d1847f676b" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                </tr>
              </thead>
              <tbody data-ev-id="ev_f94d137ab9" className="divide-y divide-gray-200">
                {logs.map((log) =>
              <tr data-ev-id="ev_76a732a65a" key={log.id} className="hover:bg-gray-50">
                    <td data-ev-id="ev_956acfbd39" className="px-6 py-4">
                      <span data-ev-id="ev_e2a630a9e4" className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td data-ev-id="ev_c59ec8cb4b" className="px-6 py-4">
                      <div data-ev-id="ev_02cc0d285c">
                        <p data-ev-id="ev_b50957b923" className="font-medium text-gray-900">{log.table_name || 'N/A'}</p>
                        {log.record_id &&
                    <p data-ev-id="ev_d33974a8c2" className="text-xs text-gray-500 font-mono">{log.record_id.slice(0, 8)}...</p>
                    }
                      </div>
                    </td>
                    <td data-ev-id="ev_58074b8350" className="px-6 py-4">
                      <div data-ev-id="ev_6439acd4a6" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span data-ev-id="ev_fe292f0e3e" className="text-sm text-gray-600 font-mono">
                          {log.user_id ? `${log.user_id.slice(0, 8)}...` : 'Sistema'}
                        </span>
                      </div>
                    </td>
                    <td data-ev-id="ev_738de4b600" className="px-6 py-4">
                      <div data-ev-id="ev_3efe13b246" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span data-ev-id="ev_9d22c075b8" className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </AdminLayout>);

}