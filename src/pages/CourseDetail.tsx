import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  PlayCircle,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Loader2 } from
'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  cover_url: string | null;
  price: number;
  promotional_price: number | null;
  total_lessons: number | null;
  total_duration_minutes: number | null;
  category: {name: string;} | null;
  teacher: {full_name: string;avatar_url: string | null;} | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  is_free: boolean;
  video_duration_seconds: number | null;
}

export default function CourseDetail() {
  const { slug } = useParams<{slug: string;}>();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!supabase || !slug) return;
    try {
      const { data: courseData } = await supabase.
      from('courses').
      select(`
          id, title, slug, description, short_description, thumbnail_url, cover_url,
          price, promotional_price, total_lessons, total_duration_minutes,
          category:categories(name),
          teacher:profiles!courses_teacher_id_fkey(full_name, avatar_url)
        `).
      eq('slug', slug).
      eq('status', 'published').
      single();

      if (courseData) {
        setCourse(courseData as unknown as Course);

        // Fetch modules
        const { data: modulesData } = await supabase.
        from('modules').
        select(`
            id, title, description,
            lessons(id, title, is_free, video_duration_seconds, is_published)
          `).
        eq('course_id', courseData.id).
        order('sort_order');

        setModules(modulesData as Module[] || []);
        if (modulesData && modulesData.length > 0) {
          setExpandedModules([modulesData[0].id]);
        }

        // Check enrollment
        if (user) {
          const { data: enrollment } = await supabase.
          from('enrollments').
          select('id').
          eq('course_id', courseData.id).
          eq('user_id', user.id).
          eq('is_active', true).
          single();

          setIsEnrolled(!!enrollment);
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
    prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  if (isLoading) {
    return (
      <div data-ev-id="ev_a80249cb15" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (!course) {
    return (
      <div data-ev-id="ev_7590123d9d" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div data-ev-id="ev_3a469f6b9e" className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 data-ev-id="ev_eb2a473506" className="text-xl font-semibold text-gray-900 mb-2">Curso não encontrado</h2>
          <Link data-ev-id="ev_9f25e60980" to="/cursos" className="text-primary hover:underline">Voltar ao catálogo</Link>
        </div>
      </div>);

  }

  return (
    <div data-ev-id="ev_8a1525b1c4" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header data-ev-id="ev_68d81d79ee" className="bg-white border-b border-gray-200">
        <div data-ev-id="ev_39381856bf" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div data-ev-id="ev_2193860236" className="flex items-center justify-between">
            <Link data-ev-id="ev_eeaf945bb3" to="/cursos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" /> Voltar
            </Link>
            <div data-ev-id="ev_97dc6824e4" className="flex items-center gap-4">
              {user ?
              <>
                  {isAdmin &&
                <Link data-ev-id="ev_bd892a4add" to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
                }
                  <Link data-ev-id="ev_5b091ddc9f" to="/meus-cursos" className="text-gray-600 hover:text-gray-900">Meus cursos</Link>
                  <button data-ev-id="ev_dfbeaff6f8"
                onClick={() => signOut()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">

                    Sair
                  </button>
                </> :

              <>
                  <Link data-ev-id="ev_d0b416d44f" to="/login" className="text-gray-600 hover:text-gray-900">Entrar</Link>
                  <Link data-ev-id="ev_786ebc0d00" to="/cadastro" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-accent transition-colors shadow-lg">
                    Criar conta
                  </Link>
                </>
              }
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section data-ev-id="ev_cc7364744c" className="bg-secondary text-white py-16">
        <div data-ev-id="ev_a09dc11648" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-ev-id="ev_02db2d1e6a" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-ev-id="ev_c5e5bb07e7">
              {course.category &&
              <span data-ev-id="ev_78530aec21" className="text-primary font-medium mb-2 inline-block">{course.category.name}</span>
              }
              <h1 data-ev-id="ev_7b0f2af78e" className="text-4xl font-bold mb-4">{course.title}</h1>
              <p data-ev-id="ev_df372b107a" className="text-xl text-gray-300 mb-6">{course.short_description}</p>
              
              <div data-ev-id="ev_f7320898eb" className="flex items-center gap-6 text-gray-400 mb-8">
                <span data-ev-id="ev_62991c8179" className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> {totalLessons} aulas
                </span>
                {course.total_duration_minutes &&
                <span data-ev-id="ev_ab73c67e8f" className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> {Math.floor(course.total_duration_minutes / 60)}h de conteúdo
                  </span>
                }
              </div>

              {course.teacher &&
              <div data-ev-id="ev_617358c6e4" className="flex items-center gap-3">
                  {course.teacher.avatar_url ?
                <img data-ev-id="ev_56d3b88a36" src={course.teacher.avatar_url} alt={course.teacher.full_name || ''} className="w-12 h-12 rounded-full" /> :

                <div data-ev-id="ev_d57224d3a5" className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span data-ev-id="ev_323afa38b1" className="text-primary font-medium">{(course.teacher.full_name || '?').charAt(0)}</span>
                    </div>
                }
                  <div data-ev-id="ev_8f900e3737">
                    <p data-ev-id="ev_30c0b04bd5" className="text-sm text-gray-400">Instrutor</p>
                    <p data-ev-id="ev_f4c9e0fcb6" className="font-medium">{course.teacher.full_name}</p>
                  </div>
                </div>
              }
            </div>

            {/* Course Card */}
            <div data-ev-id="ev_d81fdea042" className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div data-ev-id="ev_472c613f71" className="aspect-video bg-gray-200">
                {course.thumbnail_url &&
                <img data-ev-id="ev_0297b7f184" src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                }
              </div>
              <div data-ev-id="ev_62e470cddb" className="p-6">
                <div data-ev-id="ev_137fea7174" className="mb-4">
                  {course.promotional_price ?
                  <>
                      <span data-ev-id="ev_c27f94483f" className="text-xl text-gray-400 line-through">{formatCurrency(course.price)}</span>
                      <span data-ev-id="ev_2426b98a2e" className="ml-3 text-3xl font-bold text-gray-900">{formatCurrency(course.promotional_price)}</span>
                    </> :

                  <span data-ev-id="ev_f623640177" className="text-3xl font-bold text-gray-900">{formatCurrency(course.price)}</span>
                  }
                </div>

                {isEnrolled ?
                <Link data-ev-id="ev_74ac5b5bb1"
                to={`/aula/${course.slug}`}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">

                    <PlayCircle className="w-5 h-5" /> Continuar assistindo
                  </Link> :

                <Link data-ev-id="ev_64735fdab2"
                to={`/checkout/${course.slug}`}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2">

                    <ShoppingCart className="w-5 h-5" /> Comprar curso
                  </Link>
                }

                <div data-ev-id="ev_1c37b40c90" className="mt-6 pt-6 border-t border-gray-200">
                  <h4 data-ev-id="ev_827e6a9adf" className="font-semibold text-gray-900 mb-3">Este curso inclui:</h4>
                  <ul data-ev-id="ev_bcd025b147" className="flex flex-col gap-2 text-sm text-gray-600">
                    <li data-ev-id="ev_f59d3998b6" className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {totalLessons} aulas em vídeo</li>
                    <li data-ev-id="ev_9cdb9107d1" className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Acesso vitalício</li>
                    <li data-ev-id="ev_e232e36e3e" className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Certificado de conclusão</li>
                    <li data-ev-id="ev_9800ad1065" className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Suporte do instrutor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div data-ev-id="ev_bf2c8972e1" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div data-ev-id="ev_11c975d2f8" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Description */}
          <div data-ev-id="ev_161398b456" className="lg:col-span-2">
            <h2 data-ev-id="ev_e5a383bc48" className="text-2xl font-bold text-gray-900 mb-6">Sobre o curso</h2>
            <div data-ev-id="ev_f5b6afa2cd" className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: course.description || '' }} />
          </div>

          {/* Curriculum */}
          <div data-ev-id="ev_a884f0ece6">
            <h2 data-ev-id="ev_7ef4d01bc8" className="text-2xl font-bold text-gray-900 mb-6">Conteúdo</h2>
            <div data-ev-id="ev_9c91f8a3f6" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {modules.map((module, index) =>
              <div data-ev-id="ev_3a1a18f30f" key={module.id} className={index > 0 ? 'border-t border-gray-200' : ''}>
                  <button data-ev-id="ev_aa46627140"
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">

                    <div data-ev-id="ev_b9ff2ba2ec" className="flex items-center gap-3">
                      {expandedModules.includes(module.id) ?
                    <ChevronDown className="w-5 h-5 text-gray-400" /> :

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                      <span data-ev-id="ev_eb8dec3715" className="font-medium text-gray-900">{module.title}</span>
                    </div>
                    <span data-ev-id="ev_cfe88bd8bb" className="text-sm text-gray-500">{module.lessons.length} aulas</span>
                  </button>
                  {expandedModules.includes(module.id) &&
                <ul data-ev-id="ev_07c82e03f2" className="bg-gray-50 border-t border-gray-200">
                      {module.lessons.map((lesson) =>
                  <li data-ev-id="ev_ab7330016a" key={lesson.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div data-ev-id="ev_d687255655" className="flex items-center gap-3">
                            {lesson.is_free ?
                      <PlayCircle className="w-4 h-4 text-primary" /> :

                      <Lock className="w-4 h-4 text-gray-400" />
                      }
                            <span data-ev-id="ev_464d3dc59a" className="text-sm text-gray-700">{lesson.title}</span>
                            {lesson.is_free &&
                      <span data-ev-id="ev_cf8c78f829" className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Grátis</span>
                      }
                          </div>
                          <span data-ev-id="ev_d1def05a86" className="text-xs text-gray-500">{formatDuration(lesson.video_duration_seconds)}</span>
                        </li>
                  )}
                    </ul>
                }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer data-ev-id="ev_13752619be" className="bg-gray-900 text-white py-12">
        <div data-ev-id="ev_92672969bf" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p data-ev-id="ev_805f037167" className="text-gray-400">© {new Date().getFullYear()} Lara Sathler. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>);

}