import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles = [] }: RoleProtectedRouteProps) => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role ?? "";

    // 1. Kiểm tra xem user có quyền khớp chính xác với yêu cầu không
    const hasExactRole = allowedRoles.includes(userRole);


    // Khai báo nhóm các chức vụ có thực hiện công tác giảng dạy
    const teachingRoles = ["TEACHER", "LECTURER", "MAIN_LECTURER", "HEAD_OF_DEPARTMENT", "DEPARTMENT_HEAD", "DEAN", "ADMIN"];


    const isTeacherRoute = allowedRoles.includes("TEACHER") || allowedRoles.includes("LECTURER");
    const canAccessAsTeacher = isTeacherRoute && teachingRoles.includes(userRole);


    if (!hasExactRole && !canAccessAsTeacher) {
        switch (userRole) {
            case "ADMIN": return <Navigate to="/admin" replace />;
            case "DEAN": return <Navigate to="/dean" replace />;
            case "DEPARTMENT_HEAD":
            case "HEAD_OF_DEPARTMENT": return <Navigate to="/department" replace />;
            case "MAIN_LECTURER": return <Navigate to="/mainlecturer" replace />;
            case "TEACHER":
            case "LECTURER": return <Navigate to="/teacher" replace />;
            case "STUDENT": return <Navigate to="/dashboard" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default RoleProtectedRoute;