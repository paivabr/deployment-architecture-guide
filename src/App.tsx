/**
 * ⚠️ ROUTING RULES:
 * - Router is in main.tsx. Do NOT add another <BrowserRouter> here or anywhere.
 * - Use <Routes> + <Route> components ONLY. Do NOT use useRoutes().
 * - STATIC IMPORTS ONLY — no React.lazy() or dynamic import().
 * - Import from 'react-router' — NOT 'react-router-dom' (does not exist).
 */
import { Routes, Route } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Public pages
import Index from '@/pages/Index';
import Catalog from '@/pages/Catalog';
import CourseDetail from '@/pages/CourseDetail';
import Checkout from '@/pages/Checkout';

// Auth pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import AuthCallback from '@/pages/auth/AuthCallback';
import Setup from '@/pages/Setup';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import PaymentProviders from '@/pages/admin/payments/PaymentProviders';
import NewProvider from '@/pages/admin/payments/NewProvider';
import ProviderConfig from '@/pages/admin/payments/ProviderConfig';
import Coupons from '@/pages/admin/payments/Coupons';
import CoursesList from '@/pages/admin/courses/CoursesList';
import CourseForm from '@/pages/admin/courses/CourseForm';
import Categories from '@/pages/admin/courses/Categories';
import PagesList from '@/pages/admin/pages/PagesList';
import PageForm from '@/pages/admin/pages/PageForm';
import UsersList from '@/pages/admin/users/UsersList';
import EmailSettings from '@/pages/admin/settings/EmailSettings';
import VideoSettings from '@/pages/admin/settings/VideoSettings';
import GeneralSettings from '@/pages/admin/settings/GeneralSettings';
import VisualIdentity from '@/pages/admin/settings/VisualIdentity';
import StorageSettings from '@/pages/admin/settings/StorageSettings';
import SecuritySettings from '@/pages/admin/settings/SecuritySettings';
import IntegrationsSettings from '@/pages/admin/settings/IntegrationsSettings';
import LogsSettings from '@/pages/admin/settings/LogsSettings';
import BackupSettings from '@/pages/admin/settings/BackupSettings';
import CalendarSettings from '@/pages/admin/settings/CalendarSettings';
import WhatsAppSettings from '@/pages/admin/settings/WhatsAppSettings';
import AboutSettings from '@/pages/admin/settings/AboutSettings';
import HomepageEditor from '@/pages/admin/settings/HomepageEditor';

// Student pages
import MyCourses from '@/pages/student/MyCourses';
import Lesson from '@/pages/student/Lesson';

export default function App() {
	return (
		<Routes>
			{/* Public routes */}
			<Route path="/" element={<Index />} />
			<Route path="/cursos" element={<Catalog />} />
			<Route path="/curso/:slug" element={<CourseDetail />} />
			<Route path="/checkout/:slug" element={<Checkout />} />
			
			{/* Auth routes */}
			<Route path="/login" element={<Login />} />
			<Route path="/cadastro" element={<Signup />} />
			<Route path="/esqueci-senha" element={<ForgotPassword />} />
			<Route path="/auth/redefinir-senha" element={<ResetPassword />} />
			<Route path="/auth/callback" element={<AuthCallback />} />
			<Route path="/setup" element={<Setup />} />
			
			{/* Admin routes (require admin role) */}
			<Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
			<Route path="/admin/pagamentos" element={<ProtectedRoute requireAdmin><PaymentProviders /></ProtectedRoute>} />
			<Route path="/admin/pagamentos/novo" element={<ProtectedRoute requireAdmin><NewProvider /></ProtectedRoute>} />
			<Route path="/admin/pagamentos/:id" element={<ProtectedRoute requireAdmin><ProviderConfig /></ProtectedRoute>} />
			<Route path="/admin/pagamentos/cupons" element={<ProtectedRoute requireAdmin><Coupons /></ProtectedRoute>} />
			<Route path="/admin/cursos" element={<ProtectedRoute requireAdmin><CoursesList /></ProtectedRoute>} />
			<Route path="/admin/cursos/novo" element={<ProtectedRoute requireAdmin><CourseForm /></ProtectedRoute>} />
			<Route path="/admin/cursos/:id" element={<ProtectedRoute requireAdmin><CourseForm /></ProtectedRoute>} />
			<Route path="/admin/categorias" element={<ProtectedRoute requireAdmin><Categories /></ProtectedRoute>} />
			<Route path="/admin/paginas" element={<ProtectedRoute requireAdmin><PagesList /></ProtectedRoute>} />
			<Route path="/admin/paginas/nova" element={<ProtectedRoute requireAdmin><PageForm /></ProtectedRoute>} />
			<Route path="/admin/paginas/:id" element={<ProtectedRoute requireAdmin><PageForm /></ProtectedRoute>} />
			<Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin><UsersList /></ProtectedRoute>} />
			<Route path="/admin/emails" element={<ProtectedRoute requireAdmin><EmailSettings /></ProtectedRoute>} />
			<Route path="/admin/videos" element={<ProtectedRoute requireAdmin><VideoSettings /></ProtectedRoute>} />
			<Route path="/admin/configuracoes" element={<ProtectedRoute requireAdmin><GeneralSettings /></ProtectedRoute>} />
			<Route path="/admin/identidade-visual" element={<ProtectedRoute requireAdmin><VisualIdentity /></ProtectedRoute>} />
			<Route path="/admin/armazenamento" element={<ProtectedRoute requireAdmin><StorageSettings /></ProtectedRoute>} />
			<Route path="/admin/seguranca" element={<ProtectedRoute requireAdmin><SecuritySettings /></ProtectedRoute>} />
			<Route path="/admin/integracoes" element={<ProtectedRoute requireAdmin><IntegrationsSettings /></ProtectedRoute>} />
			<Route path="/admin/logs" element={<ProtectedRoute requireAdmin><LogsSettings /></ProtectedRoute>} />
			<Route path="/admin/backup" element={<ProtectedRoute requireAdmin><BackupSettings /></ProtectedRoute>} />
			<Route path="/admin/calendario" element={<ProtectedRoute requireAdmin><CalendarSettings /></ProtectedRoute>} />
			<Route path="/admin/whatsapp" element={<ProtectedRoute requireAdmin><WhatsAppSettings /></ProtectedRoute>} />
			<Route path="/admin/sobre" element={<ProtectedRoute requireAdmin><AboutSettings /></ProtectedRoute>} />
			<Route path="/admin/pagina-inicial" element={<ProtectedRoute requireAdmin><HomepageEditor /></ProtectedRoute>} />
			
			{/* Student routes */}
			<Route path="/meus-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
			<Route path="/aula/:slug" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
		</Routes>
	);
}
