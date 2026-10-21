import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import {
  Settings,
  Palette,
  FileText,
  GraduationCap,
  Users,
  User,
  CreditCard,
  Mail,
  HardDrive,
  Video,
  Calendar,
  MessageCircle,
  Shield,
  Plug,
  ScrollText,
  Database,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Home,
  LayoutDashboard } from
'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
{ id: 'general', label: 'Configurações Gerais', icon: Settings, path: '/admin/configuracoes' },
{ id: 'visual', label: 'Identidade Visual', icon: Palette, path: '/admin/identidade-visual' },
{ id: 'homepage', label: 'Página Inicial', icon: Home, path: '/admin/pagina-inicial' },
{ id: 'about', label: 'Seção Sobre', icon: User, path: '/admin/sobre' },
{ id: 'pages', label: 'Páginas e Conteúdo', icon: FileText, path: '/admin/paginas' },
{ id: 'courses', label: 'Cursos e Categorias', icon: GraduationCap, path: '/admin/cursos' },
{ id: 'users', label: 'Usuários e Permissões', icon: Users, path: '/admin/usuarios' },
{ id: 'payments', label: 'Pagamentos e APIs', icon: CreditCard, path: '/admin/pagamentos' },
{ id: 'emails', label: 'E-mails e Notificações', icon: Mail, path: '/admin/emails' },
{ id: 'storage', label: 'Armazenamento', icon: HardDrive, path: '/admin/armazenamento' },
{ id: 'videos', label: 'Vídeos e Transmissões', icon: Video, path: '/admin/videos' },
{ id: 'calendar', label: 'Calendário e Reuniões', icon: Calendar, path: '/admin/calendario' },
{ id: 'whatsapp', label: 'Atendimento e WhatsApp', icon: MessageCircle, path: '/admin/whatsapp' },
{ id: 'security', label: 'Segurança', icon: Shield, path: '/admin/seguranca' },
{ id: 'integrations', label: 'Integrações Externas', icon: Plug, path: '/admin/integracoes' },
{ id: 'logs', label: 'Logs e Diagnóstico', icon: ScrollText, path: '/admin/logs' },
{ id: 'backup', label: 'Backup e Manutenção', icon: Database, path: '/admin/backup' }];


export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div data-ev-id="ev_e3f8bb600f" className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen &&
      <div data-ev-id="ev_47689bc19a"
      className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      onClick={() => setSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside data-ev-id="ev_631523fc00"
      className={`fixed top-0 left-0 z-50 h-full w-72 bg-secondary text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }>

        <div data-ev-id="ev_dce24c685d" className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link data-ev-id="ev_b5785d0e96" to="/admin" className="flex items-center gap-2">
            <div data-ev-id="ev_137dc065cc" className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span data-ev-id="ev_1003e9e341" className="font-semibold text-lg">Admin</span>
          </Link>
          <button data-ev-id="ev_6705c8f5f6"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg">

            <X className="w-5 h-5" />
          </button>
        </div>

        <nav data-ev-id="ev_1ad52d3fbc" className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div data-ev-id="ev_e9ebbf320c" className="mb-4">
            <Link data-ev-id="ev_0648651a6c"
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">

              <Home className="w-5 h-5" />
              <span data-ev-id="ev_644774268f">Voltar ao site</span>
            </Link>
          </div>

          <div data-ev-id="ev_4bad2f8b4d" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Central de Configurações
          </div>

          <ul data-ev-id="ev_16daa30f26" className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
              item.path !== '/admin' && location.pathname.startsWith(item.path);

              return (
                <li data-ev-id="ev_c205278c89" key={item.id}>
                  <Link data-ev-id="ev_91839b7e1f"
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ?
                  'bg-primary text-white' :
                  'text-gray-400 hover:text-white hover:bg-white/10'}`
                  }>

                    <Icon className="w-5 h-5 shrink-0" />
                    <span data-ev-id="ev_7c9d80aaef" className="text-sm">{item.label}</span>
                  </Link>
                </li>);

            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div data-ev-id="ev_92fa834053" className="lg:pl-72">
        {/* Top bar */}
        <header data-ev-id="ev_81bbc84b20" className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button data-ev-id="ev_dd8abcb128"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">

            <Menu className="w-5 h-5" />
          </button>

          <div data-ev-id="ev_05d0612d14" className="flex-1" />

          <div data-ev-id="ev_7bca8b65ac" className="flex items-center gap-4">
            <div data-ev-id="ev_2a38b29540" className="flex items-center gap-3">
              <div data-ev-id="ev_ce375f6cda" className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <span data-ev-id="ev_0ab0638354" className="text-sm font-medium text-primary">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div data-ev-id="ev_1b3ee523ea" className="hidden sm:block">
                <p data-ev-id="ev_a0862d3d1a" className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Administrador'}
                </p>
                <p data-ev-id="ev_2fb1e9d062" className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>

            <button data-ev-id="ev_53c726d8f3"
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Sair">

              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main data-ev-id="ev_3c0ed0ec2d" className="p-4 lg:p-6">{children}</main>
      </div>
    </div>);

}