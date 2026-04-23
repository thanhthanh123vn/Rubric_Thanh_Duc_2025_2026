
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Users, BookOpen, FileText, Bell, LayoutDashboard, GraduationCap, UserCheck, Settings
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout() {
    const location = useLocation();

    
    const MOBILE_MENU_ITEMS = [
        { title: 'Tổng quan', url: '/admin', icon: LayoutDashboard },
        {
            title: 'Người dùng',
            url: '/admin/users/list-users',
            icon: Users,

        },

        { title: 'Khóa học', url: '/admin/courses', icon: BookOpen },
        { title: 'Rubrics', url: '/admin/rubrics', icon: FileText },
        { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
    ];

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
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shadow-inner border border-blue-200 cursor-pointer">
                                AD
                            </div>
                        </div>
                    </header>

                    {/* Khu vực render nội dung các trang (Users, Courses...) */}
                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>

                {/* --- MOBILE BOTTOM NAVIGATION (Chuẩn PWA) --- */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-16 pb-safe z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    {MOBILE_MENU_ITEMS.map((item) => {
                        // Check active state
                        const isActive = location.pathname === item.url || (item.url !== '/admin' && location.pathname.startsWith(item.url));
                        return (
                            <Link key={item.title} to={item.url} className="flex flex-col items-center justify-center w-full h-full space-y-1">
                                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
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