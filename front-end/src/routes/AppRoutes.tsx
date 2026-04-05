import {Navigate, Route, Routes} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import RegisterPage from "../user/RegisterPage";
import ForgotPasswordPage from "../user/ForgotPasswordPage"
import AccountManagement from '../user/AccountManagement/AccountManagement'


const AppRoutes = () => {
    return (
            <Routes>

                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {/*<Route path="/login" element={<LoginPage />} />*/}
                <Route path="/login" element={<Dashboard />} />
                <Route path="/register" element={<RegisterPage />} />
                {/*<Route path="/dashboard" element={<Dashboard />} />*/}
                <Route path="/profile" element={<AccountManagement />} />
                <Route path="*" element={<div className="p-10">404 - Không tìm thấy trang này!</div>} />
            </Routes>
    )
}
export default AppRoutes;