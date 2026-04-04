import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './user/login';
import RegisterPage from './user/RegisterPage'
import Dashboard from './pages/Dashboard';
import AccountManagement from './user/AccountManagement/AccountManagement';
import ForgotPasswordPage from "./user/ForgotPasswordPage";


const StudentDashboard = () => (
    <div className="p-10 text-2xl font-bold text-emerald-800">
        Chào mừng Thạnh đến với Bảng điều khiển Sinh viên! 🎓
        <p className="text-sm font-normal mt-4 text-gray-600">Đây là nơi sẽ hiển thị Biểu đồ mạng nhện đánh giá năng lực.</p>
    </div>
);

function App() {
    return (
        <Router>
            <Routes>

                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<AccountManagement />} />
                <Route path="*" element={<div className="p-10">404 - Không tìm thấy trang này!</div>} />
            </Routes>
        </Router>
    );
}

export default App;
