import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboardPage from '@/pages/admin-dashboard';
import DashboardSchoolPage from '@/pages/dashboard-school';
import DashboardStudentPage from '@/pages/dashboard-student';
import LoginPage from '@/pages/login';
import ModulePlayerPage from '@/pages/module-player';

function HomeRedirect() {
  const { profile } = useAuth();
  if (!profile) return null;
  if (profile.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile.role === 'teacher' || profile.role === 'nurse') {
    return <Navigate to="/school" replace />;
  }
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allow={['student']}>
            <DashboardStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school"
        element={
          <ProtectedRoute allow={['teacher', 'nurse', 'admin']}>
            <DashboardSchoolPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/:moduleId"
        element={
          <ProtectedRoute>
            <ModulePlayerPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
