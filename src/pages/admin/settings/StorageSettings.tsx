import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  HardDrive,
  Save,
  FileImage,
  FileVideo,
  File,
  Trash2,
  CheckCircle,
  AlertCircle } from
'lucide-react';

export default function StorageSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [allowedImageTypes, setAllowedImageTypes] = useState('jpg,jpeg,png,gif,webp');
  const [allowedDocTypes, setAllowedDocTypes] = useState('pdf,doc,docx,xls,xlsx,ppt,pptx');
  const [compressImages, setCompressImages] = useState(true);
  const [generateThumbnails, setGenerateThumbnails] = useState(true);

  // Stats (mock for now)
  const [storageUsed] = useState(2.4);
  const [storageLimit] = useState(10);
  const [fileCount] = useState(156);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', [
      'max_file_size', 'allowed_image_types', 'allowed_doc_types',
      'compress_images', 'generate_thumbnails']
      );

      data?.forEach((s) => {
        switch (s.key) {
          case 'max_file_size':setMaxFileSize(s.value as string || '10');break;
          case 'allowed_image_types':setAllowedImageTypes(s.value as string || 'jpg,jpeg,png,gif,webp');break;
          case 'allowed_doc_types':setAllowedDocTypes(s.value as string || 'pdf,doc,docx,xls,xlsx,ppt,pptx');break;
          case 'compress_images':setCompressImages(s.value !== false);break;
          case 'generate_thumbnails':setGenerateThumbnails(s.value !== false);break;
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
        { key: 'max_file_size', value: maxFileSize },
        { key: 'allowed_image_types', value: allowedImageTypes },
        { key: 'allowed_doc_types', value: allowedDocTypes },
        { key: 'compress_images', value: compressImages },
        { key: 'generate_thumbnails', value: generateThumbnails },
      ];

      for (const s of settingsToSave) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { key: s.key, value: s.value as never, category: 'storage', scope: 'admin' as const },
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
        <div data-ev-id="ev_f6e0e2a7b3" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  const usagePercent = storageUsed / storageLimit * 100;

  return (
    <AdminLayout>
      <div data-ev-id="ev_293dc9b644" className="mb-8">
        <h1 data-ev-id="ev_6094ba4836" className="text-2xl font-bold text-gray-900">Armazenamento</h1>
        <p data-ev-id="ev_1972cf3e94" className="text-gray-600 mt-1">Gerencie arquivos e limites de upload</p>
      </div>

      <div data-ev-id="ev_ad358773b4" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_39721c6b4c" className="lg:col-span-2 flex flex-col gap-6">
          {error &&
          <div data-ev-id="ev_e121aa3762" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          }
          {success &&
          <div data-ev-id="ev_84c500250a" className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" /> {success}
            </div>
          }

          {/* Upload Settings */}
          <div data-ev-id="ev_705ffb9522" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_6b24868c7f" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" /> Configurações de Upload
            </h2>

            <div data-ev-id="ev_9d5ced0324" className="flex flex-col gap-4">
              <div data-ev-id="ev_b0dc3555c1">
                <label data-ev-id="ev_be1147cd3a" className="block text-sm font-medium text-gray-700 mb-1">Tamanho máximo por arquivo (MB)</label>
                <input data-ev-id="ev_a6e522f6dd"
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(e.target.value)}
                min="1"
                max="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>

              <div data-ev-id="ev_cf94496590">
                <label data-ev-id="ev_65eb7659bb" className="block text-sm font-medium text-gray-700 mb-1">Tipos de imagem permitidos</label>
                <input data-ev-id="ev_3607ae3711"
                type="text"
                value={allowedImageTypes}
                onChange={(e) => setAllowedImageTypes(e.target.value)}
                placeholder="jpg,jpeg,png,gif,webp"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />

                <p data-ev-id="ev_0f1b120b27" className="mt-1 text-xs text-gray-500">Separar extensões por vírgula</p>
              </div>

              <div data-ev-id="ev_ace2a8c6b4">
                <label data-ev-id="ev_4321fc79cc" className="block text-sm font-medium text-gray-700 mb-1">Tipos de documento permitidos</label>
                <input data-ev-id="ev_bae83f3807"
                type="text"
                value={allowedDocTypes}
                onChange={(e) => setAllowedDocTypes(e.target.value)}
                placeholder="pdf,doc,docx,xls,xlsx"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />

              </div>
            </div>
          </div>

          {/* Processing */}
          <div data-ev-id="ev_2ad79ac197" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_a63db751c2" className="text-lg font-semibold text-gray-900 mb-4">Processamento</h2>

            <div data-ev-id="ev_0677db4faa" className="flex flex-col gap-3">
              <label data-ev-id="ev_bae81027dc" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div data-ev-id="ev_f757f5d36d">
                  <p data-ev-id="ev_82638d597c" className="font-medium text-gray-900">Comprimir imagens</p>
                  <p data-ev-id="ev_713d341dc2" className="text-sm text-gray-500">Reduz o tamanho mantendo qualidade visual</p>
                </div>
                <input data-ev-id="ev_55bdc272a7"
                type="checkbox"
                checked={compressImages}
                onChange={(e) => setCompressImages(e.target.checked)}
                className="w-5 h-5 text-primary rounded" />

              </label>

              <label data-ev-id="ev_21165ba843" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div data-ev-id="ev_6e1c6b0aeb">
                  <p data-ev-id="ev_7ef8f50ba4" className="font-medium text-gray-900">Gerar miniaturas</p>
                  <p data-ev-id="ev_19e293d888" className="text-sm text-gray-500">Cria versões menores para listagens</p>
                </div>
                <input data-ev-id="ev_b1dfbeb2b1"
                type="checkbox"
                checked={generateThumbnails}
                onChange={(e) => setGenerateThumbnails(e.target.checked)}
                className="w-5 h-5 text-primary rounded" />

              </label>
            </div>
          </div>

          <button data-ev-id="ev_bc863c48d3"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar configurações</>}
          </button>
        </div>

        {/* Sidebar */}
        <div data-ev-id="ev_b45097a7e6" className="flex flex-col gap-6">
          {/* Usage */}
          <div data-ev-id="ev_48aed6ec02" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_ceef7f5643" className="text-lg font-semibold text-gray-900 mb-4">Uso do Storage</h2>
            
            <div data-ev-id="ev_75abfa51b5" className="mb-4">
              <div data-ev-id="ev_58445f636a" className="flex justify-between text-sm mb-1">
                <span data-ev-id="ev_e2c5175b8e" className="text-gray-600">Usado</span>
                <span data-ev-id="ev_6440bd4ec0" className="font-medium text-gray-900">{storageUsed} GB / {storageLimit} GB</span>
              </div>
              <div data-ev-id="ev_dc59707cf3" className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div data-ev-id="ev_630fdfce0d"
                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${usagePercent}%` }} />

              </div>
            </div>

            <div data-ev-id="ev_da192a7e74" className="grid grid-cols-3 gap-4 text-center">
              <div data-ev-id="ev_5a41aff539" className="p-3 bg-blue-50 rounded-lg">
                <FileImage className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p data-ev-id="ev_2f532e674c" className="text-lg font-bold text-gray-900">89</p>
                <p data-ev-id="ev_5fae94bea5" className="text-xs text-gray-500">Imagens</p>
              </div>
              <div data-ev-id="ev_a1d509cd25" className="p-3 bg-purple-50 rounded-lg">
                <FileVideo className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p data-ev-id="ev_c39b112773" className="text-lg font-bold text-gray-900">12</p>
                <p data-ev-id="ev_2cd198411e" className="text-xs text-gray-500">Vídeos</p>
              </div>
              <div data-ev-id="ev_01cbd457d8" className="p-3 bg-green-50 rounded-lg">
                <File className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p data-ev-id="ev_55f931e71b" className="text-lg font-bold text-gray-900">55</p>
                <p data-ev-id="ev_6374f41744" className="text-xs text-gray-500">Docs</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div data-ev-id="ev_8a3d18a13e" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_48fa633951" className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h2>
            
            <div data-ev-id="ev_58f8f5cafa" className="flex flex-col gap-2">
              <button data-ev-id="ev_788a9e2d9e" className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Limpar cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}