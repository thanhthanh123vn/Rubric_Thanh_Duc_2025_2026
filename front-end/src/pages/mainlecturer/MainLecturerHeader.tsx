import { useEffect, useRef, useState } from 'react';
import { Search, LogOut, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from "@/user/api/authService.ts";
import { NotificationBell } from "@/components/home/NotificationBell.tsx";

interface MainLecturerInfo {
  fullName?: string;
  role?: string;
  email?: string;
}

export default function MainLecturerHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<MainLecturerInfo | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Đóng profile menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Lỗi khi đăng xuất backend:", error);
    }
  };

  // Lấy chữ cái đầu tiên của tên để làm Avatar
  const getInitial = (name?: string) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  // Chuẩn bị dữ liệu hiển thị (fallback nếu chưa load xong)
  const lecturerName = user?.fullName || 'Main Lecturer';
  const lecturerEmail = user?.email || `${lecturerName.toLowerCase().replace(/\s+/g, '.')}@hcmuaf.edu.vn`;

  return (
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center justify-between">

          {/* --- KHU VỰC BÊN TRÁI: THANH TÌM KIẾM --- */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative hidden min-w-0 flex-1 md:block md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                  type="text"
                  placeholder="Tìm kiếm CLO, rubric..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              />
            </div>
          </div>

          {/* --- KHU VỰC BÊN PHẢI: THÔNG BÁO VÀ AVATAR --- */}
          <div className="relative flex items-center gap-2" ref={menuRef}>

            {/* Badge Học Kì */}
            <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 md:flex mr-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-700">HK2 2025-2026</span>
            </div>

            {/* CHUÔNG THÔNG BÁO */}
            <NotificationBell />

            {/* AVATAR NÚT BẤM */}
            <button
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex h-10 w-10 ml-1 items-center justify-center rounded-full bg-green-600 text-base font-bold text-white transition-all hover:ring-4 hover:ring-green-100 focus:outline-none lg:h-10 lg:w-10 lg:text-lg"
                aria-label="Mở menu tài khoản"
            >
              {getInitial(lecturerName)}
            </button>

            {/* DROPDOWN MENU TÀI KHOẢN */}
            {showProfileMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] origin-top-right rounded-2xl border border-gray-200 bg-[#f8fafd] p-2 shadow-xl transition-all sm:w-[380px] sm:rounded-[28px]">
                  {/* Box thông tin user */}
                  <div className="flex flex-col items-center rounded-xl bg-white p-5 shadow-sm sm:rounded-[24px]">
                <span className="break-all text-center text-xs font-medium text-gray-800 sm:text-sm">
                  {lecturerEmail}
                </span>

                    <div className="mb-2 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl font-normal text-white sm:h-20 sm:w-20 sm:text-4xl">
                      {getInitial(lecturerName)}
                    </div>

                    <h2 className="w-full break-words text-center text-lg font-normal text-gray-900 sm:text-xl">
                      Xin chào, {lecturerName}!
                    </h2>

                    <button
                        onClick={() => window.open('/mainlecturer/profile', '_blank')}
                        className="mt-4 rounded-full border border-green-300 px-4 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 sm:px-6 sm:text-sm"
                    >
                      Quản lý tài khoản
                    </button>
                  </div>

                  {/* Box các nút chức năng */}
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
                      Đăng Xuất
                    </button>
                  </div>

                  {/* Box Footer Links */}
                  <div className="mb-1 mt-2 flex justify-center gap-2 text-[10px] text-gray-600 sm:text-xs">
                    <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                      Chính sách riêng tư
                    </Link>
                    <span className="py-1.5">|</span>
                    <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                      Điều Khoản
                    </Link>
                  </div>
                </div>
            )}

          </div>
        </div>
      </header>
  );
}