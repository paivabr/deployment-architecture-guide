import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import {
  GraduationCap,
  PlayCircle,
  Clock,
  CheckCircle,
  Loader2,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  TrendingUp } from
'lucide-react';

interface Enrollment {
  id: string;
  enrolled_at: string;
  progress_percent: number | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    total_lessons: number | null;
  };
}

interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  type: 'live' | 'deadline' | 'reminder';
  courseSlug?: string;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];


export default function MyCourses() {
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<ScheduledEvent[]>([]); // Will be populated from database

  const fetchEnrollments = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase.
      from('enrollments').
      select(`
          id, enrolled_at, progress_percent,
          course:courses(id, title, slug, thumbnail_url, total_lessons)
        `).
      eq('user_id', user.id).
      eq('is_active', true).
      order('enrolled_at', { ascending: false });

      setEnrollments(data as unknown as Enrollment[] || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/meus-cursos');
      return;
    }
    fetchEnrollments();
  }, [user, navigate, fetchEnrollments]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div data-ev-id="ev_31fb0aea30" key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = events.filter(
        (e) => e.date.toDateString() === date.toDateString()
      );

      days.push(
        <div data-ev-id="ev_43c40dbc80"
        key={day}
        className={`h-10 flex items-center justify-center relative rounded-lg text-sm ${
        isToday ?
        'bg-primary text-white font-bold' :
        'text-gray-700 hover:bg-gray-100'}`
        }>

          {day}
          {dayEvents.length > 0 &&
          <span data-ev-id="ev_ea3bd4614c" className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
          }
        </div>
      );
    }

    return days;
  };

  // Stats
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.progress_percent === 100).length;
  const inProgressCourses = enrollments.filter((e) => (e.progress_percent || 0) > 0 && (e.progress_percent || 0) < 100).length;
  const avgProgress = totalCourses > 0 ?
  Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / totalCourses) :
  0;

  if (isLoading) {
    return (
      <div data-ev-id="ev_fdda9c34d9" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  return (
    <div data-ev-id="ev_9a8e3dfc73" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header data-ev-id="ev_50a1283ae0" className="bg-white border-b border-gray-200">
        <div data-ev-id="ev_15ca358bed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div data-ev-id="ev_e6f35f9099" className="flex items-center justify-between">
            <Link data-ev-id="ev_a0fecc2520" to="/" className="flex items-center gap-2">
              {theme.logoUrl ?
              <img data-ev-id="ev_bb108b9b51" src={theme.logoUrl} alt="Logo" className="h-10 w-auto" /> :

              <span data-ev-id="ev_b0e6b5d322" className="text-2xl font-bold text-primary">Lara Sathler</span>
              }
            </Link>
            <div data-ev-id="ev_1915267c55" className="flex items-center gap-4">
              <Link data-ev-id="ev_5a21f891ae" to="/cursos" className="text-gray-600 hover:text-gray-900">Catálogo</Link>
              <div data-ev-id="ev_397dde1462" className="flex items-center gap-3">
                <div data-ev-id="ev_c4f084760f" className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <span data-ev-id="ev_a0fe7a8854" className="text-sm font-medium text-primary">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <button data-ev-id="ev_c35a2e72e1"
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">

                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div data-ev-id="ev_25e9c4a178" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Stats */}
        <div data-ev-id="ev_3b2eb693e1" className="mb-8">
          <h1 data-ev-id="ev_f14eb8e10f" className="text-2xl font-bold text-gray-900">
            Olá, {profile?.full_name?.split(' ')[0] || 'Aluno'}!
          </h1>
          <p data-ev-id="ev_18b6a3f331" className="text-gray-600 mt-1">Continue de onde parou</p>
        </div>

        {/* Stats Cards */}
        <div data-ev-id="ev_e800b400bb" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div data-ev-id="ev_0053172364" className="bg-white rounded-xl border border-gray-200 p-4">
            <div data-ev-id="ev_776a3a6695" className="flex items-center gap-3">
              <div data-ev-id="ev_c8d172ad92" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div data-ev-id="ev_b9e3eec2e2">
                <p data-ev-id="ev_ea4a73709d" className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                <p data-ev-id="ev_3bb3c9d59d" className="text-sm text-gray-500">Cursos</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_122f843fbf" className="bg-white rounded-xl border border-gray-200 p-4">
            <div data-ev-id="ev_e381c58108" className="flex items-center gap-3">
              <div data-ev-id="ev_f994e53a52" className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div data-ev-id="ev_7ddc18c1ee">
                <p data-ev-id="ev_974646453b" className="text-2xl font-bold text-gray-900">{completedCourses}</p>
                <p data-ev-id="ev_f841211a5b" className="text-sm text-gray-500">Concluídos</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_aaaa281fba" className="bg-white rounded-xl border border-gray-200 p-4">
            <div data-ev-id="ev_867f731c12" className="flex items-center gap-3">
              <div data-ev-id="ev_92cb4b5eeb" className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div data-ev-id="ev_e27008012c">
                <p data-ev-id="ev_a5147e53c6" className="text-2xl font-bold text-gray-900">{inProgressCourses}</p>
                <p data-ev-id="ev_e47b10c958" className="text-sm text-gray-500">Em andamento</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_75784cc731" className="bg-white rounded-xl border border-gray-200 p-4">
            <div data-ev-id="ev_76e1f924cd" className="flex items-center gap-3">
              <div data-ev-id="ev_6b778186e8" className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div data-ev-id="ev_61e4b1e175">
                <p data-ev-id="ev_9a109dddf0" className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
                <p data-ev-id="ev_34f866d744" className="text-sm text-gray-500">Progresso médio</p>
              </div>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_c8af851ab8" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses List */}
          <div data-ev-id="ev_1e0279deae" className="lg:col-span-2">
            <h2 data-ev-id="ev_06e46f6eb8" className="text-lg font-semibold text-gray-900 mb-4">Meus Cursos</h2>

            {enrollments.length === 0 ?
            <div data-ev-id="ev_ad41ccfa3a" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 data-ev-id="ev_1efb6852fd" className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso ainda</h3>
                <p data-ev-id="ev_cfe7decf2d" className="text-gray-600 mb-6">Explore nosso catálogo e comece a aprender hoje!</p>
                <Link data-ev-id="ev_0a4cafa3c7"
              to="/cursos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">

                  Ver cursos
                </Link>
              </div> :

            <div data-ev-id="ev_7021062a35" className="flex flex-col gap-4">
                {enrollments.map((enrollment) =>
              <Link data-ev-id="ev_4da0533b66"
              key={enrollment.id}
              to={`/aula/${enrollment.course.slug}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex">

                    <div data-ev-id="ev_5d9e0d03c0" className="w-48 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                      {enrollment.course.thumbnail_url ?
                  <img data-ev-id="ev_1e2d638ece"
                  src={enrollment.course.thumbnail_url}
                  alt={enrollment.course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :


                  <div data-ev-id="ev_93133dd14a" className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="w-12 h-12 text-gray-300" />
                        </div>
                  }
                      <div data-ev-id="ev_b05c5fb748" className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div data-ev-id="ev_d28754f098" className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div data-ev-id="ev_98e37fdb60" className="flex-1 p-4 flex flex-col justify-between">
                      <div data-ev-id="ev_8ea778b38f">
                        <h3 data-ev-id="ev_46b2abc0e5" className="font-semibold text-gray-900 mb-1">{enrollment.course.title}</h3>
                        <p data-ev-id="ev_1407285598" className="text-sm text-gray-500">
                          {enrollment.course.total_lessons || 0} aulas
                        </p>
                      </div>
                      <div data-ev-id="ev_91dc5ec821">
                        <div data-ev-id="ev_915ac6f88d" className="flex justify-between text-sm mb-1">
                          <span data-ev-id="ev_8fdf655904" className="text-gray-500">Progresso</span>
                          <span data-ev-id="ev_571540a6db" className="font-medium text-gray-900">{enrollment.progress_percent || 0}%</span>
                        </div>
                        <div data-ev-id="ev_3b2f38bef4" className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div data-ev-id="ev_45fcf6df72"
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${enrollment.progress_percent || 0}%` }} />

                        </div>
                      </div>
                      <div data-ev-id="ev_d4827de6f2" className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        {enrollment.progress_percent === 100 ?
                    <span data-ev-id="ev_09c62afa7d" className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" /> Concluído
                          </span> :

                    <span data-ev-id="ev_5fc0040e0c" className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Em andamento
                          </span>
                    }
                        <span data-ev-id="ev_587435efc3" className="text-primary font-medium group-hover:underline">Continuar →</span>
                      </div>
                    </div>
                  </Link>
              )}
              </div>
            }
          </div>

          {/* Sidebar with Calendar */}
          <div data-ev-id="ev_c609c9a4fc" className="flex flex-col gap-6">
            {/* Calendar */}
            <div data-ev-id="ev_57647250c6" className="bg-white rounded-xl border border-gray-200 p-6">
              <div data-ev-id="ev_8aff6c0188" className="flex items-center justify-between mb-4">
                <h2 data-ev-id="ev_5f6d6879e6" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Calendário
                </h2>
                <div data-ev-id="ev_12a223f5a8" className="flex items-center gap-1">
                  <button data-ev-id="ev_8b732e8fc5"
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded">

                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button data-ev-id="ev_df6ddbaf27"
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded">

                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <p data-ev-id="ev_6460698867" className="text-sm font-medium text-gray-700 mb-4 text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>

              {/* Weekday headers */}
              <div data-ev-id="ev_42b85713b8" className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) =>
                <div data-ev-id="ev_aaba55a2d0" key={day} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                )}
              </div>

              {/* Calendar days */}
              <div data-ev-id="ev_a53fb0520a" className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            {/* Upcoming Events */}
            <div data-ev-id="ev_7a061f03fa" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_4ad69290b2" className="text-lg font-semibold text-gray-900 mb-4">Próximos eventos</h2>
              {events.length === 0 ?
              <div data-ev-id="ev_e78a6dea82" className="text-center py-6 text-gray-500">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p data-ev-id="ev_872eaa8ee8" className="text-sm">Nenhum evento agendado</p>
                </div> :

              <div data-ev-id="ev_9eb7c39b9f" className="flex flex-col gap-3">
                  {events.slice(0, 5).map((event) =>
                <div data-ev-id="ev_abc9437ba7"
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">

                      <div data-ev-id="ev_4368456b1e" className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  event.type === 'live' ? 'bg-red-100 text-red-600' :
                  event.type === 'deadline' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'}`
                  }>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div data-ev-id="ev_da0650b959">
                        <p data-ev-id="ev_94fa2fd4a6" className="font-medium text-gray-900 text-sm">{event.title}</p>
                        <p data-ev-id="ev_5cb258031e" className="text-xs text-gray-500">
                          {event.date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                )}
                </div>
              }
            </div>

            {/* Quick Stats */}
            <div data-ev-id="ev_cf490b542c" className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
              <h3 data-ev-id="ev_510eeb8708" className="font-semibold mb-4">Continue aprendendo!</h3>
              <p data-ev-id="ev_a5fe3d7844" className="text-sm text-white/80 mb-4">
                Você já completou {avgProgress}% dos seus cursos. Continue assim!
              </p>
              <div data-ev-id="ev_0dd718243c" className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div data-ev-id="ev_5faaa145c1"
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${avgProgress}%` }} />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}