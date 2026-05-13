import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';

interface ProtectedRouteProps {
  children: React.ReactElement;
  anonymous?: boolean;
}

export const ProtectedRoute = ({ children, anonymous = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.user);

  if (anonymous && isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  if (!anonymous && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
