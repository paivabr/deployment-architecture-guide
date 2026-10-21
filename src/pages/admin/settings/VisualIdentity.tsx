import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Palette,
  Save,
  Upload,
  Image,
  CheckCircle,
  AlertCircle,
  Type } from
'lucide-react';

export default function VisualIdentity() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Visual settings
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState('#1A1A1A');
  const [accentColor, setAccentColor] = useState('#B8860B');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [borderRadius, setBorderRadius] = useState('8');

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', [
      'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
      'accent_color', 'font_family', 'border_radius']
      );

      data?.forEach((s) => {
        switch (s.key) {
          case 'logo_url':setLogoUrl(s.value as string || '');break;
          case 'favicon_url':setFaviconUrl(s.value as string || '');break;
          case 'primary_color':setPrimaryColor(s.value as string || '#6366f1');break;
          case 'secondary_color':setSecondaryColor(s.value as string || '#f59e0b');break;
          case 'accent_color':setAccentColor(s.value as string || '#10b981');break;
          case 'font_family':setFontFamily(s.value as string || 'Inter');break;
          case 'border_radius':setBorderRadius(s.value as string || '8');break;
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
      const settings = [
      { key: 'logo_url', value: logoUrl, category: 'visual', scope: 'public' as const },
      { key: 'favicon_url', value: faviconUrl, category: 'visual', scope: 'public' as const },
      { key: 'primary_color', value: primaryColor, category: 'visual', scope: 'public' as const },
      { key: 'secondary_color', value: secondaryColor, category: 'visual', scope: 'public' as const },
      { key: 'accent_color', value: accentColor, category: 'visual', scope: 'public' as const },
      { key: 'font_family', value: fontFamily, category: 'visual', scope: 'public' as const },
      { key: 'border_radius', value: borderRadius, category: 'visual', scope: 'public' as const }];


      for (const s of settings) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { ...s, value: s.value as never },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      setSuccess('Identidade visual salva!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_4963c5449a" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_c80ad5d003" className="mb-8">
        <h1 data-ev-id="ev_0964e7e129" className="text-2xl font-bold text-gray-900">Identidade Visual</h1>
        <p data-ev-id="ev_73e37a8d7a" className="text-gray-600 mt-1">Personalize a aparência da plataforma</p>
      </div>

      <div data-ev-id="ev_b47ee2d43c" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_432ecc7202" className="lg:col-span-2 flex flex-col gap-6">
          {error &&
          <div data-ev-id="ev_91470b51a9" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          }
          {success &&
          <div data-ev-id="ev_e28cc2ac97" className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" /> {success}
            </div>
          }

          {/* Logo & Favicon */}
          <div data-ev-id="ev_b67c1fcd5a" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_e020a969d3" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" /> Logo e Favicon
            </h2>

            <div data-ev-id="ev_a45ee05051" className="grid grid-cols-2 gap-6">
              <div data-ev-id="ev_a37b2977d5">
                <label data-ev-id="ev_4455242a23" className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div data-ev-id="ev_297b9d38f5" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {logoUrl ?
                  <img data-ev-id="ev_0b390bdc9a" src={logoUrl} alt="Logo" className="max-h-16 mx-auto mb-2" /> :

                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  }
                  <input data-ev-id="ev_93b7ae38cd"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
              <div data-ev-id="ev_f93cfe208e">
                <label data-ev-id="ev_b7a908c948" className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div data-ev-id="ev_8682115ad9" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {faviconUrl ?
                  <img data-ev-id="ev_ca3a8b1982" src={faviconUrl} alt="Favicon" className="w-8 h-8 mx-auto mb-2" /> :

                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  }
                  <input data-ev-id="ev_ef1b424f19"
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div data-ev-id="ev_a2d0fe701c" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_c868cca9c2" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Cores
            </h2>

            <div data-ev-id="ev_5d3e503ebe" className="grid grid-cols-3 gap-4">
              <div data-ev-id="ev_4b06ea4c5d">
                <label data-ev-id="ev_6b5e30827e" className="block text-sm font-medium text-gray-700 mb-2">Cor primária</label>
                <div data-ev-id="ev_c30ede1701" className="flex items-center gap-2">
                  <input data-ev-id="ev_4e24420faf"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0" />

                  <input data-ev-id="ev_d73da7b6a8"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
              <div data-ev-id="ev_aecba6da6c">
                <label data-ev-id="ev_64c28010be" className="block text-sm font-medium text-gray-700 mb-2">Cor secundária</label>
                <div data-ev-id="ev_bcd4fd5f42" className="flex items-center gap-2">
                  <input data-ev-id="ev_3624f5add3"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0" />

                  <input data-ev-id="ev_2a9f735e13"
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
              <div data-ev-id="ev_e987c8ed04">
                <label data-ev-id="ev_c7f96dfb2c" className="block text-sm font-medium text-gray-700 mb-2">Cor de destaque</label>
                <div data-ev-id="ev_88ce6755d4" className="flex items-center gap-2">
                  <input data-ev-id="ev_0f8c120762"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0" />

                  <input data-ev-id="ev_99e4e83d6f"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div data-ev-id="ev_c0cccef997" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_b1f2e1e2cb" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" /> Tipografia e Estilo
            </h2>

            <div data-ev-id="ev_3a484795e6" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_232bb4d11d">
                <label data-ev-id="ev_996cee4c13" className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
                <select data-ev-id="ev_398246c586"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                  <option data-ev-id="ev_a060a593fa" value="Inter">Inter</option>
                  <option data-ev-id="ev_89bedb9894" value="Roboto">Roboto</option>
                  <option data-ev-id="ev_eeacad1ee9" value="Open Sans">Open Sans</option>
                  <option data-ev-id="ev_cf16bcc2a2" value="Poppins">Poppins</option>
                  <option data-ev-id="ev_560d9474cc" value="Lato">Lato</option>
                  <option data-ev-id="ev_5d6e71888a" value="Montserrat">Montserrat</option>
                </select>
              </div>
              <div data-ev-id="ev_7d11e8c6a2">
                <label data-ev-id="ev_64e2c5c0b4" className="block text-sm font-medium text-gray-700 mb-2">Arredondamento (px)</label>
                <input data-ev-id="ev_441cc8738c"
                type="number"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                min="0"
                max="24"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          </div>

          <button data-ev-id="ev_e8c90c5da5"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar identidade visual</>}
          </button>
        </div>

        {/* Preview */}
        <div data-ev-id="ev_2e1b780ec6">
          <div data-ev-id="ev_5c5178361b" className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 data-ev-id="ev_b77fa6b306" className="text-lg font-semibold text-gray-900 mb-4">Prévia</h2>
            
            <div data-ev-id="ev_9a5dafb889" className="border border-gray-200 rounded-lg overflow-hidden" style={{ fontFamily }}>
              <div data-ev-id="ev_d4634cc8cf" className="p-4 bg-gray-50 border-b border-gray-200">
                {logoUrl ?
                <img data-ev-id="ev_6426b8c532" src={logoUrl} alt="Logo" className="h-8" /> :

                <div data-ev-id="ev_98475ee8e7" className="h-8 w-24 bg-gray-300 rounded" />
                }
              </div>
              <div data-ev-id="ev_96b1f18a9e" className="p-4">
                <h3 data-ev-id="ev_9426f54fc0" className="font-semibold mb-2" style={{ color: primaryColor }}>Título de exemplo</h3>
                <p data-ev-id="ev_ebe839bd4d" className="text-sm text-gray-600 mb-4">Este é um texto de exemplo para demonstrar a tipografia.</p>
                <div data-ev-id="ev_24f6fc37c2" className="flex gap-2">
                  <button data-ev-id="ev_34b136430e" className="px-4 py-2 text-white text-sm font-medium" style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}>
                    Botão primário
                  </button>
                  <button data-ev-id="ev_1e0436e10e" className="px-4 py-2 text-white text-sm font-medium" style={{ backgroundColor: secondaryColor, borderRadius: `${borderRadius}px` }}>
                    Secundário
                  </button>
                </div>
                <div data-ev-id="ev_857d326bc6" className="mt-4 p-3" style={{ backgroundColor: accentColor + '20', borderRadius: `${borderRadius}px` }}>
                  <span data-ev-id="ev_30aa5c7f1a" className="text-sm" style={{ color: accentColor }}>✓ Mensagem de sucesso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}