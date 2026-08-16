"use client"
import {Outlet, Link, useLocation, useNavigate} from 'react-router-dom';
import {
    Users, BookOpen, FileText, Bell, LayoutDashboard, Settings, LogOut, UserPlus
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useState, useRef, useEffect } from 'react';
import authService from "@/user/api/authService.ts";

export default function AdminLayout() {
    const location = useLocation();

    // --- STATE QUẢN LÝ POPUP THÔNG TIN ADMIN ---
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Lấy thông tin admin từ localStorage (hoặc dùng giá trị mặc định)
    const storedUser = localStorage.getItem('user');
    const userInfo = storedUser ? JSON.parse(storedUser) : {
        fullName: 'Quản trị viên',
        email: 'admin@hcmuaf.edu.vn',
        avatarUrl: ''
    };

    // Đóng popup khi click ra bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitial = (name: string) => {
        if (!name) return "AD";
        const words = name.trim().split(' ');
        return words[words.length - 1].charAt(0).toUpperCase();
    };

    const MOBILE_MENU_ITEMS = [
        { title: 'Tổng quan', url: '/admin', icon: LayoutDashboard },
        {
            title: 'Người dùng',
            url: '/admin/users/list-users',
            icon: Users,
        },
        { title: 'Khóa học', url: '/admin/courses/list', icon: BookOpen },
        { title: 'Rubrics', url: '/admin/rubrics', icon: FileText },
        { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
    ];
const navigate = useNavigate();
    const handleLogout = async() => {
        try {
            await authService.logout();


            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Lỗi khi đăng xuất backend:", error);
            // Xem chi tiết lỗi API báo về là gì
        }
    };
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-slate-50 w-full font-sans text-slate-900 pb-16 md:pb-0">

                {/* Sidebar chỉ hiện trên Máy tính */}
                <AdminSidebar />

                <SidebarInset className="flex-1 w-full bg-slate-50 flex flex-col min-w-0">

                    {/* Header với hiệu ứng Kính mờ (Glassmorphism) */}
                    <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 md:px-6 shadow-sm sticky top-0 z-20 transition-all">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-900 md:block hidden" />
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold md:hidden shadow-sm">R</div>
                            <h1 className="font-semibold text-slate-800 text-lg sm:text-xl truncate">
                                Quản trị hệ thống
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>

                            {/* --- KHU VỰC AVATAR & DROPDOWN POPUP --- */}
                            <div className="relative" ref={menuRef}>
                                <div
                                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shadow-inner border border-blue-200 cursor-pointer overflow-hidden transition-transform hover:scale-105"
                                >
                                    {userInfo.avatarUrl ? (
                                        <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitial(userInfo.fullName)
                                    )}
                                </div>

                                {/* POPUP MENU HIỆN LÊN KHI CLICK */}
                                {isUserMenuOpen && (
                                    <div
                                        className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] origin-top-right rounded-2xl border border-gray-200 bg-[#f8fafd] p-2 shadow-xl transition-all sm:w-[380px] sm:rounded-[28px]">
                                        <div
                                            className="flex flex-col items-center rounded-xl bg-white p-5 shadow-sm sm:rounded-[24px]">
                                        <span className="break-all text-center text-xs font-medium text-gray-800 sm:text-sm">
                                        {userInfo.email}
                                        </span>

                                            <div
                                                className="mb-2 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl font-normal text-white sm:h-20 sm:w-20 sm:text-4xl">
                                                {userInfo.avatarUrl ? (
                                                    <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitial(userInfo.fullName)
                                                )}
                                            </div>

                                            <h2 className="w-full break-words text-center text-lg font-normal text-gray-900 sm:text-xl">
                                                Xin chào, {userInfo.fullName}!
                                            </h2>

                                            <button
                                                onClick={() => window.open('/teacher/profile', '_blank')}
                                                className="mt-4 rounded-full border border-emerald-300 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 sm:px-6 sm:text-sm"
                                            >
                                                Quản lý tài khoản
                                            </button>
                                        </div>

                                        <div className="mt-2 flex flex-col gap-1">
                                            <button
                                                className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:gap-4 sm:px-6">
                                                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5"/>
                                               Thêm một tài khoản khác
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:gap-4 sm:px-6"
                                            >
                                                <LogOut className="h-4 w-4 sm:h-5 sm:w-5"/>
                                              Đăng Xuất
                                            </button>
                                        </div>

                                        <div
                                            className="mb-1 mt-2 flex justify-center gap-2 text-[10px] text-gray-600 sm:text-xs">
                                            <Link to="#"
                                                  className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                                                Chinh sach rieng tu
                                            </Link>
                                            <span className="py-1.5">|</span>
                                            <Link to="#"
                                                  className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                                                Dieu khoan
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* --- KẾT THÚC KHU VỰC DROPDOWN --- */}

                        </div>
                    </header>

                    {/* Khu vực render nội dung các trang (Users, Courses...) */}
                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto w-full">
                            <Outlet/>
                        </div>
                    </main>
                </SidebarInset>

                {/* --- MOBILE BOTTOM NAVIGATION (Chuẩn PWA) --- */}
                <nav
                    className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-16 pb-safe z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    {MOBILE_MENU_ITEMS.map((item) => {
                        const isActive = location.pathname === item.url || (item.url !== '/admin' && location.pathname.startsWith(item.url));
                        return (
                            <Link key={item.title} to={item.url}
                                  className="flex flex-col items-center justify-center w-full h-full space-y-1">
                                <div
                                    className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}>
                                    <item.icon className="w-5 h-5"/>
                                </div>
                                <span
                                    className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

            </div>
        </SidebarProvider>
    );
}