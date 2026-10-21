import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  Star,
  ChevronDown,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail_url: string | null;
  price: number;
  promotional_price: number | null;
  total_lessons: number | null;
  category: {name: string;slug: string;} | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Catalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
      supabase.
      from('courses').
      select(`
            id, title, slug, short_description, thumbnail_url, price, promotional_price, total_lessons,
            category:categories(name, slug)
          `).
      eq('status', 'published').
      order('created_at', { ascending: false }),
      supabase.
      from('categories').
      select('id, name, slug').
      eq('is_active', true).
      order('sort_order')]
      );

      setCourses(coursesRes.data as unknown as Course[] || []);
      setCategories(categoriesRes.data as Category[] || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCourses = courses.
  filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  }).
  sort((a, b) => {
    if (sortBy === 'price_low') return (a.promotional_price || a.price) - (b.promotional_price || b.price);
    if (sortBy === 'price_high') return (b.promotional_price || b.price) - (a.promotional_price || a.price);
    return 0; // recent is default order
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div data-ev-id="ev_d84a557c17" className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Hero */}
      <section data-ev-id="ev_2d55726119" className="bg-gradient-to-br from-secondary via-secondary to-gray-900 py-16">
        <div data-ev-id="ev_9a188b5086" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 data-ev-id="ev_2c98ccd5a4" className="text-4xl font-bold text-white mb-4">Encontre o curso ideal para você</h1>
          <p data-ev-id="ev_7f00677f47" className="text-xl text-gray-300 mb-8">Aprenda com os melhores instrutores</p>
          
          {/* Search */}
          <div data-ev-id="ev_2263d6532d" className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input data-ev-id="ev_7c7912476f"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none text-lg" />

          </div>
        </div>
      </section>

      {/* Filters */}
      <div data-ev-id="ev_251466ab40" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div data-ev-id="ev_1802615df2" className="flex flex-col sm:flex-row gap-4 justify-between">
          <div data-ev-id="ev_afc9ffc054" className="flex flex-wrap gap-2">
            <button data-ev-id="ev_0f81ab833f"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`
            }>

              Todos
            </button>
            {categories.map((cat) =>
            <button data-ev-id="ev_baebe9a41d"
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`
            }>

                {cat.name}
              </button>
            )}
          </div>
          
          <div data-ev-id="ev_5101dd345f" className="relative">
            <select data-ev-id="ev_d563fb5c6e"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">

              <option data-ev-id="ev_d71f1eacd3" value="recent">Mais recentes</option>
              <option data-ev-id="ev_469993fbd3" value="price_low">Menor preço</option>
              <option data-ev-id="ev_5df4c3107f" value="price_high">Maior preço</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div data-ev-id="ev_91235f5ef9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ?
        <div data-ev-id="ev_692d0c50e4" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) =>
          <div data-ev-id="ev_a7b632e190" key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div data-ev-id="ev_cf136aa783" className="aspect-video bg-gray-200" />
                <div data-ev-id="ev_e6c66d58a6" className="p-4 flex flex-col gap-3">
                  <div data-ev-id="ev_cff7663d07" className="h-4 bg-gray-200 rounded w-3/4" />
                  <div data-ev-id="ev_9ab520c89d" className="h-3 bg-gray-200 rounded w-full" />
                  <div data-ev-id="ev_79f9e5b0dd" className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
          )}
          </div> :
        filteredCourses.length === 0 ?
        <div data-ev-id="ev_52ec09887a" className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 data-ev-id="ev_503668bb81" className="text-xl font-semibold text-gray-900 mb-2">Nenhum curso encontrado</h3>
            <p data-ev-id="ev_064607b255" className="text-gray-600">Tente ajustar os filtros ou buscar por outros termos.</p>
          </div> :

        <div data-ev-id="ev_b17c2dbc7f" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) =>
          <Link data-ev-id="ev_f711b6d7a8"
          key={course.id}
          to={`/curso/${course.slug}`}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">

                <div data-ev-id="ev_0737543eea" className="aspect-video bg-gray-100 relative overflow-hidden">
                  {course.thumbnail_url ?
              <img data-ev-id="ev_79878e99a7" src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :

              <div data-ev-id="ev_032d1a2d16" className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-gray-300" />
                    </div>
              }
                  {course.promotional_price &&
              <span data-ev-id="ev_6003e3c2c2" className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                      {Math.round((1 - course.promotional_price / course.price) * 100)}% OFF
                    </span>
              }
                </div>
                <div data-ev-id="ev_9ef0296363" className="p-4">
                  {course.category &&
              <span data-ev-id="ev_8a4c7f17e5" className="text-xs text-primary font-medium">{course.category.name}</span>
              }
                  <h3 data-ev-id="ev_2cd9cf6ca6" className="font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">{course.title}</h3>
                  <p data-ev-id="ev_d86e1f0a32" className="text-sm text-gray-500 line-clamp-2 mb-3">{course.short_description || 'Sem descrição'}</p>
                  
                  <div data-ev-id="ev_79abd05b08" className="flex items-center justify-between">
                    <div data-ev-id="ev_326ab971f0">
                      {course.promotional_price ?
                  <>
                          <span data-ev-id="ev_bcf8061d5d" className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</span>
                          <span data-ev-id="ev_391baafc3c" className="ml-2 font-bold text-green-600">{formatCurrency(course.promotional_price)}</span>
                        </> :

                  <span data-ev-id="ev_e7c1383940" className="font-bold text-gray-900">{formatCurrency(course.price)}</span>
                  }
                    </div>
                    <span data-ev-id="ev_97a2da9c56" className="text-xs text-gray-500">{course.total_lessons || 0} aulas</span>
                  </div>
                </div>
              </Link>
          )}
          </div>
        }
      </div>

      {/* Footer */}
      <footer data-ev-id="ev_ce6d66e26e" className="bg-gray-900 text-white py-12">
        <div data-ev-id="ev_670839d316" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p data-ev-id="ev_72a3da9586" className="text-gray-400">© {new Date().getFullYear()} Lara Sathler. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>);

}