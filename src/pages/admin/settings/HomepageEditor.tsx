import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Loader2,
  Save,
  Layout,
  Sparkles,
  BarChart3,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp } from
'lucide-react';

interface StatItem {
  id: string;
  value: string;
  label: string;
}

interface SectionState {
  isOpen: boolean;
}

export default function HomepageEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Section toggles
  const [sections, setSections] = useState<Record<string, SectionState>>({
    hero: { isOpen: true },
    stats: { isOpen: false },
    cta: { isOpen: false },
    footer: { isOpen: false }
  });

  // Hero section
  const [heroBadge, setHeroBadge] = useState('Plataforma de cursos online');
  const [heroTitle, setHeroTitle] = useState('Transforme seu futuro com');
  const [heroTitleHighlight, setHeroTitleHighlight] = useState('conhecimento');
  const [heroSubtitle, setHeroSubtitle] = useState('Aprenda com os melhores profissionais do mercado. Cursos práticos, certificados reconhecidos e suporte especializado.');
  const [heroBtnPrimary, setHeroBtnPrimary] = useState('Explorar cursos');
  const [heroBtnSecondary, setHeroBtnSecondary] = useState('Ver destaques');

  // Stats section
  const [stats, setStats] = useState<StatItem[]>([
  { id: '1', value: '10K+', label: 'Alunos ativos' },
  { id: '2', value: '150+', label: 'Cursos disponíveis' },
  { id: '3', value: '98%', label: 'Satisfação' },
  { id: '4', value: '50+', label: 'Instrutores experts' }]
  );

  // CTA section
  const [ctaTitle, setCtaTitle] = useState('Pronto para começar sua jornada?');
  const [ctaSubtitle, setCtaSubtitle] = useState('Junte-se a milhares de alunos que já estão transformando suas carreiras.');
  const [ctaButton, setCtaButton] = useState('Criar conta gratuita');

  // Footer
  const [footerDescription, setFooterDescription] = useState('Transformando vidas através da educação de qualidade.');
  const [footerEmail, setFooterEmail] = useState('contato@larasathler.com.br');
  const [footerPhone, setFooterPhone] = useState('(11) 99999-9999');
  const [footerAddress, setFooterAddress] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');

  const toggleSection = (key: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { isOpen: !prev[key].isOpen }
    }));
  };

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      like('key', 'home_%');

      data?.forEach((s) => {
        const val = s.value as string;
        switch (s.key) {
          case 'home_hero_badge':setHeroBadge(val || '');break;
          case 'home_hero_title':setHeroTitle(val || '');break;
          case 'home_hero_title_highlight':setHeroTitleHighlight(val || '');break;
          case 'home_hero_subtitle':setHeroSubtitle(val || '');break;
          case 'home_hero_btn_primary':setHeroBtnPrimary(val || '');break;
          case 'home_hero_btn_secondary':setHeroBtnSecondary(val || '');break;
          case 'home_stats':if (Array.isArray(s.value)) setStats(s.value as unknown as StatItem[]);break;
          case 'home_cta_title':setCtaTitle(val || '');break;
          case 'home_cta_subtitle':setCtaSubtitle(val || '');break;
          case 'home_cta_button':setCtaButton(val || '');break;
          case 'home_footer_description':setFooterDescription(val || '');break;
          case 'home_footer_email':setFooterEmail(val || '');break;
          case 'home_footer_phone':setFooterPhone(val || '');break;
          case 'home_footer_address':setFooterAddress(val || '');break;
          case 'home_social_instagram':setSocialInstagram(val || '');break;
          case 'home_social_facebook':setSocialFacebook(val || '');break;
          case 'home_social_youtube':setSocialYoutube(val || '');break;
          case 'home_social_linkedin':setSocialLinkedin(val || '');break;
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
      { key: 'home_hero_badge', value: heroBadge },
      { key: 'home_hero_title', value: heroTitle },
      { key: 'home_hero_title_highlight', value: heroTitleHighlight },
      { key: 'home_hero_subtitle', value: heroSubtitle },
      { key: 'home_hero_btn_primary', value: heroBtnPrimary },
      { key: 'home_hero_btn_secondary', value: heroBtnSecondary },
      { key: 'home_stats', value: stats as unknown },
      { key: 'home_cta_title', value: ctaTitle },
      { key: 'home_cta_subtitle', value: ctaSubtitle },
      { key: 'home_cta_button', value: ctaButton },
      { key: 'home_footer_description', value: footerDescription },
      { key: 'home_footer_email', value: footerEmail },
      { key: 'home_footer_phone', value: footerPhone },
      { key: 'home_footer_address', value: footerAddress },
      { key: 'home_social_instagram', value: socialInstagram },
      { key: 'home_social_facebook', value: socialFacebook },
      { key: 'home_social_youtube', value: socialYoutube },
      { key: 'home_social_linkedin', value: socialLinkedin }];


      for (const s of settingsToSave) {
        const { error: upsertError } = await supabase.from('settings').upsert(
          { key: s.key, value: s.value as never, category: 'home', scope: 'public' as const },
          { onConflict: 'category,key' }
        );
        if (upsertError) {
          console.error('Error saving setting:', s.key, upsertError);
          throw upsertError;
        }
      }

      setSuccess('Página inicial salva com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const addStat = () => {
    setStats([...stats, { id: Date.now().toString(), value: '0', label: 'Novo item' }]);
  };

  const updateStat = (id: string, field: 'value' | 'label', val: string) => {
    setStats(stats.map((s) => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeStat = (id: string) => {
    setStats(stats.filter((s) => s.id !== id));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_250321efb4" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_04fdaf942e" className="mb-8">
        <h1 data-ev-id="ev_1e7b3e1ba1" className="text-2xl font-bold text-gray-900">Editor da Página Inicial</h1>
        <p data-ev-id="ev_ac0df81896" className="text-gray-600 mt-1">Personalize todas as seções da home do site</p>
      </div>

      <div data-ev-id="ev_f8f549c61b" className="max-w-4xl">
        {error &&
        <div data-ev-id="ev_d7304d37ba" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        }
        {success &&
        <div data-ev-id="ev_a0a561ce1a" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" /> {success}
          </div>
        }

        {/* Hero Section */}
        <div data-ev-id="ev_bff0fba62a" className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <button data-ev-id="ev_fa654108bb"
          onClick={() => toggleSection('hero')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">

            <div data-ev-id="ev_5619ddae6e" className="flex items-center gap-3">
              <div data-ev-id="ev_7d0af21b0a" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div data-ev-id="ev_56a26e14a4" className="text-left">
                <h2 data-ev-id="ev_f4e47ff09c" className="font-semibold text-gray-900">Seção Hero (Topo)</h2>
                <p data-ev-id="ev_e781845ea0" className="text-sm text-gray-500">Banner principal com título e botões</p>
              </div>
            </div>
            {sections.hero.isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {sections.hero.isOpen &&
          <div data-ev-id="ev_076fb50e7f" className="px-6 pb-6 border-t border-gray-100 pt-4 flex flex-col gap-4">
              <div data-ev-id="ev_3efcb93b8a">
                <label data-ev-id="ev_4bda1a4ead" className="block text-sm font-medium text-gray-700 mb-1">Badge (etiqueta)</label>
                <input data-ev-id="ev_1b477afd2e"
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="Plataforma de cursos online"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_77956cc942" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-ev-id="ev_dc8797b4bf">
                  <label data-ev-id="ev_67923c2d9b" className="block text-sm font-medium text-gray-700 mb-1">Título (parte normal)</label>
                  <input data-ev-id="ev_7c02a78133"
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Transforme seu futuro com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
                <div data-ev-id="ev_531f751ef4">
                  <label data-ev-id="ev_1390f6b8ec" className="block text-sm font-medium text-gray-700 mb-1">Título (parte destacada)</label>
                  <input data-ev-id="ev_c6417d3ff7"
                type="text"
                value={heroTitleHighlight}
                onChange={(e) => setHeroTitleHighlight(e.target.value)}
                placeholder="conhecimento"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
              <div data-ev-id="ev_cc614579ee">
                <label data-ev-id="ev_076d019ddc" className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <textarea data-ev-id="ev_b5f27aeb2e"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />

              </div>
              <div data-ev-id="ev_92221b5123" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-ev-id="ev_51fc0b82e9">
                  <label data-ev-id="ev_e5e90d9e0e" className="block text-sm font-medium text-gray-700 mb-1">Botão principal</label>
                  <input data-ev-id="ev_37d0dd0c5b"
                type="text"
                value={heroBtnPrimary}
                onChange={(e) => setHeroBtnPrimary(e.target.value)}
                placeholder="Explorar cursos"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
                <div data-ev-id="ev_45f2011799">
                  <label data-ev-id="ev_62bbb49758" className="block text-sm font-medium text-gray-700 mb-1">Botão secundário</label>
                  <input data-ev-id="ev_0ac4c283d9"
                type="text"
                value={heroBtnSecondary}
                onChange={(e) => setHeroBtnSecondary(e.target.value)}
                placeholder="Ver destaques"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
            </div>
          }
        </div>

        {/* Stats Section */}
        <div data-ev-id="ev_83196a04e0" className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <button data-ev-id="ev_8ea09f7fe9"
          onClick={() => toggleSection('stats')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">

            <div data-ev-id="ev_94735a1b31" className="flex items-center gap-3">
              <div data-ev-id="ev_23929ca405" className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div data-ev-id="ev_3f9325ea42" className="text-left">
                <h2 data-ev-id="ev_4f0c6297ec" className="font-semibold text-gray-900">Estatísticas</h2>
                <p data-ev-id="ev_3b956c7105" className="text-sm text-gray-500">Números e métricas exibidas no site</p>
              </div>
            </div>
            {sections.stats.isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {sections.stats.isOpen &&
          <div data-ev-id="ev_3f31fc7481" className="px-6 pb-6 border-t border-gray-100 pt-4">
              <div data-ev-id="ev_deabe432ee" className="flex flex-col gap-3 mb-4">
                {stats.map((stat) =>
              <div data-ev-id="ev_153bfd1aa1" key={stat.id} className="flex gap-3 items-center">
                    <input data-ev-id="ev_c0749dda4f"
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                placeholder="10K+"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-primary outline-none" />

                    <input data-ev-id="ev_6a86483e3e"
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                placeholder="Alunos ativos"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                    <button data-ev-id="ev_7c49cf6ff8"
                onClick={() => removeStat(stat.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">

                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              )}
              </div>
              <button data-ev-id="ev_3bd0ba3366"
            onClick={addStat}
            className="px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary flex items-center gap-2">

                <Plus className="w-4 h-4" /> Adicionar estatística
              </button>
            </div>
          }
        </div>

        {/* CTA Section */}
        <div data-ev-id="ev_fa62b67522" className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <button data-ev-id="ev_eab79bdeef"
          onClick={() => toggleSection('cta')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">

            <div data-ev-id="ev_13aae39a17" className="flex items-center gap-3">
              <div data-ev-id="ev_a8660a7dfd" className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-green-600" />
              </div>
              <div data-ev-id="ev_097009f741" className="text-left">
                <h2 data-ev-id="ev_7d985ac30c" className="font-semibold text-gray-900">Chamada para Ação (CTA)</h2>
                <p data-ev-id="ev_f4053ba1fd" className="text-sm text-gray-500">Seção antes do rodapé com convite para cadastro</p>
              </div>
            </div>
            {sections.cta.isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {sections.cta.isOpen &&
          <div data-ev-id="ev_aa8a3661e7" className="px-6 pb-6 border-t border-gray-100 pt-4 flex flex-col gap-4">
              <div data-ev-id="ev_9273396522">
                <label data-ev-id="ev_ae45866015" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input data-ev-id="ev_6a0d397ace"
              type="text"
              value={ctaTitle}
              onChange={(e) => setCtaTitle(e.target.value)}
              placeholder="Pronto para começar sua jornada?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_e6d6ef781d">
                <label data-ev-id="ev_4a5d4a64cc" className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input data-ev-id="ev_c743398616"
              type="text"
              value={ctaSubtitle}
              onChange={(e) => setCtaSubtitle(e.target.value)}
              placeholder="Junte-se a milhares de alunos..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_a7397be5df">
                <label data-ev-id="ev_e6d4296554" className="block text-sm font-medium text-gray-700 mb-1">Texto do botão</label>
                <input data-ev-id="ev_3fe74def66"
              type="text"
              value={ctaButton}
              onChange={(e) => setCtaButton(e.target.value)}
              placeholder="Criar conta gratuita"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
            </div>
          }
        </div>

        {/* Footer Section */}
        <div data-ev-id="ev_45d1e2bc4e" className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
          <button data-ev-id="ev_56798f2f10"
          onClick={() => toggleSection('footer')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50">

            <div data-ev-id="ev_df37ecf907" className="flex items-center gap-3">
              <div data-ev-id="ev_b623df52b5" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Layout className="w-5 h-5 text-gray-600" />
              </div>
              <div data-ev-id="ev_fc39f7395d" className="text-left">
                <h2 data-ev-id="ev_9eeb350d90" className="font-semibold text-gray-900">Rodapé</h2>
                <p data-ev-id="ev_d4bd82641f" className="text-sm text-gray-500">Informações de contato e redes sociais</p>
              </div>
            </div>
            {sections.footer.isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {sections.footer.isOpen &&
          <div data-ev-id="ev_0a74af2c09" className="px-6 pb-6 border-t border-gray-100 pt-4 flex flex-col gap-4">
              <div data-ev-id="ev_465bbc39ed">
                <label data-ev-id="ev_5619b33523" className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
                <input data-ev-id="ev_7ad8453b64"
              type="text"
              value={footerDescription}
              onChange={(e) => setFooterDescription(e.target.value)}
              placeholder="Transformando vidas através da educação"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_c65e3567a9" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-ev-id="ev_065021cd95">
                  <label data-ev-id="ev_0d303bfb17" className="block text-sm font-medium text-gray-700 mb-1">E-mail de contato</label>
                  <input data-ev-id="ev_259ed34fad"
                type="email"
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder="contato@exemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
                <div data-ev-id="ev_7adfc0825b">
                  <label data-ev-id="ev_92131556a0" className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp</label>
                  <input data-ev-id="ev_267201950e"
                type="text"
                value={footerPhone}
                onChange={(e) => setFooterPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                </div>
              </div>
              <div data-ev-id="ev_48b80bd4ea">
                <label data-ev-id="ev_98dd97a822" className="block text-sm font-medium text-gray-700 mb-1">Endereço (opcional)</label>
                <input data-ev-id="ev_495f1de32e"
              type="text"
              value={footerAddress}
              onChange={(e) => setFooterAddress(e.target.value)}
              placeholder="Rua Exemplo, 123 - São Paulo/SP"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              
              <div data-ev-id="ev_17ecc491bf" className="border-t border-gray-100 pt-4 mt-2">
                <p data-ev-id="ev_cc63894ad2" className="text-sm font-medium text-gray-700 mb-3">Redes Sociais</p>
                <div data-ev-id="ev_42f9cb2288" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-ev-id="ev_970aa47e25">
                    <label data-ev-id="ev_3a8fd90ade" className="block text-xs text-gray-500 mb-1">Instagram</label>
                    <input data-ev-id="ev_d820eb24ca"
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/seu_perfil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                  <div data-ev-id="ev_0268ffc2a1">
                    <label data-ev-id="ev_307f793a93" className="block text-xs text-gray-500 mb-1">Facebook</label>
                    <input data-ev-id="ev_60b725ce37"
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  placeholder="https://facebook.com/sua_pagina"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                  <div data-ev-id="ev_638811ed7a">
                    <label data-ev-id="ev_f60042f5da" className="block text-xs text-gray-500 mb-1">YouTube</label>
                    <input data-ev-id="ev_7c5717ce84"
                  type="url"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  placeholder="https://youtube.com/seu_canal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                  <div data-ev-id="ev_7de34176ec">
                    <label data-ev-id="ev_3cc400021b" className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                    <input data-ev-id="ev_7bd8ba631b"
                  type="url"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/seu_perfil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <button data-ev-id="ev_b96029790f"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">

          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar página inicial</>}
        </button>
      </div>
    </AdminLayout>);

}