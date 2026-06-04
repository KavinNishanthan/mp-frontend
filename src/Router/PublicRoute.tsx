import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const PublicRoute = () => {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin' : '/driver'} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
