import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  User,
  Save,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  AlertCircle } from
'lucide-react';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const defaultCards: FeatureCard[] = [
{ id: '1', icon: 'GraduationCap', title: 'Certificado reconhecido', description: 'Certificados válidos em todo o território nacional, aceitos pelas principais empresas.' },
{ id: '2', icon: 'Users', title: 'Comunidade ativa', description: 'Conecte-se com outros alunos, troque experiências e cresça junto.' },
{ id: '3', icon: 'Award', title: 'Conteúdo premium', description: 'Cursos criados por especialistas com anos de experiência no mercado.' }];


const iconOptions = [
{ value: 'GraduationCap', label: 'Formação' },
{ value: 'Users', label: 'Comunidade' },
{ value: 'Award', label: 'Prêmio' },
{ value: 'Star', label: 'Estrela' },
{ value: 'Heart', label: 'Coração' },
{ value: 'Zap', label: 'Energia' },
{ value: 'Target', label: 'Alvo' },
{ value: 'Rocket', label: 'Foguete' },
{ value: 'CheckCircle', label: 'Check' },
{ value: 'Shield', label: 'Escudo' }];


export default function AboutSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // About section
  const [aboutTitle, setAboutTitle] = useState('Por que escolher a Lara Sathler?');
  const [aboutSubtitle, setAboutSubtitle] = useState('Oferecemos uma experiência de aprendizado completa e personalizada');
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState('');
  const [aboutName, setAboutName] = useState('Lara Sathler');
  const [aboutBio, setAboutBio] = useState('');
  const [showPhoto, setShowPhoto] = useState(true);
  const [showCards, setShowCards] = useState(true);

  // Feature cards
  const [cards, setCards] = useState<FeatureCard[]>(defaultCards);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', [
      'about_title', 'about_subtitle', 'about_photo_url', 'about_name',
      'about_bio', 'about_show_photo', 'about_show_cards', 'about_cards']
      );

      data?.forEach((s) => {
        switch (s.key) {
          case 'about_title':setAboutTitle(s.value as string || 'Por que escolher a Lara Sathler?');break;
          case 'about_subtitle':setAboutSubtitle(s.value as string || '');break;
          case 'about_photo_url':setAboutPhotoUrl(s.value as string || '');break;
          case 'about_name':setAboutName(s.value as string || 'Lara Sathler');break;
          case 'about_bio':setAboutBio(s.value as string || '');break;
          case 'about_show_photo':setShowPhoto(s.value !== false);break;
          case 'about_show_cards':setShowCards(s.value !== false);break;
          case 'about_cards':
            if (Array.isArray(s.value)) setCards(s.value as unknown as FeatureCard[]);
            break;
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
        { key: 'about_title', value: aboutTitle as unknown },
        { key: 'about_subtitle', value: aboutSubtitle as unknown },
        { key: 'about_photo_url', value: aboutPhotoUrl as unknown },
        { key: 'about_name', value: aboutName as unknown },
        { key: 'about_bio', value: aboutBio as unknown },
        { key: 'about_show_photo', value: showPhoto as unknown },
        { key: 'about_show_cards', value: showCards as unknown },
        { key: 'about_cards', value: cards as unknown },
      ];

      for (const s of settingsToSave) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { key: s.key, value: s.value as never, category: 'about', scope: 'public' as const },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      setSuccess('Seção "Sobre" salva com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const addCard = () => {
    setCards([...cards, {
      id: Date.now().toString(),
      icon: 'Star',
      title: 'Novo card',
      description: 'Descrição do card'
    }]);
  };

  const updateCard = (id: string, field: keyof FeatureCard, value: string) => {
    setCards(cards.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_cc1443b12f" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_535a4170b4" className="mb-8">
        <h1 data-ev-id="ev_744f268f18" className="text-2xl font-bold text-gray-900">Seção Sobre</h1>
        <p data-ev-id="ev_48e3749553" className="text-gray-600 mt-1">Edite a seção "Sobre" da página inicial</p>
      </div>

      <div data-ev-id="ev_141b2c5538" className="max-w-4xl">
        {error &&
        <div data-ev-id="ev_b0a54a5049" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        }
        {success &&
        <div data-ev-id="ev_fe8dce540a" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        }

        {/* Photo & Bio */}
        <div data-ev-id="ev_452197ec9e" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div data-ev-id="ev_32ac3d9f9a" className="flex items-center justify-between mb-6">
            <h2 data-ev-id="ev_2a12d0d026" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Foto e Biografia
            </h2>
            <label data-ev-id="ev_2706f6d4d5" className="flex items-center gap-2 cursor-pointer">
              <span data-ev-id="ev_3be3b6a75f" className="text-sm text-gray-600">Exibir foto</span>
              <input data-ev-id="ev_806515d6ec"
              type="checkbox"
              checked={showPhoto}
              onChange={(e) => setShowPhoto(e.target.checked)}
              className="w-4 h-4 text-primary rounded" />

            </label>
          </div>

          <div data-ev-id="ev_a0bf9a155d" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div data-ev-id="ev_7a076e54ac">
              <label data-ev-id="ev_95b9b6f918" className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
              <div data-ev-id="ev_0d5423f7bc" className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                {aboutPhotoUrl ?
                <img data-ev-id="ev_b26db97bca" src={aboutPhotoUrl} alt="Foto" className="w-32 h-32 rounded-full mx-auto object-cover mb-3" /> :

                <div data-ev-id="ev_d62b3fbc3a" className="w-32 h-32 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                }
                <input data-ev-id="ev_5448339f45"
                type="url"
                value={aboutPhotoUrl}
                onChange={(e) => setAboutPhotoUrl(e.target.value)}
                placeholder="URL da foto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>

            {/* Bio */}
            <div data-ev-id="ev_ad85e9e451" className="md:col-span-2 flex flex-col gap-4">
              <div data-ev-id="ev_8a739710fa">
                <label data-ev-id="ev_43e36d8e15" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input data-ev-id="ev_3004a1dc40"
                type="text"
                value={aboutName}
                onChange={(e) => setAboutName(e.target.value)}
                placeholder="Lara Sathler"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_05195e671d" className="flex-1">
                <label data-ev-id="ev_18c97eacf4" className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                <textarea data-ev-id="ev_7053ddc182"
                value={aboutBio}
                onChange={(e) => setAboutBio(e.target.value)}
                placeholder="Conte um pouco sobre você, sua trajetória, experiência e o que te motiva..."
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />

              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div data-ev-id="ev_2d1198e4f2" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 data-ev-id="ev_74b956926d" className="text-lg font-semibold text-gray-900 mb-4">Títulos da Seção</h2>
          
          <div data-ev-id="ev_cfb2720ed9" className="flex flex-col gap-4">
            <div data-ev-id="ev_b673ecb44c">
              <label data-ev-id="ev_cdcc74e5d9" className="block text-sm font-medium text-gray-700 mb-1">Título principal</label>
              <input data-ev-id="ev_099545c3c4"
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              placeholder="Por que escolher a Lara Sathler?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

            </div>
            <div data-ev-id="ev_9435e12b05">
              <label data-ev-id="ev_f04febf71e" className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input data-ev-id="ev_b439e82162"
              type="text"
              value={aboutSubtitle}
              onChange={(e) => setAboutSubtitle(e.target.value)}
              placeholder="Oferecemos uma experiência de aprendizado completa"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div data-ev-id="ev_4b28979ed3" className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div data-ev-id="ev_27b085b93d" className="flex items-center justify-between mb-6">
            <h2 data-ev-id="ev_d7bbd7a12d" className="text-lg font-semibold text-gray-900">Cards de Destaque</h2>
            <div data-ev-id="ev_e6dbe0a6e8" className="flex items-center gap-4">
              <label data-ev-id="ev_ec8e47660a" className="flex items-center gap-2 cursor-pointer">
                <span data-ev-id="ev_d4d34240e5" className="text-sm text-gray-600">Exibir cards</span>
                <input data-ev-id="ev_e1e2037937"
                type="checkbox"
                checked={showCards}
                onChange={(e) => setShowCards(e.target.checked)}
                className="w-4 h-4 text-primary rounded" />

              </label>
              <button data-ev-id="ev_74a6062c09"
              onClick={addCard}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1">

                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          <div data-ev-id="ev_1057625c6d" className="flex flex-col gap-4">
            {cards.map((card, index) =>
            <div data-ev-id="ev_4a4bf0cc58" key={card.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div data-ev-id="ev_cce5c15e4c" className="flex items-center text-gray-400">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div data-ev-id="ev_46eda90e8c" className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div data-ev-id="ev_eb4ac12b20">
                    <label data-ev-id="ev_ca19160797" className="block text-xs font-medium text-gray-500 mb-1">Ícone</label>
                    <select data-ev-id="ev_ea376d3e0a"
                  value={card.icon}
                  onChange={(e) => updateCard(card.id, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">

                      {iconOptions.map((opt) =>
                    <option data-ev-id="ev_b25c084542" key={opt.value} value={opt.value}>{opt.label}</option>
                    )}
                    </select>
                  </div>
                  <div data-ev-id="ev_0b5aa9b198">
                    <label data-ev-id="ev_d14a58f266" className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                    <input data-ev-id="ev_d3c9aa8605"
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                  <div data-ev-id="ev_67fa770f3f" className="md:col-span-2">
                    <label data-ev-id="ev_0dc3a7fcb1" className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                    <input data-ev-id="ev_8b7048fb7c"
                  type="text"
                  value={card.description}
                  onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                </div>
                <button data-ev-id="ev_553b98d47d"
              onClick={() => removeCard(card.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">

                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <button data-ev-id="ev_57a76755d2"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar seção Sobre</>}
        </button>
      </div>
    </AdminLayout>);

}