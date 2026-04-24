import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type {RootState} from "@/app/store";
import AdminLayout from "@/pages/admin/AdminLayout";


const AdminProtectedRoute = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
};

export default AdminProtectedRoute;