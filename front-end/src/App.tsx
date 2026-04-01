import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import trang đăng nhập của bạn
import LoginPage from './user/login';
import RegisterPage from './user/RegisterPage'

// Giả sử sau này bạn có thêm trang Dashboard cho Sinh viên
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
          {/* 1. Mặc định khi vào trang chủ (/) sẽ tự động chuyển hướng sang /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Tuyến đường cho trang Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />




            <Route path="*" element={<div className="p-10">404 - Không tìm thấy trang này!</div>} />
        </Routes>
      </Router>
  );
}

export default App;