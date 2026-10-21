import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireModeratorOrAbove?: boolean;
  requireTeacherOrAbove?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireModeratorOrAbove = false,
  requireTeacherOrAbove = false
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isModeratorOrAbove, isTeacherOrAbove } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div data-ev-id="ev_15c29bdbd7" className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireModeratorOrAbove && !isModeratorOrAbove) {
    return <Navigate to="/" replace />;
  }

  if (requireTeacherOrAbove && !isTeacherOrAbove) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}