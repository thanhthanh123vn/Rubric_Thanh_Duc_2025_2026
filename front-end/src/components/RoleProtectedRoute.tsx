import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    if (!allowedRoles.includes(user?.role)) {
        switch (user?.role) {
            case "ADMIN": return <Navigate to="/admin" replace />;
            case "DEAN": return <Navigate to="/dean" replace />;
            case "DEPARTMENT_HEAD":
            case "HEAD_OF_DEPARTMENT": return <Navigate to="/department" replace />;
            case "MAIN_LECTURER": return <Navigate to="/mainlecturer" replace />;
            case "TEACHER":
            case "LECTURER": return <Navigate to="/teacher" replace />;
            default: return <Navigate to="/dashboard" replace />;
        }
    }


    return <Outlet />;
};

export default RoleProtectedRoute;