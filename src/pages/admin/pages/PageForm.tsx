import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
  ArrowLeft,
  Loader2,
  Save,
  Eye,
  AlertCircle,
  CheckCircle } from
'lucide-react';

export default function PageForm() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [showInMenu, setShowInMenu] = useState(false);

  const fetchPage = useCallback(async () => {
    if (!supabase || !id) return;
    try {
      const { data, error: fetchError } = await supabase.from('pages').select('*').eq('id', id).single();
      if (fetchError) throw fetchError;
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || '');
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
        setStatus(data.status as 'draft' | 'published');
        setShowInMenu(data.show_in_menu);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Erro ao carregar página');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) fetchPage();
  }, [isEditing, fetchPage]);

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
    if (!isEditing || !slug) setSlug(generateSlug(value));
  };

  const handleSave = async () => {
    if (!supabase) return;
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    if (!slug.trim()) {
      setError('Slug é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const pageData = {
        title,
        slug,
        content: content || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        status,
        show_in_menu: showInMenu,
        published_at: status === 'published' ? new Date().toISOString() : null
      };

      if (isEditing) {
        const { error: updateError } = await supabase.from('pages').update(pageData).eq('id', id);
        if (updateError) throw updateError;
        setSuccess('Página salva com sucesso!');
      } else {
        const { data, error: insertError } = await supabase.from('pages').insert(pageData).select().single();
        if (insertError) throw insertError;
        if (data) {
          setSuccess('Página criada com sucesso!');
          navigate(`/admin/paginas/${data.id}`);
        }
      }
    } catch (err) {
      console.error('Error saving page:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar página');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-ev-id="ev_fe437bcc39" className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>);

  }

  return (
    <AdminLayout>
      <div data-ev-id="ev_45a92f6cae" className="flex items-center justify-between mb-6">
        <button data-ev-id="ev_8c725f7f49" onClick={() => navigate('/admin/paginas')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div data-ev-id="ev_5b519840fc" className="flex items-center gap-3">
          {isEditing &&
          <a data-ev-id="ev_b1c2c63a51" href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
              <Eye className="w-4 h-4" /> Visualizar
            </a>
          }
          <button data-ev-id="ev_234f03eb4f" onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      <h1 data-ev-id="ev_a52a32f035" className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Editar página' : 'Nova página'}</h1>

      {error &&
      <div data-ev-id="ev_906d30b4db" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p data-ev-id="ev_f5168ae2bd" className="text-sm text-red-700">{error}</p>
        </div>
      }

      {success &&
      <div data-ev-id="ev_75f28d3047" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p data-ev-id="ev_885de9b759" className="text-sm text-green-700">{success}</p>
        </div>
      }

      <div data-ev-id="ev_a9144bfbbb" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-ev-id="ev_6c988ab6bb" className="lg:col-span-2 flex flex-col gap-6">
          <div data-ev-id="ev_973efec435" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_96bb66cf7a" className="text-lg font-semibold text-gray-900 mb-4">Conteúdo</h2>
            <div data-ev-id="ev_69f6528bf7" className="flex flex-col gap-4">
              <div data-ev-id="ev_b9545f419c">
                <label data-ev-id="ev_f7adc12245" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input data-ev-id="ev_03909579f9"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

              </div>
              <div data-ev-id="ev_7ba33f6d6b">
                <label data-ev-id="ev_b5df9e243b" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <div data-ev-id="ev_21f7e76fcd" className="flex items-center">
                  <span data-ev-id="ev_79e04bc336" className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">/</span>
                  <input data-ev-id="ev_96139c3024"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />

                </div>
              </div>
              <div data-ev-id="ev_2ebd2ce896">
                <label data-ev-id="ev_cff0b0bf59" className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Digite o conteúdo da página aqui..." />

              </div>
            </div>
          </div>

          <div data-ev-id="ev_d831592191" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_4cc8e561da" className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
            <div data-ev-id="ev_4229fba01b" className="flex flex-col gap-4">
              <div data-ev-id="ev_143fbe2e77">
                <label data-ev-id="ev_7fc96c74f7" className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                <input data-ev-id="ev_3e7ad19b72"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                placeholder={title}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />

                <p data-ev-id="ev_2b0183726c" className="mt-1 text-xs text-gray-500">{metaTitle.length}/60 caracteres</p>
              </div>
              <div data-ev-id="ev_487a8434fd">
                <label data-ev-id="ev_b5be7a33f8" className="block text-sm font-medium text-gray-700 mb-1">Descrição SEO</label>
                <textarea data-ev-id="ev_6cc7eb11a1"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />

                <p data-ev-id="ev_9b8cab16df" className="mt-1 text-xs text-gray-500">{metaDescription.length}/160 caracteres</p>
              </div>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_08e9094200" className="flex flex-col gap-6">
          <div data-ev-id="ev_4146154e62" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 data-ev-id="ev_ea5fadf6f8" className="text-lg font-semibold text-gray-900 mb-4">Configurações</h2>
            <div data-ev-id="ev_b528a0ca3c" className="flex flex-col gap-4">
              <div data-ev-id="ev_f87702fd3b">
                <label data-ev-id="ev_2c197a14b7" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select data-ev-id="ev_349cecc69b"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">

                  <option data-ev-id="ev_df61e14756" value="draft">Rascunho</option>
                  <option data-ev-id="ev_9d8fae5b3f" value="published">Publicada</option>
                </select>
              </div>
              <label data-ev-id="ev_9a759803bc" className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg">
                <input data-ev-id="ev_f78519954d"
                type="checkbox"
                checked={showInMenu}
                onChange={(e) => setShowInMenu(e.target.checked)}
                className="w-4 h-4 text-primary rounded" />

                <div data-ev-id="ev_ebfad80427">
                  <span data-ev-id="ev_1cf4e62015" className="text-sm font-medium text-gray-900">Mostrar no menu</span>
                  <p data-ev-id="ev_876407dc9f" className="text-xs text-gray-500">Exibir link no menu principal</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}