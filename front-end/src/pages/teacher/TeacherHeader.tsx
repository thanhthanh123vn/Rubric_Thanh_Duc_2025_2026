import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface TeacherInfo {
  fullName?: string;
  role?: string;
  email?: string;
}

interface TeacherHeaderProps {
  onMenuClick?: () => void;
}

export default function TeacherHeader({ onMenuClick }: TeacherHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setTeacher(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitial = (name?: string) => {
    if (!name) return 'T';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  if (!teacher) {
    return (
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:px-8 lg:py-4">
        <div className="flex h-12 items-center text-sm text-gray-500">Đang tải thông tin...</div>
      </header>
    );
  }

  const teacherName = teacher.fullName || 'ThS. Trần Lê Như Quỳnh';
  const teacherEmail = teacher.email || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@hcmuaf.edu.vn`;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:px-8 lg:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="Mở menu giảng viên"
            >
              <Menu size={24} />
            </button>
          )}

          <button
            onClick={() => navigate('/teacher')}
            className="min-w-0 text-left transition-opacity hover:opacity-90"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
              Hệ thống Đánh giá OBE
            </p>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="truncate text-lg font-bold text-emerald-700 sm:text-xl">
                {teacherName}
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Giảng viên
              </span>
            </div>
            <p className="hidden md:block text-sm text-gray-500">
              Khoa Công nghệ Thông tin • Trường Đại học Nông Lâm TP.HCM
            </p>
          </button>
        </div>

        <div className="relative flex items-center gap-2" ref={menuRef}>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">HK2 2025-2026</span>
          </div>

          <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500" />
          </button>

          <button
            onClick={() => setShowProfileMenu((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white transition-all hover:ring-4 hover:ring-emerald-100 focus:outline-none lg:h-11 lg:w-11 lg:text-lg"
            aria-label="Mở menu tài khoản"
          >
            {getInitial(teacherName)}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] origin-top-right transform rounded-2xl border border-gray-200 bg-[#f8fafd] p-2 shadow-xl sm:w-[380px] sm:rounded-[28px] transition-all">
              <div className="flex flex-col items-center rounded-xl bg-white p-5 shadow-sm sm:rounded-[24px]">
                <span className="break-all text-center text-xs font-medium text-gray-800 sm:text-sm">
                  {teacherEmail}
                </span>

                <div className="mt-4 mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl font-normal text-white sm:h-20 sm:w-20 sm:text-4xl">
                  {getInitial(teacherName)}
                </div>

                <h2 className="w-full break-words text-center text-lg font-normal text-gray-900 sm:text-xl">
                  Xin chào, {teacherName}!
                </h2>

                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 rounded-full border border-emerald-300 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 sm:px-6 sm:text-sm"
                >
                  Quản lý tài khoản
                </button>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                <button className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:gap-4 sm:px-6">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Thêm một tài khoản khác
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:gap-4 sm:px-6"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  Đăng xuất
                </button>
              </div>

              <div className="mt-2 mb-1 flex justify-center gap-2 text-[10px] text-gray-600 sm:text-xs">
                <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                  Chính sách riêng tư
                </Link>
                <span className="py-1.5">•</span>
                <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                  Điều khoản
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
