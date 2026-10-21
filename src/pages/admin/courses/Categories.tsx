import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Plus,
  Loader2,
  Folder,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  GripVertical } from
'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  course_count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!supabase) return;
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      // Count courses per category
      const { data: courses } = await supabase.from('courses').select('category_id');
      const counts: Record<string, number> = {};
      courses?.forEach((c) => {
        if (c.category_id) counts[c.category_id] = (counts[c.category_id] || 0) + 1;
      });
      setCategories((cats || []).map((cat) => ({ ...cat, course_count: counts[cat.id] || 0 })));
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.
    toLowerCase().
    normalize('NFD').
    replace(/[\u0300-\u036f]/g, '').
    replace(/[^a-z0-9]+/g, '-').
    replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingId) setSlug(generateSlug(value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSaving(true);
    try {
      const data = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        sort_order: editingId ? undefined : categories.length
      };
      if (editingId) {
        await supabase.from('categories').update(data).eq('id', editingId);
      } else {
        await supabase.from('categories').insert(data);
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setImageUrl(category.image_url || '');
    setShowModal(true);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!supabase) return;
    await supabase.from('categories').update({ is_active: !isActive }).eq('id', id);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Excluir esta categoria?')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_e731d63334" className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_ff953af454">
          <h1 data-ev-id="ev_00df6147ac" className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p data-ev-id="ev_c40bf24fa7" className="text-gray-600 mt-1">Organize seus cursos em categorias</p>
        </div>
        <button data-ev-id="ev_e3250bf829" onClick={() => {resetForm();setShowModal(true);}} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Nova categoria
        </button>
      </div>

      {isLoading ?
      <div data-ev-id="ev_3b14a6c3d4" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
      categories.length === 0 ?
      <div data-ev-id="ev_97959b9bde" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_353b8b3da8" className="text-lg font-semibold text-gray-900 mb-2">Nenhuma categoria</h3>
          <p data-ev-id="ev_cb3b1e77a8" className="text-gray-600 mb-6">Crie categorias para organizar seus cursos.</p>
          <button data-ev-id="ev_b31d88de7e" onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Criar primeira categoria
          </button>
        </div> :

      <div data-ev-id="ev_f37367e356" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table data-ev-id="ev_9791821aff" className="w-full">
            <thead data-ev-id="ev_6fc928dfc7" className="bg-gray-50 border-b border-gray-200">
              <tr data-ev-id="ev_cb0940159b">
                <th data-ev-id="ev_4dce5e5702" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                <th data-ev-id="ev_ab68d74d8e" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th data-ev-id="ev_ac868689ee" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th data-ev-id="ev_eaaa91c8ac" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cursos</th>
                <th data-ev-id="ev_bacceb6698" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th data-ev-id="ev_e9dc4ede20" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody data-ev-id="ev_775209be45" className="divide-y divide-gray-200">
              {categories.map((category) =>
            <tr data-ev-id="ev_942d225bff" key={category.id} className="hover:bg-gray-50">
                  <td data-ev-id="ev_d589fa8947" className="px-6 py-4"><GripVertical className="w-5 h-5 text-gray-300 cursor-move" /></td>
                  <td data-ev-id="ev_775e460d41" className="px-6 py-4">
                    <div data-ev-id="ev_5024d2f230" className="flex items-center gap-3">
                      {category.image_url ?
                  <img data-ev-id="ev_daa52e82a1" src={category.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> :

                  <div data-ev-id="ev_4432450086" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Folder className="w-5 h-5 text-gray-400" /></div>
                  }
                      <span data-ev-id="ev_617614fe8b" className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td data-ev-id="ev_516c0dbf56" className="px-6 py-4 text-sm text-gray-500 font-mono">{category.slug}</td>
                  <td data-ev-id="ev_82c9093fa9" className="px-6 py-4 text-sm text-gray-600">{category.course_count}</td>
                  <td data-ev-id="ev_96db088c3f" className="px-6 py-4">
                    <button data-ev-id="ev_2c8e8b7574" onClick={() => handleToggle(category.id, category.is_active)}>
                      {category.is_active ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </td>
                  <td data-ev-id="ev_b700670d69" className="px-6 py-4">
                    <div data-ev-id="ev_6a7d18df2d" className="flex items-center justify-end gap-2">
                      <button data-ev-id="ev_c19fe19bda" onClick={() => handleEdit(category)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_851da06c52" onClick={() => handleDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_531b9f13bc" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div data-ev-id="ev_3d25abb1d0" className="bg-white rounded-xl w-full max-w-lg">
            <div data-ev-id="ev_669881cb78" className="flex items-center justify-between p-6 border-b">
              <h2 data-ev-id="ev_c3c32b3a8e" className="text-lg font-semibold">{editingId ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button data-ev-id="ev_4a6ba3c9c3" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form data-ev-id="ev_eda095a150" onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_800dac2faf">
                <label data-ev-id="ev_481ffcad27" className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input data-ev-id="ev_7bc90a933e" type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div data-ev-id="ev_f223bf52ab">
                <label data-ev-id="ev_6dac789367" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input data-ev-id="ev_b3af646696" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
              </div>
              <div data-ev-id="ev_c80edc3e4f">
                <label data-ev-id="ev_719474288d" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea data-ev-id="ev_7caf4575a4" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
              <div data-ev-id="ev_f204501d58">
                <label data-ev-id="ev_1846a1cfdf" className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
                <input data-ev-id="ev_c3f9c85c75" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <button data-ev-id="ev_4f3ac84a0c" type="submit" disabled={isSaving} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      }
    </AdminLayout>);

}