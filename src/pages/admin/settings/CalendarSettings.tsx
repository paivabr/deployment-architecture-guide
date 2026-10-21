import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar,
  Video,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  X,
  AlertCircle,
  Trash2,
  Save,
  Loader2 } from
'lucide-react';

interface TimeSlot {
  id: string;
  day: string;
  start: string;
  end: string;
}

const DAYS = [
{ value: 'monday', label: 'Segunda-feira' },
{ value: 'tuesday', label: 'Terça-feira' },
{ value: 'wednesday', label: 'Quarta-feira' },
{ value: 'thursday', label: 'Quinta-feira' },
{ value: 'friday', label: 'Sexta-feira' },
{ value: 'saturday', label: 'Sábado' },
{ value: 'sunday', label: 'Domingo' }];


export default function CalendarSettings() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [zoomConnected, setZoomConnected] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState('60');
  const [bufferTime, setBufferTime] = useState('15');
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('30');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'monday', start: '09:00', end: '17:00' });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error';text: string;} | null>(null);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      eq('category', 'calendar');

      if (data) {
        data.forEach((s) => {
          const val = s.value as string;
          switch (s.key) {
            case 'google_connected':setGoogleConnected(val === 'true');break;
            case 'zoom_connected':setZoomConnected(val === 'true');break;
            case 'default_duration':if (val) setDefaultDuration(val);break;
            case 'buffer_time':if (val) setBufferTime(val);break;
            case 'max_advance_days':if (val) setMaxAdvanceDays(val);break;
            case 'time_slots':
              try {setTimeSlots(JSON.parse(val));} catch {/* ignore */}
              break;
          }
        });
      }
    } catch (err) {
      console.error('Error loading calendar settings:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save a single setting
  const saveSetting = async (key: string, value: string) => {
    if (!supabase) return;
    await supabase.from('settings').upsert(
      { category: 'calendar', key, value, scope: 'private' },
      { onConflict: 'category,key' }
    );
  };

  // Save all settings
  const saveAllSettings = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await saveSetting('default_duration', defaultDuration);
      await saveSetting('buffer_time', bufferTime);
      await saveSetting('max_advance_days', maxAdvanceDays);
      await saveSetting('time_slots', JSON.stringify(timeSlots));
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Add time slot
  const addTimeSlot = () => {
    const slot: TimeSlot = {
      id: Date.now().toString(),
      ...newSlot
    };
    setTimeSlots([...timeSlots, slot]);
    setShowAddSlot(false);
    setNewSlot({ day: 'monday', start: '09:00', end: '17:00' });
  };

  // Remove time slot
  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((s) => s.id !== id));
  };

  // Connect integrations (placeholder - would open OAuth flow)
  const connectGoogle = () => {
    setMessage({ type: 'error', text: 'Integração do Google Calendar requer configuração OAuth. Configure as credenciais na aba Integrações.' });
  };

  const connectZoom = () => {
    setMessage({ type: 'error', text: 'Integração do Zoom requer configuração OAuth. Configure as credenciais na aba Integrações.' });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_ccd4511437" className="mb-8">
        <h1 data-ev-id="ev_00fbb41cd4" className="text-2xl font-bold text-gray-900">Calendário e Reuniões</h1>
        <p data-ev-id="ev_527a34c4d3" className="text-gray-600 mt-1">Configure agendamento e integrações de vídeo</p>
      </div>

      {message &&
      <div data-ev-id="ev_51fb9aa5da" className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
      message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`
      }>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      }

      <div data-ev-id="ev_d359907e7a" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_548cda414f" className="lg:col-span-2 flex flex-col gap-6">
          {/* Integrations */}
          <div data-ev-id="ev_ecb8f96b90" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_a4ce0e17a4" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" /> Integrações de Vídeo
            </h2>

            <div data-ev-id="ev_41aae81e5e" className="flex flex-col gap-4">
              {/* Google Meet */}
              <div data-ev-id="ev_0113278336" className={`p-4 rounded-lg border-2 ${googleConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div data-ev-id="ev_5b7362ecad" className="flex items-center justify-between">
                  <div data-ev-id="ev_31a2767a6c" className="flex items-center gap-3">
                    <div data-ev-id="ev_a48dbdc14f" className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-xl">
                      📹
                    </div>
                    <div data-ev-id="ev_119c434b4d">
                      <p data-ev-id="ev_aa9aa2fb2c" className="font-medium text-gray-900">Google Meet</p>
                      <p data-ev-id="ev_3b590a34e3" className="text-sm text-gray-500">Reuniões via Google Calendar</p>
                    </div>
                  </div>
                  {googleConnected ?
                  <span data-ev-id="ev_4876191719" className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle className="w-4 h-4" /> Conectado
                    </span> :

                  <button data-ev-id="ev_11813ae46d"
                  onClick={connectGoogle}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">

                      Conectar
                    </button>
                  }
                </div>
              </div>

              {/* Zoom */}
              <div data-ev-id="ev_0d0d53b441" className={`p-4 rounded-lg border-2 ${zoomConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div data-ev-id="ev_ae58fa2289" className="flex items-center justify-between">
                  <div data-ev-id="ev_e2bcba93ff" className="flex items-center gap-3">
                    <div data-ev-id="ev_fb98d56eb6" className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      Z
                    </div>
                    <div data-ev-id="ev_3b8109c734">
                      <p data-ev-id="ev_e00e885a0d" className="font-medium text-gray-900">Zoom</p>
                      <p data-ev-id="ev_ba23929b49" className="text-sm text-gray-500">Videoconferências profissionais</p>
                    </div>
                  </div>
                  {zoomConnected ?
                  <span data-ev-id="ev_92e74fc7de" className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle className="w-4 h-4" /> Conectado
                    </span> :

                  <button data-ev-id="ev_95773fc55c"
                  onClick={connectZoom}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">

                      Conectar
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Settings */}
          <div data-ev-id="ev_4c172d41ca" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_4e9af2829b" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Configurações de Agendamento
            </h2>

            <div data-ev-id="ev_e3d82e6d92" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div data-ev-id="ev_0ce34ef23e">
                <label data-ev-id="ev_3eb8cd5f60" className="block text-sm font-medium text-gray-700 mb-1">Duração padrão (min)</label>
                <select data-ev-id="ev_732183c66d"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                  <option data-ev-id="ev_cc35ee02e1" value="15">15 minutos</option>
                  <option data-ev-id="ev_5d02814ab0" value="30">30 minutos</option>
                  <option data-ev-id="ev_f4a677653f" value="45">45 minutos</option>
                  <option data-ev-id="ev_2578589df0" value="60">1 hora</option>
                  <option data-ev-id="ev_57b56e9d7a" value="90">1h30</option>
                  <option data-ev-id="ev_ad25ebadc6" value="120">2 horas</option>
                </select>
              </div>
              <div data-ev-id="ev_069c677ba3">
                <label data-ev-id="ev_ba7bd2669d" className="block text-sm font-medium text-gray-700 mb-1">Intervalo entre reuniões</label>
                <select data-ev-id="ev_38ae10531a"
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                  <option data-ev-id="ev_dc2fc73706" value="0">Sem intervalo</option>
                  <option data-ev-id="ev_3c5212e31a" value="5">5 minutos</option>
                  <option data-ev-id="ev_516bcdcd14" value="10">10 minutos</option>
                  <option data-ev-id="ev_2dff0decd2" value="15">15 minutos</option>
                  <option data-ev-id="ev_dc62d45d52" value="30">30 minutos</option>
                </select>
              </div>
              <div data-ev-id="ev_838a1997d5">
                <label data-ev-id="ev_57714d8111" className="block text-sm font-medium text-gray-700 mb-1">Agendar até (dias)</label>
                <input data-ev-id="ev_a619c9ab60"
                type="number"
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(e.target.value)}
                min="7"
                max="90"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          </div>

          {/* Availability */}
          <div data-ev-id="ev_a39e960150" className="bg-white rounded-xl border border-gray-200 p-6">
            <div data-ev-id="ev_ad573f9f0b" className="flex items-center justify-between mb-4">
              <h2 data-ev-id="ev_d9f6203d25" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Horários Disponíveis
              </h2>
              <button data-ev-id="ev_d5d7a0cde9"
              onClick={() => setShowAddSlot(true)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1">

                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {timeSlots.length === 0 ?
            <div data-ev-id="ev_86e0e7e12f" className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p data-ev-id="ev_9a93cff1df">Nenhum horário cadastrado.</p>
                <p data-ev-id="ev_029dcf8b25" className="text-sm mt-1">Clique em "Adicionar" para configurar seus horários.</p>
              </div> :

            <div data-ev-id="ev_2b346b6d27" className="flex flex-col gap-2">
                {timeSlots.map((slot) => {
                const dayLabel = DAYS.find((d) => d.value === slot.day)?.label || slot.day;
                return (
                  <div data-ev-id="ev_004aa4e032" key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div data-ev-id="ev_9108663307" className="flex items-center gap-4">
                        <span data-ev-id="ev_b3934445e7" className="font-medium text-gray-900 w-32">{dayLabel}</span>
                        <span data-ev-id="ev_3d9b5fb782" className="text-gray-600">{slot.start} - {slot.end}</span>
                      </div>
                      <button data-ev-id="ev_45c9d6bb94"
                    onClick={() => removeTimeSlot(slot.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg">

                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>);

              })}
              </div>
            }

            {/* Add Slot Modal */}
            {showAddSlot &&
            <div data-ev-id="ev_49b71ec177" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div data-ev-id="ev_f5827bf4aa" className="bg-white rounded-xl w-full max-w-md">
                  <div data-ev-id="ev_f52a3a0c5a" className="p-6 border-b flex items-center justify-between">
                    <h3 data-ev-id="ev_d092d98802" className="text-lg font-semibold">Adicionar Horário</h3>
                    <button data-ev-id="ev_9608d9e6d3" onClick={() => setShowAddSlot(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div data-ev-id="ev_b506575c7f" className="p-6 flex flex-col gap-4">
                    <div data-ev-id="ev_f3f49f93d2">
                      <label data-ev-id="ev_49324e1639" className="block text-sm font-medium text-gray-700 mb-1">Dia da semana</label>
                      <select data-ev-id="ev_f347acf246"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                        {DAYS.map((d) =>
                      <option data-ev-id="ev_5d463eb2dd" key={d.value} value={d.value}>{d.label}</option>
                      )}
                      </select>
                    </div>
                    <div data-ev-id="ev_ab002390ed" className="grid grid-cols-2 gap-4">
                      <div data-ev-id="ev_55a2206de5">
                        <label data-ev-id="ev_727f44c5e9" className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                        <input data-ev-id="ev_78bebc10a4"
                      type="time"
                      value={newSlot.start}
                      onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                      </div>
                      <div data-ev-id="ev_5dec735a59">
                        <label data-ev-id="ev_95a52a132e" className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                        <input data-ev-id="ev_7078e1c6b7"
                      type="time"
                      value={newSlot.end}
                      onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                      </div>
                    </div>
                  </div>
                  <div data-ev-id="ev_fd59b0c36b" className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">
                    <button data-ev-id="ev_bcc6ee6a4f"
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">

                      Cancelar
                    </button>
                    <button data-ev-id="ev_82301e612f"
                  onClick={addTimeSlot}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">

                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          {/* Save Button */}
          <div data-ev-id="ev_59b74381f8" className="flex justify-end">
            <button data-ev-id="ev_0e08cceb92"
            onClick={saveAllSettings}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">

              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_97bf59b879" className="flex flex-col gap-6">
          <div data-ev-id="ev_6ffc1eb7c0" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_43538a3e6b" className="text-lg font-semibold text-gray-900 mb-4">Link de agendamento</h2>
            
            <div data-ev-id="ev_2a3333981d" className="p-3 bg-gray-100 rounded-lg">
              <p data-ev-id="ev_520149e268" className="text-sm text-gray-600 font-mono break-all">seusite.com/agendar</p>
            </div>

            <button data-ev-id="ev_f523329049" className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" /> Abrir página
            </button>
          </div>

          <div data-ev-id="ev_2383ae859a" className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 data-ev-id="ev_e9fe5c06de" className="font-semibold text-blue-900 mb-2">Próximas reuniões</h3>
            <p data-ev-id="ev_11f54cc9eb" className="text-sm text-blue-700">Nenhuma reunião agendada.</p>
          </div>

          <div data-ev-id="ev_7cbd452bc3" className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <h3 data-ev-id="ev_07ec6cece1" className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Configuração necessária
            </h3>
            <p data-ev-id="ev_2e25db32a4" className="text-sm text-amber-700">
              Para conectar Google Meet ou Zoom, configure as credenciais OAuth na aba de Integrações Externas.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>);

}