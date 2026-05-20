// src/app/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  // Chưa đăng nhập → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Sai role → 404
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/404" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
