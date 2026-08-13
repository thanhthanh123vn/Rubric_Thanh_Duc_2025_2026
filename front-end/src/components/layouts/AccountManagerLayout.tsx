import React from 'react';
import {
    User, Settings, BookOpen, MessageSquare, Calendar,
    LogOut, Search, Bell, Menu, Target
} from 'lucide-react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector";

interface AccountManagerProps {
    children: React.ReactNode;
}

export default function AccountManagerLayout({ children }: AccountManagerProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user từ Redux hoặc LocalStorage
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }

    const fullName = user?.fullName || "Người dùng";
    const avatarUrl = user?.avatarUrl || "";

    const getInitial = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        return words[words.length - 1].charAt(0).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Hàm kiểm tra đường dẫn active để đổi màu menu sidebar
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f9f5] font-sans pb-20 lg:pb-0">
            {/* SIDEBAR (Desktop) */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-emerald-100 flex-col shadow-sm z-20 sticky top-0 h-screen print:hidden">
                <div className="h-20 flex items-center px-6 border-b border-emerald-50">
                    <div className="text-emerald-700 font-extrabold text-3xl mr-3 tracking-tighter">NLU Rubric</div>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <Link
                        to="/profile"
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                            isActive('/profile')
                                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                    </Link>

                    <Link
                        to="/profile/settings"
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                            isActive('/profile/settings')
                                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                    </Link>

                    <Link
                        to="/profile/result-grading"
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                            isActive('/profile/result-grading')
                                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Kết quả học tập</span>
                    </Link>

                    {/*<Link*/}
                    {/*    to="/student/rubric"*/}
                    {/*    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${*/}
                    {/*        isActive('/student/rubric')*/}
                    {/*            ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'*/}
                    {/*            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'*/}
                    {/*    }`}*/}
                    {/*>*/}
                    {/*    <Target className="w-5 h-5" />*/}
                    {/*    <span className="font-medium">Chuẩn đầu ra & Rubric</span>*/}
                    {/*</Link>*/}

                    <Link
                        to="/calendar"
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                            isActive('/calendar')
                                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Lịch học</span>
                    </Link>
                </nav>
                <div className="p-6 border-t border-emerald-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
                {/* HEADER */}
                <header className="h-16 lg:h-20 bg-white flex items-center justify-between px-4 lg:px-10 border-b border-emerald-50 sticky top-0 z-30 shadow-sm lg:shadow-none print:hidden">
                    <div className="flex lg:hidden items-center gap-2">
                        <div className="text-emerald-700 font-extrabold text-2xl tracking-tighter">NLU Rubric</div>
                    </div>
                    <div className="hidden sm:block relative w-64 lg:w-[400px]">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Tìm kiếm..." className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent focus:border-emerald-200 focus:bg-white rounded-full text-sm outline-none transition-all" />
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="sm:hidden text-gray-500 hover:text-emerald-700">
                            <Search className="w-6 h-6"/>
                        </button>
                        <button className="relative text-gray-500 hover:text-emerald-700">
                            <Bell className="w-6 h-6"/>
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 cursor-pointer overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                            ) : (
                                getInitial(fullName)
                            )}
                        </div>
                    </div>
                </header>

                {/* KHUNG NỘI DUNG THAY ĐỔI THEO TỪNG TRANG */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                    {children}
                </div>
            </main>

            {/* NAVBAR MOBILE */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] print:hidden">
                <Link to="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Hồ sơ</span>
                </Link>
                <Link to="/profile/result-grading" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <BookOpen className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Học tập</span>
                </Link>
                <Link to="/student/rubric" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <Target className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Rubric</span>
                </Link>
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <Menu className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Menu</span>
                </a>
            </nav>
        </div>
    );
}