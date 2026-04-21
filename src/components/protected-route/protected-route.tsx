import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
  anonymous?: boolean;
}

// Демо-режим: проверяем наличие флага в localStorage
const isAuthenticated = () => {
  return localStorage.getItem('demo-auth') === 'true';
};

export const ProtectedRoute = ({ children, anonymous = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const auth = isAuthenticated();

  if (anonymous && auth) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  if (!anonymous && !auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
