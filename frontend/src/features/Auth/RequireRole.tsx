import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

import { type UserRole as Role } from "./types";

export default function RequireRole({ allow }: { allow: Role[] }) {
    const { user, userData } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const role = userData?.roles as Role | undefined;
    if (!role || !allow.includes(role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
}