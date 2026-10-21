import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Video,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Play } from
'lucide-react';

export default function VideoSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Panda Video settings
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [defaultFolder, setDefaultFolder] = useState('');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [downloadEnabled, setDownloadEnabled] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', ['panda_configured', 'panda_default_folder', 'panda_watermark', 'panda_download']);

      data?.forEach((s) => {
        if (s.key === 'panda_configured') setIsConfigured(s.value === true);
        if (s.key === 'panda_default_folder') setDefaultFolder(s.value as string || '');
        if (s.key === 'panda_watermark') setWatermarkEnabled(s.value === true);
        if (s.key === 'panda_download') setDownloadEnabled(s.value === true);
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
        { key: 'panda_default_folder', value: defaultFolder },
        { key: 'panda_watermark', value: watermarkEnabled },
        { key: 'panda_download', value: downloadEnabled },
      ];

      for (const s of settingsToSave) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { key: s.key, value: s.value as never, category: 'video', scope: 'private' as const },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      if (apiKey) {
        const { error: fnError } = await supabase.functions.invoke('admin-providers', {
          body: { action: 'save-panda-key', apiKey }
        });
        if (fnError) throw fnError;
        setIsConfigured(true);
        setApiKey('');

        const { error: configError } = await supabase.from('settings').upsert(
          { key: 'panda_configured', value: true as never, category: 'video', scope: 'private' as const },
          { onConflict: 'category,key' }
        );
        if (configError) throw configError;
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
        <div data-ev-id="ev_f371c271e6" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_f283f7dd7d" className="mb-8">
        <h1 data-ev-id="ev_236bf54833" className="text-2xl font-bold text-gray-900">Vídeos e Transmissões</h1>
        <p data-ev-id="ev_a034620a6c" className="text-gray-600 mt-1">Configure a integração com Panda Video</p>
      </div>

      <div data-ev-id="ev_6f4087b7d6" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_808b681745" className="lg:col-span-2 flex flex-col gap-6">
          {/* Panda Config */}
          <div data-ev-id="ev_a3c612a641" className="bg-white rounded-xl border border-gray-200 p-6">
            <div data-ev-id="ev_5ad47ad51b" className="flex items-center gap-3 mb-6">
              <div data-ev-id="ev_7e87f5cc8e" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <div data-ev-id="ev_817cb39862">
                <h2 data-ev-id="ev_985e7813c4" className="text-lg font-semibold text-gray-900">Panda Video</h2>
                <p data-ev-id="ev_bbd3affabb" className="text-sm text-gray-500">Hospedagem e streaming de vídeos</p>
              </div>
              {isConfigured && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
            </div>

            {error &&
            <div data-ev-id="ev_1cf5afd3df" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            }
            {success &&
            <div data-ev-id="ev_541fd15b3c" className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            }

            <div data-ev-id="ev_201f6ef3e5" className="flex flex-col gap-4">
              <div data-ev-id="ev_ee17c6ea08">
                <label data-ev-id="ev_5d0d3816da" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key {isConfigured && <span data-ev-id="ev_7a5cbbdacb" className="text-green-600">✓ Configurada</span>}
                </label>
                <div data-ev-id="ev_db17e66f3d" className="relative">
                  <input data-ev-id="ev_c887fd0ce3"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isConfigured ? '••••••••' : 'panda_...'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none pr-12" />

                  <button data-ev-id="ev_50708705a4" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p data-ev-id="ev_0371c175cf" className="mt-1 text-xs text-gray-500">Obtenha em <a data-ev-id="ev_add2a66b5e" href="https://dashboard.pandavideo.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dashboard.pandavideo.com.br</a></p>
              </div>

              <div data-ev-id="ev_7ef7b54744">
                <label data-ev-id="ev_4d813334dd" className="block text-sm font-medium text-gray-700 mb-1">Pasta padrão</label>
                <input data-ev-id="ev_1bfe497d55"
                type="text"
                value={defaultFolder}
                onChange={(e) => setDefaultFolder(e.target.value)}
                placeholder="ID da pasta no Panda Video"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                <p data-ev-id="ev_58635bb152" className="mt-1 text-xs text-gray-500">Opcional: ID da pasta onde os vídeos serão organizados</p>
              </div>

              <div data-ev-id="ev_fc7d1b62c5" className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
                <label data-ev-id="ev_7bba6b5bdd" className="flex items-center justify-between cursor-pointer">
                  <span data-ev-id="ev_84ef971e92" className="text-sm text-gray-700">Marca d'água com e-mail do usuário</span>
                  <input data-ev-id="ev_1742c5faf1"
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary rounded" />

                </label>
                <label data-ev-id="ev_74ca255e90" className="flex items-center justify-between cursor-pointer">
                  <span data-ev-id="ev_cab9558e1b" className="text-sm text-gray-700">Permitir download de vídeos</span>
                  <input data-ev-id="ev_805003f9a0"
                  type="checkbox"
                  checked={downloadEnabled}
                  onChange={(e) => setDownloadEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary rounded" />

                </label>
              </div>

              <button data-ev-id="ev_e688b6495d" onClick={handleSave} disabled={isSaving} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar configurações</>}
              </button>
            </div>
          </div>

          {/* How to use */}
          <div data-ev-id="ev_edf8ff3be3" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_18b2ba9bd7" className="text-lg font-semibold text-gray-900 mb-4">Como usar</h2>
            
            <ol data-ev-id="ev_a2a124db4d" className="flex flex-col gap-4 text-sm text-gray-700">
              <li data-ev-id="ev_961f4739e1" className="flex gap-3">
                <span data-ev-id="ev_56ae72c0b2" className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 font-medium">1</span>
                <div data-ev-id="ev_315b4c4a58">
                  <p data-ev-id="ev_638b9dd406" className="font-medium text-gray-900">Faça upload no Panda Video</p>
                  <p data-ev-id="ev_5489d4369b" className="text-gray-500">Acesse o dashboard do Panda e envie seus vídeos.</p>
                </div>
              </li>
              <li data-ev-id="ev_433bf8385e" className="flex gap-3">
                <span data-ev-id="ev_21e4136807" className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 font-medium">2</span>
                <div data-ev-id="ev_bdd74502ff">
                  <p data-ev-id="ev_580a78dc0a" className="font-medium text-gray-900">Copie o ID do vídeo</p>
                  <p data-ev-id="ev_ade6bf47e8" className="text-gray-500">Cada vídeo tem um ID único no formato UUID.</p>
                </div>
              </li>
              <li data-ev-id="ev_a4e875fe5d" className="flex gap-3">
                <span data-ev-id="ev_95c8fe3ab9" className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 font-medium">3</span>
                <div data-ev-id="ev_68ba3cc43e">
                  <p data-ev-id="ev_e25d0d632f" className="font-medium text-gray-900">Cole na aula</p>
                  <p data-ev-id="ev_de444f2903" className="text-gray-500">No editor de aula, selecione "Panda Video" e cole o ID.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_a57d3a5557" className="flex flex-col gap-6">
          {/* Status */}
          <div data-ev-id="ev_02adc2cd3d" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_c27ca7afe6" className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            
            <div data-ev-id="ev_4c5e070348" className={`p-4 rounded-lg ${isConfigured ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div data-ev-id="ev_7268ac141b" className="flex items-center gap-2 mb-2">
                {isConfigured ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                <span data-ev-id="ev_d36f7c9a4e" className={`font-medium ${isConfigured ? 'text-green-900' : 'text-yellow-900'}`}>
                  {isConfigured ? 'Configurado' : 'Pendente'}
                </span>
              </div>
              <p data-ev-id="ev_da779526cd" className={`text-sm ${isConfigured ? 'text-green-700' : 'text-yellow-700'}`}>
                {isConfigured ? 'Integração com Panda Video ativa.' : 'Configure a API Key para ativar.'}
              </p>
            </div>

            {isConfigured &&
            <a data-ev-id="ev_991ac15c54"
            href="https://dashboard.pandavideo.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">

                Abrir Panda Video <ExternalLink className="w-4 h-4" />
              </a>
            }
          </div>

          {/* Info */}
          <div data-ev-id="ev_e8c61134c2" className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 data-ev-id="ev_cc5f917747" className="font-semibold text-green-900 mb-2">Por que Panda Video?</h3>
            <ul data-ev-id="ev_64bb90740d" className="text-sm text-green-800 flex flex-col gap-2">
              <li data-ev-id="ev_2df1eddc30">✓ Streaming adaptável (HLS)</li>
              <li data-ev-id="ev_da86592918">✓ Proteção anti-pirataria</li>
              <li data-ev-id="ev_dde84bcd2b">✓ Marca d'água dinâmica</li>
              <li data-ev-id="ev_9310ce3fae">✓ CDN brasileira</li>
              <li data-ev-id="ev_db1bdb8827">✓ Player customizável</li>
            </ul>
            <a data-ev-id="ev_401526d586" href="https://pandavideo.com.br" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-green-600 hover:underline">
              Conhecer o Panda Video →
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>);

}