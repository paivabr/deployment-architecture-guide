import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  GraduationCap,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight } from
'lucide-react';

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalEnrollments: number;
  paymentProviderStatus: 'working' | 'attention' | 'not_configured';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    paymentProviderStatus: 'not_configured'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase) return;

      try {
        // Fetch courses count
        const { count: totalCourses } = await supabase.
        from('courses').
        select('*', { count: 'exact', head: true });

        const { count: publishedCourses } = await supabase.
        from('courses').
        select('*', { count: 'exact', head: true }).
        eq('status', 'published');

        // Fetch users count
        const { count: totalUsers } = await supabase.
        from('profiles').
        select('*', { count: 'exact', head: true });

        // Fetch orders
        const { count: totalOrders } = await supabase.
        from('orders').
        select('*', { count: 'exact', head: true });

        const { count: pendingOrders } = await supabase.
        from('orders').
        select('*', { count: 'exact', head: true }).
        eq('status', 'pending');

        // Fetch revenue
        const { data: paidOrders } = await supabase.
        from('orders').
        select('total').
        eq('status', 'paid');

        const totalRevenue = paidOrders?.reduce((sum, order) => sum + (typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total)), 0) || 0;

        // Fetch enrollments
        const { count: totalEnrollments } = await supabase.
        from('enrollments').
        select('*', { count: 'exact', head: true }).
        eq('is_active', true);

        // Check payment provider status
        const { data: providers } = await supabase.
        from('payment_providers').
        select('status').
        limit(1);

        let paymentStatus: 'working' | 'attention' | 'not_configured' = 'not_configured';
        if (providers && providers.length > 0) {
          if (providers[0].status === 'working') {
            paymentStatus = 'working';
          } else {
            paymentStatus = 'attention';
          }
        }

        setStats({
          totalCourses: totalCourses || 0,
          publishedCourses: publishedCourses || 0,
          totalUsers: totalUsers || 0,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          totalRevenue,
          totalEnrollments: totalEnrollments || 0,
          paymentProviderStatus: paymentStatus
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_f73e555fb4" className="mb-8">
        <h1 data-ev-id="ev_02695c2c10" className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p data-ev-id="ev_0e2f120918" className="text-gray-600 mt-1">Visão geral do seu sistema</p>
      </div>

      {/* Stats Grid */}
      <div data-ev-id="ev_c0ed71917d" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div data-ev-id="ev_b96d9e425b" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div data-ev-id="ev_8b307d2840" className="flex items-center gap-4">
            <div data-ev-id="ev_3030369c73" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div data-ev-id="ev_0e5eee836f">
              <p data-ev-id="ev_1fb9ce34e8" className="text-sm text-gray-600">Cursos</p>
              <p data-ev-id="ev_054cfa80c7" className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.publishedCourses}
              </p>
              <p data-ev-id="ev_7ca44dd667" className="text-xs text-gray-500">
                {stats.totalCourses - stats.publishedCourses} rascunhos
              </p>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_ed41cc162b" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div data-ev-id="ev_30235ba0ff" className="flex items-center gap-4">
            <div data-ev-id="ev_dd6e88cf03" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div data-ev-id="ev_2a47ca1929">
              <p data-ev-id="ev_982c27dcc9" className="text-sm text-gray-600">Usuários</p>
              <p data-ev-id="ev_339c24f4ee" className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.totalUsers}
              </p>
              <p data-ev-id="ev_0010195053" className="text-xs text-gray-500">
                {stats.totalEnrollments} matrículas
              </p>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_16d38067d8" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div data-ev-id="ev_0b65adeb49" className="flex items-center gap-4">
            <div data-ev-id="ev_64e643b5a2" className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div data-ev-id="ev_aeb5362230">
              <p data-ev-id="ev_94c5262b16" className="text-sm text-gray-600">Pedidos</p>
              <p data-ev-id="ev_6d654d8622" className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : stats.totalOrders}
              </p>
              <p data-ev-id="ev_69d1fd8b8f" className="text-xs text-gray-500">
                {stats.pendingOrders} pendentes
              </p>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_4d97bf0d9e" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div data-ev-id="ev_b130494fad" className="flex items-center gap-4">
            <div data-ev-id="ev_6aa4194028" className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div data-ev-id="ev_5307ad0937">
              <p data-ev-id="ev_1791a1918c" className="text-sm text-gray-600">Receita</p>
              <p data-ev-id="ev_3f352b1a88" className="text-2xl font-bold text-gray-900">
                {isLoading ? '-' : formatCurrency(stats.totalRevenue)}
              </p>
              <p data-ev-id="ev_39bfb0ed7d" className="text-xs text-gray-500">total recebido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div data-ev-id="ev_afeebe5eb7" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Provider Status */}
        <div data-ev-id="ev_9a0ee88dd8" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 data-ev-id="ev_a12375414f" className="text-lg font-semibold text-gray-900 mb-4">Status dos Pagamentos</h2>
          
          <div data-ev-id="ev_9369a4a904" className={`p-4 rounded-lg ${
          stats.paymentProviderStatus === 'working' ?
          'bg-green-50' :
          stats.paymentProviderStatus === 'attention' ?
          'bg-yellow-50' :
          'bg-red-50'}`
          }>
            <div data-ev-id="ev_52ef846aa0" className="flex items-start gap-3">
              {stats.paymentProviderStatus === 'working' ?
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> :
              stats.paymentProviderStatus === 'attention' ?
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" /> :

              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              }
              <div data-ev-id="ev_19a94bc103">
                <p data-ev-id="ev_326ca39cc8" className={`font-medium ${
                stats.paymentProviderStatus === 'working' ?
                'text-green-900' :
                stats.paymentProviderStatus === 'attention' ?
                'text-yellow-900' :
                'text-red-900'}`
                }>
                  {stats.paymentProviderStatus === 'working' ?
                  'Pagamentos funcionando' :
                  stats.paymentProviderStatus === 'attention' ?
                  'Atenção necessária' :
                  'Pagamentos não configurados'}
                </p>
                <p data-ev-id="ev_5a9e259f5f" className={`text-sm mt-1 ${
                stats.paymentProviderStatus === 'working' ?
                'text-green-700' :
                stats.paymentProviderStatus === 'attention' ?
                'text-yellow-700' :
                'text-red-700'}`
                }>
                  {stats.paymentProviderStatus === 'working' ?
                  'O provedor de pagamentos está configurado e funcionando corretamente.' :
                  stats.paymentProviderStatus === 'attention' ?
                  'O provedor de pagamentos precisa de atenção.' :
                  'Configure um provedor de pagamento para começar a vender.'}
                </p>
              </div>
            </div>
          </div>

          <Link data-ev-id="ev_5a3c2bf0c8"
          to="/admin/pagamentos"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">

            Configurar pagamentos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div data-ev-id="ev_407f2c14bc" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 data-ev-id="ev_8bd6ce839d" className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          
          <div data-ev-id="ev_5403ef984d" className="flex flex-col gap-3">
            <Link data-ev-id="ev_9b5cd437ec"
            to="/admin/cursos/novo"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">

              <div data-ev-id="ev_46808b2926" className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <span data-ev-id="ev_63c3b6166b" className="font-medium text-gray-900">Criar novo curso</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link data-ev-id="ev_1b7489da06"
            to="/admin/usuarios"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">

              <div data-ev-id="ev_821f9255fe" className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span data-ev-id="ev_ce58543181" className="font-medium text-gray-900">Convidar moderador</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link data-ev-id="ev_76cbfd4073"
            to="/admin/pagamentos/cupons"
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">

              <div data-ev-id="ev_de19447382" className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span data-ev-id="ev_3412e585a8" className="font-medium text-gray-900">Gerenciar cupons</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>);

}