import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Plus,
  Loader2,
  FileText,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  MoreVertical,
  Home } from
'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  show_in_menu: boolean;
  created_at: string;
}

export default function PagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('pages').select('id, title, slug, status, show_in_menu, created_at').order('created_at', { ascending: false });
      setPages(data as Page[] || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    if (!supabase) return;
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await supabase.from('pages').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    }).eq('id', id);
    fetchPages();
  };

  const handleToggleMenu = async (id: string, showInMenu: boolean) => {
    if (!supabase) return;
    await supabase.from('pages').update({ show_in_menu: !showInMenu }).eq('id', id);
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Excluir esta página?')) return;
    await supabase.from('pages').delete().eq('id', id);
    fetchPages();
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_3e5876a977" className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_9528648ca2">
          <h1 data-ev-id="ev_331d58f4a2" className="text-2xl font-bold text-gray-900">Páginas</h1>
          <p data-ev-id="ev_3d73b21a4d" className="text-gray-600 mt-1">Gerencie páginas institucionais e personalizadas</p>
        </div>
        <Link data-ev-id="ev_f9fc7380ce" to="/admin/paginas/nova" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Nova página
        </Link>
      </div>

      {/* Tabs */}
      <div data-ev-id="ev_4c371f0bda" className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button data-ev-id="ev_4b83725140" className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">Páginas</button>
        <a data-ev-id="ev_68f860b37d" href="/admin/paginas/menu" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Menu</a>
        <a data-ev-id="ev_025bfefc76" href="/admin/paginas/home" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Home</a>
      </div>

      {isLoading ?
      <div data-ev-id="ev_cefcf85f47" className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
      pages.length === 0 ?
      <div data-ev-id="ev_76a27ecb32" className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 data-ev-id="ev_16df93c100" className="text-lg font-semibold text-gray-900 mb-2">Nenhuma página</h3>
          <p data-ev-id="ev_66b19f5a28" className="text-gray-600 mb-6">Crie páginas institucionais como "Sobre", "Contato" e "Termos".</p>
          <Link data-ev-id="ev_ec9cdd87b8" to="/admin/paginas/nova" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Criar página
          </Link>
        </div> :

      <div data-ev-id="ev_ad15dd62ab" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table data-ev-id="ev_935f88f156" className="w-full">
            <thead data-ev-id="ev_a57710c809" className="bg-gray-50 border-b border-gray-200">
              <tr data-ev-id="ev_a607a41fa7">
                <th data-ev-id="ev_b583c5aa4c" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Página</th>
                <th data-ev-id="ev_40c6f2d0c2" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th data-ev-id="ev_f675ab8db8" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Menu</th>
                <th data-ev-id="ev_6ac364ad2d" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th data-ev-id="ev_779f6cbd16" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody data-ev-id="ev_3106dd9a78" className="divide-y divide-gray-200">
              {pages.map((page) =>
            <tr data-ev-id="ev_afb165c902" key={page.id} className="hover:bg-gray-50">
                  <td data-ev-id="ev_796634c533" className="px-6 py-4">
                    <span data-ev-id="ev_85bdf433af" className="font-medium text-gray-900">{page.title}</span>
                  </td>
                  <td data-ev-id="ev_4ed2878de1" className="px-6 py-4 text-sm text-gray-500 font-mono">/{page.slug}</td>
                  <td data-ev-id="ev_47adf69f6f" className="px-6 py-4 text-center">
                    <button data-ev-id="ev_fb00fa67e3" onClick={() => handleToggleMenu(page.id, page.show_in_menu)}>
                      {page.show_in_menu ? <Home className="w-5 h-5 text-green-600 mx-auto" /> : <Home className="w-5 h-5 text-gray-300 mx-auto" />}
                    </button>
                  </td>
                  <td data-ev-id="ev_39ace347a4" className="px-6 py-4 text-center">
                    <button data-ev-id="ev_b82866bb26" onClick={() => handleTogglePublish(page.id, page.status)}>
                      {page.status === 'published' ? <ToggleRight className="w-6 h-6 text-green-600 mx-auto" /> : <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />}
                    </button>
                  </td>
                  <td data-ev-id="ev_e6fee05c3c" className="px-6 py-4">
                    <div data-ev-id="ev_3265393235" className="flex items-center justify-end gap-2 relative">
                      <button data-ev-id="ev_80e5c1c129" onClick={() => setMenuOpen(menuOpen === page.id ? null : page.id)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === page.id &&
                  <div data-ev-id="ev_a9c8fac1cc" className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <Link data-ev-id="ev_67b3716b0e" to={`/admin/paginas/${page.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Edit className="w-4 h-4" /> Editar
                          </Link>
                          <a data-ev-id="ev_c431bad11b" href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Eye className="w-4 h-4" /> Visualizar
                          </a>
                          <button data-ev-id="ev_29caada390" onClick={() => handleDelete(page.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> Excluir
                          </button>
                        </div>
                  }
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </AdminLayout>);

}