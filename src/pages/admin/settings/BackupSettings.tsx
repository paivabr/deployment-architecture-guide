import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  HardDrive,
  RefreshCw,
  Trash2 } from
'lucide-react';

interface Backup {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed';
}

const mockBackups: Backup[] = [
{ id: '1', name: 'backup_2026-10-15_auto', size: '24.5 MB', created_at: '2026-10-15T03:00:00Z', type: 'automatic', status: 'completed' },
{ id: '2', name: 'backup_2026-10-14_auto', size: '24.2 MB', created_at: '2026-10-14T03:00:00Z', type: 'automatic', status: 'completed' },
{ id: '3', name: 'backup_2026-10-13_manual', size: '24.1 MB', created_at: '2026-10-13T14:30:00Z', type: 'manual', status: 'completed' },
{ id: '4', name: 'backup_2026-10-12_auto', size: '23.8 MB', created_at: '2026-10-12T03:00:00Z', type: 'automatic', status: 'completed' }];


export default function BackupSettings() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => setIsCreating(false), 3000);
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_7aa635c77d" className="mb-8">
        <h1 data-ev-id="ev_6f99209591" className="text-2xl font-bold text-gray-900">Backup e Manutenção</h1>
        <p data-ev-id="ev_e02a547771" className="text-gray-600 mt-1">Gerencie backups e recuperação de dados</p>
      </div>

      <div data-ev-id="ev_0cbeb26571" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_a9c856f649" className="lg:col-span-2 flex flex-col gap-6">
          {/* Quick Actions */}
          <div data-ev-id="ev_81e415e03a" className="grid grid-cols-2 gap-4">
            <button data-ev-id="ev_88af99419e"
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">

              <div data-ev-id="ev_8d4bc2b57e" className="flex items-center gap-4">
                <div data-ev-id="ev_6497113344" className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  {isCreating ? <RefreshCw className="w-6 h-6 text-primary animate-spin" /> : <Download className="w-6 h-6 text-primary" />}
                </div>
                <div data-ev-id="ev_7cad56f324">
                  <p data-ev-id="ev_6633ebd28d" className="font-semibold text-gray-900">{isCreating ? 'Criando...' : 'Criar backup agora'}</p>
                  <p data-ev-id="ev_9e551b1d8c" className="text-sm text-gray-500">Backup manual instantâneo</p>
                </div>
              </div>
            </button>

            <button data-ev-id="ev_c12c3b484e" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
              <div data-ev-id="ev_f8441a3dd4" className="flex items-center gap-4">
                <div data-ev-id="ev_b627af97a5" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div data-ev-id="ev_a82e5815db">
                  <p data-ev-id="ev_2f41d5eedc" className="font-semibold text-gray-900">Restaurar backup</p>
                  <p data-ev-id="ev_42b54742a3" className="text-sm text-gray-500">Recuperar de um ponto anterior</p>
                </div>
              </div>
            </button>
          </div>

          {/* Backup Settings */}
          <div data-ev-id="ev_bd15913a59" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_b4f98fba64" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Backup Automático
            </h2>

            <div data-ev-id="ev_1bc85d0658" className="flex flex-col gap-4">
              <label data-ev-id="ev_c06eea886f" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div data-ev-id="ev_9a57a3cb21">
                  <p data-ev-id="ev_9dc9caec2a" className="font-medium text-gray-900">Habilitar backup automático</p>
                  <p data-ev-id="ev_d2c8ee6ed2" className="text-sm text-gray-500">Backups são criados automaticamente</p>
                </div>
                <input data-ev-id="ev_640c011090"
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                className="w-5 h-5 text-primary rounded" />

              </label>

              {autoBackup &&
              <div data-ev-id="ev_82033ccb40" className="grid grid-cols-2 gap-4">
                  <div data-ev-id="ev_d5962e874d">
                    <label data-ev-id="ev_3b3d0f36b2" className="block text-sm font-medium text-gray-700 mb-1">Frequência</label>
                    <select data-ev-id="ev_4accca6ad2"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                      <option data-ev-id="ev_13c88318b1" value="hourly">A cada hora</option>
                      <option data-ev-id="ev_07104281e6" value="daily">Diário</option>
                      <option data-ev-id="ev_b71ad5f291" value="weekly">Semanal</option>
                    </select>
                  </div>
                  <div data-ev-id="ev_e0948c7415">
                    <label data-ev-id="ev_5dc16b6e11" className="block text-sm font-medium text-gray-700 mb-1">Retenção (dias)</label>
                    <input data-ev-id="ev_0468da3884"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  min="7"
                  max="365"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                </div>
              }
            </div>
          </div>

          {/* Backup History */}
          <div data-ev-id="ev_fda6bb08b6" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div data-ev-id="ev_7b8ca680e7" className="p-4 border-b border-gray-200">
              <h2 data-ev-id="ev_610f59f8e2" className="text-lg font-semibold text-gray-900">Histórico de Backups</h2>
            </div>
            <table data-ev-id="ev_699301c966" className="w-full">
              <thead data-ev-id="ev_5ca1980c94" className="bg-gray-50 border-b border-gray-200">
                <tr data-ev-id="ev_fe2199c77b">
                  <th data-ev-id="ev_36d234e6da" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th data-ev-id="ev_0f09727741" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th data-ev-id="ev_a2a38dcaa2" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th data-ev-id="ev_a0551200d9" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th data-ev-id="ev_ae8c0124a3" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody data-ev-id="ev_9c2e0f27ee" className="divide-y divide-gray-200">
                {mockBackups.map((backup) =>
                <tr data-ev-id="ev_f6ff4d3152" key={backup.id} className="hover:bg-gray-50">
                    <td data-ev-id="ev_74ad94e487" className="px-6 py-4">
                      <div data-ev-id="ev_538aa3b20d" className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <span data-ev-id="ev_41957ccca7" className="text-sm font-medium text-gray-900">{backup.name}</span>
                      </div>
                    </td>
                    <td data-ev-id="ev_85ea929ad6" className="px-6 py-4 text-sm text-gray-600">{backup.size}</td>
                    <td data-ev-id="ev_3d23b728ea" className="px-6 py-4">
                      <div data-ev-id="ev_a01820e6d6" className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(backup.created_at).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td data-ev-id="ev_3916ff1862" className="px-6 py-4">
                      <span data-ev-id="ev_f8b3663d74" className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.type === 'automatic' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`
                    }>
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </span>
                    </td>
                    <td data-ev-id="ev_7ac2d31442" className="px-6 py-4">
                      <div data-ev-id="ev_09a6d7c2f6" className="flex items-center justify-end gap-2">
                        <button data-ev-id="ev_5e9416c3b7" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                        <button data-ev-id="ev_db372adc95" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_8aa48cf31c" className="flex flex-col gap-6">
          <div data-ev-id="ev_d62576625a" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_4f86bd3589" className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            
            <div data-ev-id="ev_8c387513ee" className="flex flex-col gap-4">
              <div data-ev-id="ev_522fc2af91" className="flex items-center justify-between">
                <span data-ev-id="ev_b81c76e90d" className="text-sm text-gray-600">Último backup</span>
                <span data-ev-id="ev_4c0a2d239c" className="text-sm font-medium text-gray-900">Hoje, 03:00</span>
              </div>
              <div data-ev-id="ev_55c12bd221" className="flex items-center justify-between">
                <span data-ev-id="ev_36e7fe443e" className="text-sm text-gray-600">Próximo backup</span>
                <span data-ev-id="ev_364571d04f" className="text-sm font-medium text-gray-900">Amanhã, 03:00</span>
              </div>
              <div data-ev-id="ev_29995ccbe8" className="flex items-center justify-between">
                <span data-ev-id="ev_a35d2394ff" className="text-sm text-gray-600">Espaço usado</span>
                <span data-ev-id="ev_e529d4f245" className="text-sm font-medium text-gray-900">96.6 MB</span>
              </div>
            </div>

            <div data-ev-id="ev_22d4c66795" className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span data-ev-id="ev_22e67ce2e7" className="text-sm text-green-700">Todos os backups estão OK</span>
            </div>
          </div>

          <div data-ev-id="ev_c18f2634f7" className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <div data-ev-id="ev_f66effe21c" className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div data-ev-id="ev_a0fddbbce0">
                <h3 data-ev-id="ev_907f9c4a3b" className="font-semibold text-yellow-900">Importante</h3>
                <p data-ev-id="ev_9377981e8f" className="text-sm text-yellow-700 mt-1">
                  Backups incluem apenas dados do banco. Vídeos e arquivos estão nos provedores externos (Panda Video, Storage).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}