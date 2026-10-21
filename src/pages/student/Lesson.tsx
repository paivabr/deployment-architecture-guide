import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Lock,
  Menu,
  X,
  Loader2 } from
'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Module {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface LessonItem {
  id: string;
  title: string;
  lesson_type: string;
  video_url: string | null;
  video_id: string | null;
  video_provider: string | null;
  content: string | null;
  is_published: boolean;
}

export default function Lesson() {
  const { slug } = useParams<{slug: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const fetchData = useCallback(async () => {
    if (!supabase || !slug || !user) return;
    try {
      // Fetch course
      const { data: courseData } = await supabase.
      from('courses').
      select('id, title, slug').
      eq('slug', slug).
      single();

      if (!courseData) {
        navigate('/meus-cursos');
        return;
      }

      setCourse(courseData as Course);

      // Check enrollment
      const { data: enrollment } = await supabase.
      from('enrollments').
      select('id').
      eq('course_id', courseData.id).
      eq('user_id', user.id).
      eq('is_active', true).
      single();

      if (!enrollment) {
        navigate(`/curso/${slug}`);
        return;
      }

      // Fetch modules with lessons
      const { data: modulesData } = await supabase.
      from('modules').
      select(`
          id, title,
          lessons(id, title, lesson_type, video_url, video_id, video_provider, content, is_published)
        `).
      eq('course_id', courseData.id).
      order('sort_order');

      const mods = modulesData as Module[] || [];
      setModules(mods);

      // Set first lesson as current
      if (mods.length > 0 && mods[0].lessons.length > 0) {
        setCurrentLesson(mods[0].lessons[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug, user, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, fetchData, navigate]);

  const markAsComplete = async (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    setCompletedLessons([...completedLessons, lessonId]);
    // TODO: Save to database
  };

  const goToLesson = (lesson: LessonItem) => {
    setCurrentLesson(lesson);
    setSidebarOpen(false);
    markAsComplete(lesson.id);
  };

  if (isLoading) {
    return (
      <div data-ev-id="ev_66cf78f933" className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>);

  }

  return (
    <div data-ev-id="ev_b59c5f2521" className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside data-ev-id="ev_d0a3df7e25" className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }>
        <div data-ev-id="ev_6572ca9096" className="h-full flex flex-col">
          {/* Header */}
          <div data-ev-id="ev_e16be59927" className="p-4 border-b border-gray-700 flex items-center justify-between">
            <Link data-ev-id="ev_808fe96c1f" to="/meus-cursos" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" /> Voltar
            </Link>
            <button data-ev-id="ev_c523e1f803" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Course Title */}
          <div data-ev-id="ev_8d5d4cb0e4" className="p-4 border-b border-gray-700">
            <h2 data-ev-id="ev_96a3eb4d46" className="font-semibold text-white line-clamp-2">{course?.title}</h2>
            <p data-ev-id="ev_e45c6481ae" className="text-sm text-gray-400 mt-1">
              {completedLessons.length}/{allLessons.length} aulas concluídas
            </p>
          </div>

          {/* Modules */}
          <nav data-ev-id="ev_14a19b7af8" className="flex-1 overflow-y-auto p-4">
            {modules.map((module) =>
            <div data-ev-id="ev_0508946e6a" key={module.id} className="mb-6">
                <h3 data-ev-id="ev_2c7a5faef3" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{module.title}</h3>
                <ul data-ev-id="ev_3736b5b883" className="flex flex-col gap-1">
                  {module.lessons.map((lesson) =>
                <li data-ev-id="ev_ac747ff390" key={lesson.id}>
                      <button data-ev-id="ev_939d565d55"
                  onClick={() => goToLesson(lesson)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentLesson?.id === lesson.id ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`
                  }>

                        {completedLessons.includes(lesson.id) ?
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :

                    <PlayCircle className="w-4 h-4 shrink-0" />
                    }
                        <span data-ev-id="ev_0f56f2c6a9" className="text-sm text-left line-clamp-1">{lesson.title}</span>
                      </button>
                    </li>
                )}
                </ul>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen &&
      <div data-ev-id="ev_d602d9b417" className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      }

      {/* Main Content */}
      <main data-ev-id="ev_499eeff1c0" className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header data-ev-id="ev_fd06ff144b" className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <button data-ev-id="ev_d7e4a34ecd" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <h1 data-ev-id="ev_7935f2afc4" className="text-white font-medium truncate">{currentLesson?.title}</h1>
          <div data-ev-id="ev_f77bf80d94" className="w-10" />
        </header>

        {/* Video/Content */}
        <div data-ev-id="ev_4493aefcdb" className="flex-1 flex flex-col">
          {currentLesson?.lesson_type === 'video' ?
          <div data-ev-id="ev_b45710c0ff" className="aspect-video bg-black">
              {currentLesson.video_provider === 'pandavideo' && currentLesson.video_id ?
            <iframe data-ev-id="ev_612e9bb4da"
            src={`https://player-vz-${currentLesson.video_id.substring(0, 8)}.tv.pandavideo.com.br/embed/?v=${currentLesson.video_id}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" /> :

            currentLesson.video_url ?
            <iframe data-ev-id="ev_ff7c9cb98c"
            src={currentLesson.video_url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" /> :


            <div data-ev-id="ev_1606a6e507" className="w-full h-full flex items-center justify-center text-gray-500">
                  Vídeo não disponível
                </div>
            }
            </div> :

          <div data-ev-id="ev_6cc668f29f" className="flex-1 p-8 overflow-y-auto">
              <div data-ev-id="ev_e7c3c3dbc2" className="max-w-3xl mx-auto prose prose-invert" dangerouslySetInnerHTML={{ __html: currentLesson?.content || '' }} />
            </div>
          }

          {/* Navigation */}
          <div data-ev-id="ev_83b2883985" className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
            {prevLesson ?
            <button data-ev-id="ev_de8310d845"
            onClick={() => goToLesson(prevLesson)}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white">

                <ChevronLeft className="w-5 h-5" /> Anterior
              </button> :

            <div data-ev-id="ev_4e7a29e7af" />
            }

            <button data-ev-id="ev_5c671ab687"
            onClick={() => currentLesson && markAsComplete(currentLesson.id)}
            disabled={currentLesson && completedLessons.includes(currentLesson.id)}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
            currentLesson && completedLessons.includes(currentLesson.id) ?
            'bg-green-600/20 text-green-400 cursor-default' :
            'bg-primary hover:bg-primary/90 text-white'}`
            }>

              <CheckCircle className="w-5 h-5" />
              {currentLesson && completedLessons.includes(currentLesson.id) ? 'Concluída' : 'Marcar como concluída'}
            </button>

            {nextLesson ?
            <button data-ev-id="ev_8380da4ca6"
            onClick={() => goToLesson(nextLesson)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg">

                Próxima <ChevronRight className="w-5 h-5" />
              </button> :

            <div data-ev-id="ev_66d4377b51" />
            }
          </div>
        </div>
      </main>
    </div>);

}