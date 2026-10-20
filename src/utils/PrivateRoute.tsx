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
  const { isLoading, user, role: userRole } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Не залогинен (например, сессия закрылась после 401 или refresh) — на вход.
  // Раньше этой проверки не было, и гость попадал на защищённые страницы,
  // где данные не грузились (SWR-ключ вида `user ? ... : null` → вечная пустота).
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = allowedRoles || (requiredRole ? [requiredRole] : undefined);

  if (roles && (!userRole || !roles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Если передан children — рендерим его, иначе отдаём вложенные роуты через Outlet
  return children ? <>{children}</> : <Outlet />;
};