import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Plus,
  Loader2,
  GraduationCap,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Globe,
  FileText,
  Archive } from
'lucide-react';

type ContentStatus = 'draft' | 'published' | 'archived';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail_url: string | null;
  price: number;
  promotional_price: number | null;
  status: ContentStatus;
  is_featured: boolean;
  total_lessons: number | null;
  category: {name: string;} | null;
  teacher: {full_name: string;} | null;
  created_at: string;
}

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.
      from('courses').
      select(`
          id, title, slug, short_description, thumbnail_url, price, promotional_price,
          status, is_featured, total_lessons, created_at,
          category:categories(name),
          teacher:profiles!courses_teacher_id_fkey(full_name)
        `).
      order('created_at', { ascending: false });
      setCourses(data as unknown as Course[] || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Excluir este curso? Esta ação não pode ser desfeita.')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchCourses();
  };

  const handleStatusChange = async (id: string, newStatus: ContentStatus) => {
    if (!supabase) return;
    await supabase.from('courses').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    }).eq('id', id);
    setMenuOpen(null);
    fetchCourses();
  };

  const handleDuplicate = async (course: Course) => {
    if (!supabase) return;
    await supabase.from('courses').insert({
      title: `${course.title} (cópia)`,
      slug: `${course.slug}-copia-${Date.now()}`,
      short_description: course.short_description,
      thumbnail_url: course.thumbnail_url,
      price: course.price,
      promotional_price: course.promotional_price,
      status: 'draft' as ContentStatus
    });
    fetchCourses();
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const statusBadge = (status: ContentStatus) => {
    const styles: Record<ContentStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-yellow-100 text-yellow-700'
    };
    const labels: Record<ContentStatus, string> = {
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado'
    };
    return <span data-ev-id="ev_93af09dc0b" className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_1ee94ce006" className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_278e27473e">
          <h1 data-ev-id="ev_586cbf1c35" className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p data-ev-id="ev_3ebd0f4208" className="text-gray-600 mt-1">Gerencie seus cursos e conteúdos</p>
        </div>
        <Link data-ev-id="ev_94ec0b66c0" to="/admin/cursos/novo" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Criar curso
        </Link>
      </div>

      {/* Filters */}
      <div data-ev-id="ev_594736c6fc" className="flex flex-col sm:flex-row gap-4 mb-6">
        <div data-ev-id="ev_5f7e6612ea" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input data-ev-id="ev_359df98f21"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

        </div>
        <select data-ev-id="ev_9b1f8d27e7"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

          <option data-ev-id="ev_10af6e6980" value="all">Todos os status</option>
          <option data-ev-id="ev_f9687489bd" value="draft">Rascunhos</option>
          <option data-ev-id="ev_06b261da32" value="published">Publicados</option>
          <option data-ev-id="ev_cb4a5fd0fd" value="archived">Arquivados</option>
        </select>
      </div>

      {isLoading ?
      <div data-ev-id="ev_a808f29772" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
      filteredCourses.length === 0 ?
      <div data-ev-id="ev_51db621278" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_761b289b53" className="text-lg font-semibold text-gray-900 mb-2">
            {search || statusFilter !== 'all' ? 'Nenhum curso encontrado' : 'Nenhum curso criado'}
          </h3>
          <p data-ev-id="ev_d56e063b18" className="text-gray-600 mb-6">Crie seu primeiro curso para começar a vender.</p>
          <Link data-ev-id="ev_de1c53fb90" to="/admin/cursos/novo" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Criar curso
          </Link>
        </div> :

      <div data-ev-id="ev_5e181eea33" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) =>
        <div data-ev-id="ev_ada5e0c4ca" key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div data-ev-id="ev_794b0723a8" className="aspect-video bg-gray-100 relative">
                {course.thumbnail_url ?
            <img data-ev-id="ev_2000efe517" src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" /> :

            <div data-ev-id="ev_672b313cda" className="w-full h-full flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-gray-300" />
                  </div>
            }
                <div data-ev-id="ev_7b0a495d90" className="absolute top-3 left-3">{statusBadge(course.status)}</div>
                <div data-ev-id="ev_aa52a7bfba" className="absolute top-3 right-3">
                  <button data-ev-id="ev_a049bc8bf6"
              onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow">

                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === course.id &&
              <div data-ev-id="ev_a8f6c97708" className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <Link data-ev-id="ev_7fb151d52e" to={`/admin/cursos/${course.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      <a data-ev-id="ev_60d5d5db51" href={`/curso/${course.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4" /> Visualizar
                      </a>
                      <button data-ev-id="ev_ad6c96b659" onClick={() => handleDuplicate(course)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Copy className="w-4 h-4" /> Duplicar
                      </button>
                      <hr data-ev-id="ev_51e020dba6" className="my-1" />
                      {course.status !== 'published' &&
                <button data-ev-id="ev_6e71f3d356" onClick={() => handleStatusChange(course.id, 'published')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                          <Globe className="w-4 h-4" /> Publicar
                        </button>
                }
                      {course.status === 'published' &&
                <button data-ev-id="ev_565fb62867" onClick={() => handleStatusChange(course.id, 'draft')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <FileText className="w-4 h-4" /> Despublicar
                        </button>
                }
                      {course.status !== 'archived' &&
                <button data-ev-id="ev_79a91c0b99" onClick={() => handleStatusChange(course.id, 'archived')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                          <Archive className="w-4 h-4" /> Arquivar
                        </button>
                }
                      <hr data-ev-id="ev_15a2f9cd2a" className="my-1" />
                      <button data-ev-id="ev_b412a6b952" onClick={() => handleDelete(course.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
              }
                </div>
              </div>
              <div data-ev-id="ev_b428a03987" className="p-4">
                <h3 data-ev-id="ev_200b186dce" className="font-semibold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                <p data-ev-id="ev_02808f466f" className="text-sm text-gray-500 mb-3 line-clamp-2">{course.short_description || 'Sem descrição'}</p>
                <div data-ev-id="ev_179199c584" className="flex items-center justify-between">
                  <div data-ev-id="ev_62a2cedbcb">
                    {course.promotional_price ?
                <>
                        <span data-ev-id="ev_1911a3ce4f" className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</span>
                        <span data-ev-id="ev_589ba4ec96" className="ml-2 font-bold text-green-600">{formatCurrency(course.promotional_price)}</span>
                      </> :

                <span data-ev-id="ev_d98163dade" className="font-bold text-gray-900">{formatCurrency(course.price)}</span>
                }
                  </div>
                  <span data-ev-id="ev_d8d3f0fd78" className="text-sm text-gray-500">{course.total_lessons || 0} aulas</span>
                </div>
              </div>
            </div>
        )}
        </div>
      }
    </AdminLayout>);

}