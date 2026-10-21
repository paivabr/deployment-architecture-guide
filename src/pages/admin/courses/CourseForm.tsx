import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  Image,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  AlertCircle
} from 'lucide-react';

type ContentStatus = 'draft' | 'published' | 'archived';

interface Category {
  id: string;
  name: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_free: boolean;
  lessons: Lesson[];
  isExpanded?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_type: 'video' | 'text' | 'quiz';
  video_url: string;
  content: string;
  sort_order: number;
  is_free: boolean;
  is_published: boolean;
}

export default function CourseForm() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [isFeatured, setIsFeatured] = useState(false);

  // Modules
  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');

  const fetchCategories = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name');
    setCategories(data as Category[] || []);
  }, []);

  const fetchCourse = useCallback(async () => {
    if (!supabase || !id) return;
    try {
      const { data: course } = await supabase.from('courses').select('*').eq('id', id).single();
      if (course) {
        setTitle(course.title);
        setSlug(course.slug);
        setShortDescription(course.short_description || '');
        setDescription(course.description || '');
        setThumbnailUrl(course.thumbnail_url || '');
        setCategoryId(course.category_id || '');
        setPrice(course.price?.toString() || '');
        setPromotionalPrice(course.promotional_price?.toString() || '');
        setStatus(course.status as ContentStatus);
        setIsFeatured(course.is_featured);
      }
      // Fetch modules with lessons
      const { data: modulesData } = await supabase.
      from('modules').
      select('*, lessons(*)').
      eq('course_id', id).
      order('sort_order');
      if (modulesData) {
        setModules(modulesData.map((m) => ({ ...m, lessons: m.lessons || [], isExpanded: false })) as Module[]);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchCourse();
  }, [isEditing, fetchCategories, fetchCourse]);

  const generateSlug = (text: string) => {
    return text.
    toLowerCase().
    normalize('NFD').
    replace(/[\u0300-\u036f]/g, '').
    replace(/[^a-z0-9]+/g, '-').
    replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!supabase || !user) return;
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      if (!title.trim()) {
        setError('Título é obrigatório');
        setIsSaving(false);
        return;
      }
      if (!slug.trim()) {
        setError('Slug é obrigatório');
        setIsSaving(false);
        return;
      }

      const courseData = {
        title,
        slug,
        short_description: shortDescription || null,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        category_id: categoryId || null,
        price: parseFloat(price) || 0,
        promotional_price: promotionalPrice ? parseFloat(promotionalPrice) : null,
        status,
        is_featured: isFeatured,
        published_at: status === 'published' ? new Date().toISOString() : null,
        total_lessons: modules.reduce((sum, m) => sum + m.lessons.length, 0),
        teacher_id: user.id
      };

      if (isEditing) {
        const { error: updateError } = await supabase.from('courses').update(courseData).eq('id', id);
        if (updateError) throw updateError;
        setSuccess('Curso salvo com sucesso!');
      } else {
        const { data, error: insertError } = await supabase.from('courses').insert(courseData).select().single();
        if (insertError) throw insertError;
        if (data) {
          setSuccess('Curso criado com sucesso!');
          navigate(`/admin/cursos/${data.id}`);
        }
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar curso');
    } finally {
      setIsSaving(false);
    }
  };

  const addModule = async () => {
    if (!supabase || !id) return;
    const { data } = await supabase.from('modules').insert({
      course_id: id,
      title: 'Novo módulo',
      sort_order: modules.length
    }).select().single();
    if (data) {
      setModules([...modules, { ...data, lessons: [], isExpanded: true }]);
    }
  };

  const updateModule = async (moduleId: string, updates: Partial<Module>) => {
    if (!supabase) return;
    const { lessons: _l, isExpanded: _e, ...dbUpdates } = updates as Module;
    await supabase.from('modules').update(dbUpdates).eq('id', moduleId);
    setModules(modules.map((m) => m.id === moduleId ? { ...m, ...updates } : m));
  };

  const deleteModule = async (moduleId: string) => {
    if (!supabase || !confirm('Excluir este módulo e todas as aulas?')) return;
    await supabase.from('modules').delete().eq('id', moduleId);
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const addLesson = async (moduleId: string) => {
    if (!supabase) return;
    const module = modules.find((m) => m.id === moduleId);
    const { data } = await supabase.from('lessons').insert({
      module_id: moduleId,
      title: 'Nova aula',
      lesson_type: 'video',
      sort_order: module?.lessons.length || 0
    }).select().single();
    if (data) {
      setModules(modules.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, data as Lesson] } : m));
    }
  };

  const updateLesson = async (lessonId: string, updates: Partial<Lesson>) => {
    if (!supabase) return;
    await supabase.from('lessons').update(updates).eq('id', lessonId);
    setModules(modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l)
    })));
  };

  const deleteLesson = async (lessonId: string) => {
    if (!supabase || !confirm('Excluir esta aula?')) return;
    await supabase.from('lessons').delete().eq('id', lessonId);
    setModules(modules.map((m) => ({
      ...m,
      lessons: m.lessons.filter((l) => l.id !== lessonId)
    })));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_616fa188ad" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_262ece786b" className="flex items-center justify-between mb-6">
        <button data-ev-id="ev_b1df4f5076" onClick={() => navigate('/admin/cursos')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div data-ev-id="ev_b59c286ec9" className="flex items-center gap-3">
          {isEditing && status === 'draft' &&
          <button data-ev-id="ev_f80d132705" onClick={() => {setStatus('published');handleSave();}} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              <Globe className="w-4 h-4" /> Publicar
            </button>
          }
          <button data-ev-id="ev_2c45f42f0a" onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      <h1 data-ev-id="ev_b89135d8ae" className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar curso' : 'Criar curso'}</h1>

      {/* Tabs */}
      <div data-ev-id="ev_75290a276b" className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button data-ev-id="ev_106f413e6c" onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
          Informações
        </button>
        <button data-ev-id="ev_48ab496e87" onClick={() => setActiveTab('content')} disabled={!isEditing} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'} disabled:opacity-50`}>
          Conteúdo
        </button>
      </div>

      {activeTab === 'info' ?
      <div data-ev-id="ev_06f5ce0672" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div data-ev-id="ev_f3b2d69a20" className="lg:col-span-2 flex flex-col gap-6">
            <div data-ev-id="ev_c9c7ff02cd" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_82ec6e24e2" className="text-lg font-semibold text-gray-900 mb-4">Informações básicas</h2>
              <div data-ev-id="ev_95cfd35f73" className="flex flex-col gap-4">
                <div data-ev-id="ev_bbee668c6e">
                  <label data-ev-id="ev_a3acdcded2" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input data-ev-id="ev_238073f778" type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div data-ev-id="ev_110fdd3207">
                  <label data-ev-id="ev_f5e066c484" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input data-ev-id="ev_5c52296691" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                </div>
                <div data-ev-id="ev_4477cf61dc">
                  <label data-ev-id="ev_482057b9d8" className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
                  <input data-ev-id="ev_ae4e1be70a" type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div data-ev-id="ev_024ce3777b">
                  <label data-ev-id="ev_6cac8a619b" className="block text-sm font-medium text-gray-700 mb-1">Descrição completa</label>
                  <textarea data-ev-id="ev_882f8b31da" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
              </div>
            </div>

            <div data-ev-id="ev_c29e906472" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_40b69699bd" className="text-lg font-semibold text-gray-900 mb-4">Preços</h2>
              <div data-ev-id="ev_1a7c3c6eb8" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_bbd4446957">
                  <label data-ev-id="ev_94e73471c9" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                  <input data-ev-id="ev_be30674a6d" type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div data-ev-id="ev_427659b7d1">
                  <label data-ev-id="ev_50f517df0f" className="block text-sm font-medium text-gray-700 mb-1">Preço promocional (R$)</label>
                  <input data-ev-id="ev_945267d7a7" type="number" value={promotionalPrice} onChange={(e) => setPromotionalPrice(e.target.value)} step="0.01" min="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div data-ev-id="ev_3d6b8b7b5d" className="flex flex-col gap-6">
            <div data-ev-id="ev_06b390bf70" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_c842c15694" className="text-lg font-semibold text-gray-900 mb-4">Capa</h2>
              <div data-ev-id="ev_0d7cf54b8a" className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {thumbnailUrl ?
              <img data-ev-id="ev_8afba0270b" src={thumbnailUrl} alt="Capa" className="w-full h-full object-cover" /> :

              <Image className="w-12 h-12 text-gray-300" />
              }
              </div>
              <input data-ev-id="ev_0849a7091e" type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="URL da imagem" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
            </div>

            <div data-ev-id="ev_c799fba1b9" className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 data-ev-id="ev_39ef680964" className="text-lg font-semibold text-gray-900 mb-4">Organização</h2>
              <div data-ev-id="ev_97381ddc60" className="flex flex-col gap-4">
                <div data-ev-id="ev_7a9d06c115">
                  <label data-ev-id="ev_a8c42df3be" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select data-ev-id="ev_58636772f6" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option data-ev-id="ev_f5524a1c81" value="">Selecione...</option>
                    {categories.map((cat) => <option data-ev-id="ev_b39467b3fa" key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <label data-ev-id="ev_11f605c77e" className="flex items-center gap-2 cursor-pointer">
                  <input data-ev-id="ev_ae4a19264b" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                  <span data-ev-id="ev_c5d3aebcd0" className="text-sm text-gray-700">Destacar na página inicial</span>
                </label>
              </div>
            </div>
          </div>
        </div> :

      <div data-ev-id="ev_53da9eb523" className="bg-white rounded-xl border border-gray-200 p-6">
          <div data-ev-id="ev_3454c75886" className="flex items-center justify-between mb-4">
            <h2 data-ev-id="ev_ce424885a0" className="text-lg font-semibold text-gray-900">Módulos e Aulas</h2>
            <button data-ev-id="ev_3be2e74c51" onClick={addModule} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Adicionar módulo
            </button>
          </div>

          {modules.length === 0 ?
        <p data-ev-id="ev_8ee96aa696" className="text-gray-500 text-center py-8">Nenhum módulo criado. Adicione módulos para organizar suas aulas.</p> :

        <div data-ev-id="ev_3361440d7b" className="flex flex-col gap-4">
              {modules.map((module) =>
          <div data-ev-id="ev_7a54c478ea" key={module.id} className="border border-gray-200 rounded-lg">
                  <div data-ev-id="ev_972a1f460a" className="flex items-center gap-3 p-4 bg-gray-50">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <button data-ev-id="ev_02fb001210" onClick={() => setModules(modules.map((m) => m.id === module.id ? { ...m, isExpanded: !m.isExpanded } : m))}>
                      {module.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <input data-ev-id="ev_b86ad7f382"
              type="text"
              value={module.title}
              onChange={(e) => updateModule(module.id, { title: e.target.value })}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />

                    <span data-ev-id="ev_3a116bc7c2" className="text-sm text-gray-500">{module.lessons.length} aulas</span>
                    <button data-ev-id="ev_f99547d046" onClick={() => deleteModule(module.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {module.isExpanded &&
            <div data-ev-id="ev_9e90db5e85" className="p-4 flex flex-col gap-2">
                      {module.lessons.map((lesson) =>
              <div data-ev-id="ev_da59535ff2" key={lesson.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                          <GripVertical className="w-4 h-4 text-gray-300" />
                          {lesson.lesson_type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-gray-500" />}
                          <input data-ev-id="ev_3aad36cb62"
                type="text"
                value={lesson.title}
                onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary outline-none" />

                          <button data-ev-id="ev_05499d37ed" onClick={() => deleteLesson(lesson.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
              )}
                      <button data-ev-id="ev_9408da96c5" onClick={() => addLesson(module.id)} className="flex items-center gap-2 p-3 text-sm text-primary hover:bg-primary/5 rounded-lg">
                        <Plus className="w-4 h-4" /> Adicionar aula
                      </button>
                    </div>
            }
                </div>
          )}
            </div>
        }
        </div>
      }
    </AdminLayout>);

}