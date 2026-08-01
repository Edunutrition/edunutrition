import { Navigate } from 'react-router-dom';
import { useAuth, type Role } from '@/hooks/useAuth';

export function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: Role[];
}) {
  const { session, profile, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (allow && (!profile || !allow.includes(profile.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
