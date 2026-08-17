import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, requiresCitySelection, currentCity } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresCitySelection || !currentCity) {
    return <Navigate to="/select-city" replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
