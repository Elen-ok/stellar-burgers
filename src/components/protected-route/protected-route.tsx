import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "../../services/store";

interface ProtectedRouteProps {
  children: JSX.Element;
  anonymous?: boolean;
}

export const ProtectedRoute = ({ children, anonymous = false }: ProtectedRouteProps) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  if (anonymous && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!anonymous && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
