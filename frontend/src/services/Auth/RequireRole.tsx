import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { type UserRole as Role } from "./types";

export default function RequireRole({ allow }: { allow: Role[] }) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = userData?.roles;
  if (!allow.some((r) => userRoles?.includes(r))) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}
