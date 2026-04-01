import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import trang đăng nhập của bạn
import LoginPage from './user/login';
import RegisterPage from './user/RegisterPage'
import Dashboard from './dashboard/Dashboard';

function App() {
  return (
      <Router>
        <Routes>
          {/* 1. Mặc định khi vào trang chủ (/) sẽ tự động chuyển hướng sang /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Tuyến đường cho trang Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 3. Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catch-all route */}
          <Route path="*" element={<div className="p-10">404 - Không tìm thấy trang này!</div>} />
        </Routes>
      </Router>
  );
}

export default App;
