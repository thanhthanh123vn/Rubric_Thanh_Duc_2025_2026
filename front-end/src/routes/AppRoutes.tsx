import {Navigate, Route, Routes} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import RegisterPage from "../user/RegisterPage";
import ForgotPasswordPage from "../user/ForgotPasswordPage"
import AccountManagement from '../user/AccountManagement/AccountManagement'
import CourseDetail from "../features/course/components/CourseDetail";
import LoginPage from "../user/login";
import CourseStudentList from "../features/course/components/CourseStudentList";


const AppRoutes = () => {
    return (
            <Routes>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/course/:id" element={<CourseDetail/>}></Route>
                <Route path="/course/:id/students" element={<CourseStudentList/>}></Route>

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<AccountManagement />} />
                <Route path="*" element={<div className="p-10">404 - Không tìm thấy trang này!</div>} />
            </Routes>
    )
}
export default AppRoutes;