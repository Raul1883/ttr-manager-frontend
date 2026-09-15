import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: string; // для обратной совместимости
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
  requiredRole,
}) => {
  const { isLoading, role: userRole } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Сюда вернёте проверку авторизации, когда почините PocketBase:
  // if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roles = allowedRoles || (requiredRole ? [requiredRole] : undefined);

  if (roles && (!userRole || !roles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Если передан children — рендерим его, иначе отдаём вложенные роуты через Outlet
  return children ? <>{children}</> : <Outlet />;
};