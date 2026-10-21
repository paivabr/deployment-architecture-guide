import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { GraduationCap, Play, Users, Award, ChevronRight, Star, Heart, Zap, Target, Rocket, CheckCircle, Shield, Sparkles } from 'lucide-react';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface AboutSettings {
  title: string;
  subtitle: string;
  photoUrl: string;
  name: string;
  bio: string;
  showPhoto: boolean;
  showCards: boolean;
  cards: FeatureCard[];
}

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Users,
  Award,
  Star,
  Heart,
  Zap,
  Target,
  Rocket,
  CheckCircle,
  Shield
};

interface StatItem {
  id: string;
  value: string;
  label: string;
}

interface HomeSettings {
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBtnPrimary: string;
  heroBtnSecondary: string;
  stats: StatItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footerDescription: string;
  footerEmail: string;
  footerPhone: string;
  footerAddress: string;
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialLinkedin: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail_url: string | null;
  price: number;
  promotional_price: number | null;
  category: {name: string;} | null;
}

export default function Index() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [homeSettings, setHomeSettings] = useState<HomeSettings>({
    heroBadge: 'Plataforma de cursos online',
    heroTitle: 'Transforme seu futuro com',
    heroTitleHighlight: 'conhecimento',
    heroSubtitle: 'Aprenda com os melhores profissionais do mercado. Cursos práticos, certificados reconhecidos e suporte especializado.',
    heroBtnPrimary: 'Explorar cursos',
    heroBtnSecondary: 'Ver destaques',
    stats: [
    { id: '1', value: '10K+', label: 'Alunos ativos' },
    { id: '2', value: '150+', label: 'Cursos disponíveis' },
    { id: '3', value: '98%', label: 'Satisfação' },
    { id: '4', value: '50+', label: 'Instrutores experts' }],

    ctaTitle: 'Pronto para começar sua jornada?',
    ctaSubtitle: 'Junte-se a milhares de alunos que já estão transformando suas carreiras.',
    ctaButton: 'Criar conta gratuita',
    footerDescription: 'Transformando vidas através da educação de qualidade.',
    footerEmail: 'contato@larasathler.com.br',
    footerPhone: '(11) 99999-9999',
    footerAddress: '',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialLinkedin: ''
  });

  const [aboutSettings, setAboutSettings] = useState<AboutSettings>({
    title: 'Por que escolher a Lara Sathler?',
    subtitle: 'Oferecemos uma experiência de aprendizado completa e personalizada',
    photoUrl: '',
    name: 'Lara Sathler',
    bio: '',
    showPhoto: true,
    showCards: true,
    cards: [
    { id: '1', icon: 'GraduationCap', title: 'Certificado reconhecido', description: 'Certificados válidos em todo o território nacional, aceitos pelas principais empresas.' },
    { id: '2', icon: 'Users', title: 'Comunidade ativa', description: 'Conecte-se com outros alunos, troque experiências e cresça junto.' },
    { id: '3', icon: 'Award', title: 'Conteúdo premium', description: 'Cursos criados por especialistas com anos de experiência no mercado.' }]

  });

  const fetchFeaturedCourses = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await supabase.
      from('courses').
      select(`
          id, title, slug, short_description, thumbnail_url, price, promotional_price,
          category:categories(name)
        `).
      eq('status', 'published').
      eq('is_featured', true).
      order('created_at', { ascending: false }).
      limit(6);

      setFeaturedCourses(data as unknown as Course[] || []);
    } catch (err) {
      console.error('Error fetching featured courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHomeSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      like('key', 'home_%');

      if (data) {
        setHomeSettings((prev) => {
          const newSettings = { ...prev };
          data.forEach((s) => {
            const val = s.value as string;
            switch (s.key) {
              case 'home_hero_badge':if (val) newSettings.heroBadge = val;break;
              case 'home_hero_title':if (val) newSettings.heroTitle = val;break;
              case 'home_hero_title_highlight':if (val) newSettings.heroTitleHighlight = val;break;
              case 'home_hero_subtitle':if (val) newSettings.heroSubtitle = val;break;
              case 'home_hero_btn_primary':if (val) newSettings.heroBtnPrimary = val;break;
              case 'home_hero_btn_secondary':if (val) newSettings.heroBtnSecondary = val;break;
              case 'home_stats':if (Array.isArray(s.value)) newSettings.stats = s.value as unknown as StatItem[];break;
              case 'home_cta_title':if (val) newSettings.ctaTitle = val;break;
              case 'home_cta_subtitle':if (val) newSettings.ctaSubtitle = val;break;
              case 'home_cta_button':if (val) newSettings.ctaButton = val;break;
              case 'home_footer_description':if (val) newSettings.footerDescription = val;break;
              case 'home_footer_email':if (val) newSettings.footerEmail = val;break;
              case 'home_footer_phone':if (val) newSettings.footerPhone = val;break;
              case 'home_footer_address':newSettings.footerAddress = val || '';break;
              case 'home_social_instagram':newSettings.socialInstagram = val || '';break;
              case 'home_social_facebook':newSettings.socialFacebook = val || '';break;
              case 'home_social_youtube':newSettings.socialYoutube = val || '';break;
              case 'home_social_linkedin':newSettings.socialLinkedin = val || '';break;
            }
          });
          return newSettings;
        });
      }
    } catch (err) {
      console.error('Error fetching home settings:', err);
    }
  }, []);

  const fetchAboutSettings = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('settings').
      select('key, value').
      in('key', [
      'about_title', 'about_subtitle', 'about_photo_url', 'about_name',
      'about_bio', 'about_show_photo', 'about_show_cards', 'about_cards']
      );

      if (data) {
        setAboutSettings((prev) => {
          const newSettings = { ...prev };
          data.forEach((s) => {
            switch (s.key) {
              case 'about_title':if (s.value) newSettings.title = s.value as string;break;
              case 'about_subtitle':if (s.value) newSettings.subtitle = s.value as string;break;
              case 'about_photo_url':newSettings.photoUrl = s.value as string || '';break;
              case 'about_name':if (s.value) newSettings.name = s.value as string;break;
              case 'about_bio':newSettings.bio = s.value as string || '';break;
              case 'about_show_photo':newSettings.showPhoto = s.value !== false;break;
              case 'about_show_cards':newSettings.showCards = s.value !== false;break;
              case 'about_cards':
                if (Array.isArray(s.value)) newSettings.cards = s.value as unknown as FeatureCard[];
                break;
            }
          });
          return newSettings;
        });
      }
    } catch (err) {
      console.error('Error fetching about settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchHomeSettings();
    fetchAboutSettings();
  }, [fetchFeaturedCourses, fetchHomeSettings, fetchAboutSettings]);

  const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div data-ev-id="ev_a44c1501f9" className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section data-ev-id="ev_46facbd8d8" className="relative bg-gradient-to-br from-secondary via-secondary to-gray-900 text-white py-24 overflow-hidden">
        <div data-ev-id="ev_b092517cbf" className="absolute inset-0 opacity-10">
          <div data-ev-id="ev_396f94d1a0" className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div data-ev-id="ev_4edbc68a98" className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        <div data-ev-id="ev_90c8c786f2" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div data-ev-id="ev_31150aea2d" className="max-w-3xl">
            <div data-ev-id="ev_127b3bc118" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span data-ev-id="ev_f6f08eba77" className="text-sm text-primary">{homeSettings.heroBadge}</span>
            </div>
            <h1 data-ev-id="ev_086271cc50" className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {homeSettings.heroTitle} <span data-ev-id="ev_b75d5b0a32" className="text-primary">{homeSettings.heroTitleHighlight}</span>
            </h1>
            <p data-ev-id="ev_65a99df75b" className="text-xl text-gray-300 mb-8 leading-relaxed">
              {homeSettings.heroSubtitle}
            </p>
            <div data-ev-id="ev_6b821605ce" className="flex flex-col sm:flex-row gap-4">
              <Link data-ev-id="ev_ac2c4c77ae" to="/cursos" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-accent transition-colors shadow-xl shadow-primary/30">
                {homeSettings.heroBtnPrimary} <ChevronRight className="w-5 h-5" />
              </Link>
              <a data-ev-id="ev_66422a1927" href="#cursos-destaque" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors backdrop-blur">
                <Play className="w-5 h-5" /> {homeSettings.heroBtnSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section data-ev-id="ev_e91392b817" className="py-16 bg-muted">
        <div data-ev-id="ev_1289490e0c" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-ev-id="ev_e2ea5c461b" className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {homeSettings.stats.map((stat) =>
            <div data-ev-id="ev_2b97a287c2" key={stat.id} className="text-center">
                <p data-ev-id="ev_4e2781aea6" className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p data-ev-id="ev_222d648e28" className="text-gray-600">{stat.label}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section data-ev-id="ev_5861849183" id="cursos-destaque" className="py-24">
        <div data-ev-id="ev_b2df91481f" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-ev-id="ev_83c04a3eee" className="flex items-center justify-between mb-12">
            <div data-ev-id="ev_37a6dda906">
              <h2 data-ev-id="ev_755b655fdd" className="text-4xl font-bold text-secondary mb-2">Cursos em Destaque</h2>
              <p data-ev-id="ev_0c78d3b23c" className="text-xl text-gray-600">Os mais procurados pelos nossos alunos</p>
            </div>
            <Link data-ev-id="ev_45083b2bb2" to="/cursos" className="hidden md:inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors">
              Ver todos <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading ?
          <div data-ev-id="ev_e719ec440e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) =>
            <div data-ev-id="ev_6f3dc278da" key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div data-ev-id="ev_07c86a8f8e" className="aspect-video bg-gray-200" />
                  <div data-ev-id="ev_c31c221283" className="p-6 flex flex-col gap-3">
                    <div data-ev-id="ev_0a665d1364" className="h-4 bg-gray-200 rounded w-1/4" />
                    <div data-ev-id="ev_446967c869" className="h-6 bg-gray-200 rounded w-3/4" />
                    <div data-ev-id="ev_8ccc0a36f4" className="h-4 bg-gray-200 rounded w-full" />
                    <div data-ev-id="ev_15f01a6050" className="h-8 bg-gray-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
            )}
            </div> :
          featuredCourses.length === 0 ?
          <div data-ev-id="ev_97464c21f0" className="text-center py-16 bg-muted rounded-2xl">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 data-ev-id="ev_7a13225c7d" className="text-xl font-semibold text-gray-900 mb-2">Em breve novos cursos!</h3>
              <p data-ev-id="ev_ff888c2b0a" className="text-gray-600 mb-6">Estamos preparando conteúdos incríveis para você.</p>
              <Link data-ev-id="ev_9f1d00c4bc" to="/cursos" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-colors">
                Ver catálogo completo
              </Link>
            </div> :

          <div data-ev-id="ev_b224e8954e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) =>
            <Link data-ev-id="ev_ac9d528a27"
            key={course.id}
            to={`/curso/${course.slug}`}
            className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all group">

                  <div data-ev-id="ev_352a920d18" className="aspect-video bg-gray-100 relative overflow-hidden">
                    {course.thumbnail_url ?
                <img data-ev-id="ev_c8109206f1" src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :

                <div data-ev-id="ev_569c091df7" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <GraduationCap className="w-12 h-12 text-primary/50" />
                      </div>
                }
                    {course.promotional_price &&
                <span data-ev-id="ev_5c655cc082" className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {Math.round((1 - course.promotional_price / course.price) * 100)}% OFF
                      </span>
                }
                  </div>
                  <div data-ev-id="ev_7ee42f233e" className="p-6">
                    {course.category &&
                <span data-ev-id="ev_26d934d884" className="text-xs text-primary font-semibold uppercase tracking-wider">{course.category.name}</span>
                }
                    <h3 data-ev-id="ev_79a4c150d9" className="font-bold text-secondary text-lg mt-2 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p data-ev-id="ev_d32ffaaaa1" className="text-gray-600 text-sm line-clamp-2 mb-4">{course.short_description || 'Descubra esse conteúdo incrível'}</p>
                    
                    <div data-ev-id="ev_54cbcbb300" className="flex items-center justify-between">
                      {course.promotional_price ?
                  <div data-ev-id="ev_295a8e9e2e">
                          <span data-ev-id="ev_7b05dfba29" className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</span>
                          <span data-ev-id="ev_30896043ad" className="ml-2 text-xl font-bold text-primary">{formatCurrency(course.promotional_price)}</span>
                        </div> :

                  <span data-ev-id="ev_1b0d3092e1" className="text-xl font-bold text-secondary">{formatCurrency(course.price)}</span>
                  }
                    </div>
                  </div>
                </Link>
            )}
            </div>
          }

          <div data-ev-id="ev_9ea88c2a76" className="text-center mt-12 md:hidden">
            <Link data-ev-id="ev_08d9393891" to="/cursos" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-colors">
              Ver todos os cursos <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About / Features Section */}
      <section data-ev-id="ev_41b426faf3" id="sobre" className="py-24 bg-muted">
        <div data-ev-id="ev_cba494d5d8" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-ev-id="ev_b594d7ee5c" className="text-center mb-16">
            <h2 data-ev-id="ev_879fb6bc2f" className="text-4xl font-bold text-secondary mb-4">{aboutSettings.title}</h2>
            <p data-ev-id="ev_8e04c0765f" className="text-xl text-gray-600 max-w-2xl mx-auto">{aboutSettings.subtitle}</p>
          </div>

          {/* Photo & Bio */}
          {aboutSettings.showPhoto && (aboutSettings.photoUrl || aboutSettings.bio) &&
          <div data-ev-id="ev_3e13557a6d" className="bg-white rounded-2xl p-8 md:p-12 border border-border mb-12 flex flex-col md:flex-row items-center gap-8">
              {aboutSettings.photoUrl &&
            <div data-ev-id="ev_5f6a2e7f41" className="shrink-0">
                  <img data-ev-id="ev_05eeb6890f"
              src={aboutSettings.photoUrl}
              alt={aboutSettings.name}
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-primary/20 shadow-xl" />

                </div>
            }
              <div data-ev-id="ev_8d0299e1eb" className={aboutSettings.photoUrl ? 'text-center md:text-left' : 'text-center'}>
                <h3 data-ev-id="ev_c301d297d5" className="text-2xl font-bold text-secondary mb-2">{aboutSettings.name}</h3>
                {aboutSettings.bio &&
              <p data-ev-id="ev_2b621d9ea8" className="text-gray-600 leading-relaxed whitespace-pre-line">{aboutSettings.bio}</p>
              }
              </div>
            </div>
          }

          {/* Feature Cards */}
          {aboutSettings.showCards && aboutSettings.cards.length > 0 &&
          <div data-ev-id="ev_165f60019f" className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aboutSettings.cards.map((card) => {
              const IconComponent = iconMap[card.icon] || Star;
              return (
                <div data-ev-id="ev_c57a94486a" key={card.id} className="bg-white rounded-2xl p-8 border border-border hover:shadow-xl hover:shadow-primary/10 transition-shadow">
                    <div data-ev-id="ev_8ef3c90a02" className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <h3 data-ev-id="ev_5333b6b3d5" className="text-xl font-bold text-secondary mb-3">{card.title}</h3>
                    <p data-ev-id="ev_592f27455f" className="text-gray-600 leading-relaxed">{card.description}</p>
                  </div>);

            })}
            </div>
          }
        </div>
      </section>

      {/* CTA */}
      <section data-ev-id="ev_77c2127aa8" className="py-24 bg-secondary">
        <div data-ev-id="ev_b05fc73213" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-ev-id="ev_3c568147a4" className="text-4xl font-bold text-white mb-6">{homeSettings.ctaTitle}</h2>
          <p data-ev-id="ev_dd988b28cd" className="text-xl text-gray-300 mb-10">{homeSettings.ctaSubtitle}</p>
          <Link data-ev-id="ev_581dcad47d" to="/cadastro" className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-accent transition-colors shadow-xl shadow-primary/30">
            {homeSettings.ctaButton} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer data-ev-id="ev_e747e03121" id="contato" className="bg-gray-900 text-white py-16">
        <div data-ev-id="ev_0a7db1cdbe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-ev-id="ev_4c91e1a5e7" className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div data-ev-id="ev_f9e36040f9">
              <div data-ev-id="ev_ad1b83c450" className="flex items-center gap-2 mb-4">
                <div data-ev-id="ev_81db43d7de" className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span data-ev-id="ev_2572b77c41" className="text-xl font-bold">Lara Sathler</span>
              </div>
              <p data-ev-id="ev_6dd0ea9263" className="text-gray-400">{homeSettings.footerDescription}</p>
            </div>
            <div data-ev-id="ev_98dcc489c2">
              <h4 data-ev-id="ev_3bb64b1b87" className="font-semibold mb-4 text-primary">Plataforma</h4>
              <ul data-ev-id="ev_a6682730c1" className="flex flex-col gap-2 text-gray-400">
                <li data-ev-id="ev_f02986c25f"><Link data-ev-id="ev_89abf1e642" to="/cursos" className="hover:text-white transition-colors">Cursos</Link></li>
                <li data-ev-id="ev_20438ed7a0"><a data-ev-id="ev_688ca82baf" href="#" className="hover:text-white transition-colors">Instrutores</a></li>
                <li data-ev-id="ev_43e325082b"><a data-ev-id="ev_3786078817" href="#" className="hover:text-white transition-colors">Preços</a></li>
              </ul>
            </div>
            <div data-ev-id="ev_943b22b572">
              <h4 data-ev-id="ev_f97c9d30b2" className="font-semibold mb-4 text-primary">Suporte</h4>
              <ul data-ev-id="ev_2390e7b5d7" className="flex flex-col gap-2 text-gray-400">
                <li data-ev-id="ev_b62bc17ad9"><a data-ev-id="ev_2904193a37" href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li data-ev-id="ev_933165722f"><a data-ev-id="ev_5169327306" href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li data-ev-id="ev_ad539351c9"><a data-ev-id="ev_59a1285b2f" href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
              </ul>
            </div>
            <div data-ev-id="ev_0ae228c5c2">
              <h4 data-ev-id="ev_94a6e04a32" className="font-semibold mb-4 text-primary">Contato</h4>
              <ul data-ev-id="ev_81c8547a57" className="flex flex-col gap-2 text-gray-400">
                {homeSettings.footerEmail && <li data-ev-id="ev_e148675765">{homeSettings.footerEmail}</li>}
                {homeSettings.footerPhone && <li data-ev-id="ev_4a194fab5a">{homeSettings.footerPhone}</li>}
                {homeSettings.footerAddress && <li data-ev-id="ev_7cd49c9553">{homeSettings.footerAddress}</li>}
              </ul>
              {(homeSettings.socialInstagram || homeSettings.socialFacebook || homeSettings.socialYoutube || homeSettings.socialLinkedin) &&
              <div data-ev-id="ev_1256e1fbc0" className="flex gap-3 mt-4">
                  {homeSettings.socialInstagram &&
                <a data-ev-id="ev_831f22fde5" href={homeSettings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                      <svg data-ev-id="ev_4af7e53a4d" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path data-ev-id="ev_618864b492" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    </a>
                }
                  {homeSettings.socialFacebook &&
                <a data-ev-id="ev_fabda42af4" href={homeSettings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                      <svg data-ev-id="ev_59157c08ba" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path data-ev-id="ev_ab15074d32" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                }
                  {homeSettings.socialYoutube &&
                <a data-ev-id="ev_4f17e86fd9" href={homeSettings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="YouTube">
                      <svg data-ev-id="ev_370fab54c6" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path data-ev-id="ev_3124988db7" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                    </a>
                }
                  {homeSettings.socialLinkedin &&
                <a data-ev-id="ev_e7b61da9d1" href={homeSettings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors" aria-label="LinkedIn">
                      <svg data-ev-id="ev_b3c53540d1" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path data-ev-id="ev_ae2d328717" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </a>
                }
                </div>
              }
            </div>
          </div>
          <div data-ev-id="ev_482e6691e2" className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p data-ev-id="ev_98a7e862fa">© {new Date().getFullYear()} Lara Sathler. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>);

}