import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Settings,
  Save,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle } from
'lucide-react';

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [currency, setCurrency] = useState('BRL');
  const [language, setLanguage] = useState('pt-BR');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', [
      'site_name', 'site_description', 'site_url', 'support_email',
      'timezone', 'currency', 'language', 'maintenance_mode', 'registration_open']
      );

      data?.forEach((s) => {
        switch (s.key) {
          case 'site_name':setSiteName(s.value as string || '');break;
          case 'site_description':setSiteDescription(s.value as string || '');break;
          case 'site_url':setSiteUrl(s.value as string || '');break;
          case 'support_email':setSupportEmail(s.value as string || '');break;
          case 'timezone':setTimezone(s.value as string || 'America/Sao_Paulo');break;
          case 'currency':setCurrency(s.value as string || 'BRL');break;
          case 'language':setLanguage(s.value as string || 'pt-BR');break;
          case 'maintenance_mode':setMaintenanceMode(s.value === true);break;
          case 'registration_open':setRegistrationOpen(s.value !== false);break;
        }
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
      const settingsToSave = [
        { key: 'site_name', value: siteName },
        { key: 'site_description', value: siteDescription },
        { key: 'site_url', value: siteUrl },
        { key: 'support_email', value: supportEmail },
        { key: 'timezone', value: timezone },
        { key: 'currency', value: currency },
        { key: 'language', value: language },
        { key: 'maintenance_mode', value: maintenanceMode },
        { key: 'registration_open', value: registrationOpen },
      ];

      for (const s of settingsToSave) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { key: s.key, value: s.value as never, category: 'general', scope: 'public' as const },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      setSuccess('Configurações salvas!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_b057201021" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_d8c48cef67" className="mb-8">
        <h1 data-ev-id="ev_d386228e4f" className="text-2xl font-bold text-gray-900">Configurações Gerais</h1>
        <p data-ev-id="ev_63d161b283" className="text-gray-600 mt-1">Informações básicas da plataforma</p>
      </div>

      <div data-ev-id="ev_32ab132d1a" className="max-w-3xl">
        {error &&
        <div data-ev-id="ev_4285b0b02b" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        }
        {success &&
        <div data-ev-id="ev_da6d904748" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        }

        {/* Site Info */}
        <div data-ev-id="ev_9f83b37de1" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 data-ev-id="ev_a9b29f3283" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Informações do Site
          </h2>

          <div data-ev-id="ev_da6157791b" className="flex flex-col gap-4">
            <div data-ev-id="ev_b941307118">
              <label data-ev-id="ev_4a21971497" className="block text-sm font-medium text-gray-700 mb-1">Nome da plataforma</label>
              <input data-ev-id="ev_0e4bb32b5c"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Minha Plataforma de Cursos"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

            </div>

            <div data-ev-id="ev_6d24f1fe82">
              <label data-ev-id="ev_f22f943089" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea data-ev-id="ev_eef6a9b49a"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Aprenda com os melhores cursos online"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />

            </div>

            <div data-ev-id="ev_5d8b78334c" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_5a561c9c4c">
                <label data-ev-id="ev_d764964bd6" className="block text-sm font-medium text-gray-700 mb-1">URL do site</label>
                <input data-ev-id="ev_ca43728d93"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://meusite.com.br"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_b0243d1f7c">
                <label data-ev-id="ev_cbc9878435" className="block text-sm font-medium text-gray-700 mb-1">E-mail de suporte</label>
                <input data-ev-id="ev_f831e55f5d"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="suporte@meusite.com.br"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div data-ev-id="ev_1d6e7d8e1a" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 data-ev-id="ev_1812a139e4" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Regional
          </h2>

          <div data-ev-id="ev_e50a1cde4c" className="grid grid-cols-3 gap-4">
            <div data-ev-id="ev_fcdf5da7db">
              <label data-ev-id="ev_6f18edc4ce" className="block text-sm font-medium text-gray-700 mb-1">Fuso horário</label>
              <select data-ev-id="ev_ee5e94006c"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                <option data-ev-id="ev_a64bf719ae" value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option data-ev-id="ev_fb2ca7592b" value="America/Manaus">Manaus (GMT-4)</option>
                <option data-ev-id="ev_829b08e432" value="America/Fortaleza">Fortaleza (GMT-3)</option>
                <option data-ev-id="ev_9a59543bc8" value="America/Recife">Recife (GMT-3)</option>
              </select>
            </div>
            <div data-ev-id="ev_2c933a1dc2">
              <label data-ev-id="ev_517816b095" className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
              <select data-ev-id="ev_8b64bd9c41"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                <option data-ev-id="ev_e89a5f1abd" value="BRL">Real (R$)</option>
                <option data-ev-id="ev_0d8573b437" value="USD">Dólar (US$)</option>
                <option data-ev-id="ev_b59f93c22b" value="EUR">Euro (€)</option>
              </select>
            </div>
            <div data-ev-id="ev_e1e9255de3">
              <label data-ev-id="ev_5fe9580415" className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
              <select data-ev-id="ev_b42856b54a"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                <option data-ev-id="ev_eb2c89c91e" value="pt-BR">Português (BR)</option>
                <option data-ev-id="ev_95ed85f213" value="en">English</option>
                <option data-ev-id="ev_238febcbee" value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access */}
        <div data-ev-id="ev_0cc3026359" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 data-ev-id="ev_967b21ff0d" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Acesso
          </h2>

          <div data-ev-id="ev_ed0162fb2e" className="flex flex-col gap-4">
            <label data-ev-id="ev_0d48326011" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
              <div data-ev-id="ev_76a9c9649d">
                <p data-ev-id="ev_69233b71d4" className="font-medium text-gray-900">Cadastro aberto</p>
                <p data-ev-id="ev_885decb5df" className="text-sm text-gray-500">Permitir que novos usuários se cadastrem</p>
              </div>
              <input data-ev-id="ev_2e9aeb9ac8"
              type="checkbox"
              checked={registrationOpen}
              onChange={(e) => setRegistrationOpen(e.target.checked)}
              className="w-5 h-5 text-primary rounded" />

            </label>

            <label data-ev-id="ev_411f64a82b" className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer">
              <div data-ev-id="ev_6ec04e7f83">
                <p data-ev-id="ev_cf99ee0b1d" className="font-medium text-yellow-900">Modo manutenção</p>
                <p data-ev-id="ev_ddf6b127d7" className="text-sm text-yellow-700">Apenas admins podem acessar o site</p>
              </div>
              <input data-ev-id="ev_10ca3fc930"
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 text-yellow-600 rounded" />

            </label>
          </div>
        </div>

        <button data-ev-id="ev_e86de18aaf"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar configurações</>}
        </button>
      </div>
    </AdminLayout>);

}