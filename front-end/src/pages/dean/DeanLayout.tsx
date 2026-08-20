import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Library,
    Sparkles,
    LayoutDashboard,
    ClipboardCheck,
    BarChart3,
    BookOpen,
    LogOut,
    Bell,
    UserPlus, Send, Inbox, ChevronDown
} from 'lucide-react';
import authService from "@/user/api/authService.ts";
import { useAppSelector } from "@/hooks/useAppSelector";
import { NotificationBell } from "@/components/home/NotificationBell.tsx";

const deanModuleLinks = [
    { path: '/dean', label: 'Tổng quan Khoa', icon: LayoutDashboard },
    { path: '/dean/rubrics', label: 'Phê duyệt Rubric', icon: ClipboardCheck },
    { path: '/dean/obe', label: 'Phân Tích OBE', icon: ClipboardCheck },
    { path: '/dean/reports', label: 'Báo cáo chất lượng', icon: BarChart3 },
    { path: '/dean/courses', label: 'Quản lý Môn học', icon: BookOpen },
    {
        label: 'Thông Báo',
        path: '/dean/notifications',
        icon: Bell,
        subItems: [
            {
                label: 'Gửi thông báo',
                path: '/dean/notifications/send',
                icon: Send
            },
            {
                label: 'Thông báo đã gửi',
                path: '/dean/notifications/sent',
                icon: Inbox
            }
        ]
    }
];
export default function DeanLayout() {
    const location = useLocation();
    const router = useNavigate();

    // Quản lý trạng thái mở/đóng menu tài khoản
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Lấy thông tin user hiện tại
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const currentUser = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

    const inDetailView = location.pathname.includes('/detail/');
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    const toggleSubMenu = (label: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label]
        }));
    };
    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            if (authService && typeof authService.logout === 'function') {
                await authService.logout();
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            router('/login');
        }
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitial = (name?: string) => {
        if (!name) return 'D';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const deanName = currentUser?.fullName || 'Trưởng Khoa';
    const deanEmail = currentUser?.email || `${deanName.toLowerCase().replace(/\s+/g, '.')}@hcmuaf.edu.vn`;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let semester: number;
    let schoolYear: string;

    if (month >= 8) {
        semester = 1;
        schoolYear = `${year}-${year + 1}`;
    } else if (month >= 1 && month <= 5) {
        semester = 2;
        schoolYear = `${year - 1}-${year}`;
    } else {
        semester = 3;
        schoolYear = `${year - 1}-${year}`;
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] font-sans antialiased text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">

                {/* --- DESKTOP SIDEBAR --- */}
                {!inDetailView && (
                    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col z-10">

                        {/* Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-lg shadow-indigo-700/25">
                                <Library className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-700">Dean Portal</p>
                                <h1 className="text-lg font-bold text-slate-900">Quản lý Khoa</h1>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Quyền hạn</p>
                                </div>
                                <div className="rounded-2xl bg-white p-3 text-indigo-700 shadow-sm border border-slate-100">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Giám sát chất lượng đào tạo, phê duyệt Rubric đánh giá và xem báo cáo thống kê toàn Khoa.
                            </p>
                        </div>

                        {/* Navigation Menu */}
                        {/* Navigation Menu */}
                        <nav className="mt-6 space-y-1.5 flex-1">
                            {deanModuleLinks.map((item) => {
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isSubMenuOpen = openMenus[item.label];

                                // Nếu có menu con
                                if (hasSubItems) {
                                    return (
                                        <div key={item.label} className="space-y-1">
                                            <button
                                                onClick={() => toggleSubMenu(item.label)}
                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100/60 hover:text-indigo-700`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.label}</span>
                                                </div>
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Render SubItems */}
                                            {isSubMenuOpen && (
                                                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4">
                                                    {item.subItems!.map((subItem) => (
                                                        <NavLink
                                                            key={subItem.path}
                                                            to={subItem.path}
                                                            className={({ isActive }) =>
                                                                `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                                    isActive
                                                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                                                                        : 'text-slate-500 hover:bg-slate-100/60 hover:text-indigo-700'
                                                                }`
                                                            }
                                                        >
                                                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                            <span>{subItem.label}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Nếu không có menu con (Link bình thường)
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/dean'}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50 translate-x-1'
                                                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-indigo-700'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                        {/* Đã xóa nút đăng xuất khỏi Sidebar */}
                    </aside>
                )}

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">

                    {/* --- TOP HEADER --- */}
                    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-3 xl:hidden">
                            <span className="font-bold text-indigo-700">Dean Portal</span>
                        </div>
                        <div className="hidden xl:block">
                            <span className="text-sm font-medium text-slate-500">Hệ thống quản lý đánh giá OBE - Khoa CNTT NLU</span>
                        </div>

                        {/* Khu vực bên phải Header */}
                        <div className="flex items-center gap-3 ml-auto" ref={menuRef}>
                            <div
                                className="hidden md:flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
                                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"/>
                                <span>
                                  HK{semester} {schoolYear}
                                </span>
                            </div>

                            {/* Chuông thông báo */}
                            <NotificationBell/>

                            {/* Menu Tài Khoản Avatar */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu((value) => !value)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white transition-all hover:ring-4 hover:ring-indigo-100 focus:outline-none lg:h-10 lg:w-10"
                                    aria-label="Mở menu tài khoản"
                                >
                                    {getInitial(deanName)}
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] origin-top-right rounded-2xl border border-gray-200 bg-[#f8fafd] p-2 shadow-xl transition-all sm:w-[380px] sm:rounded-[28px]">
                                        <div className="flex flex-col items-center rounded-xl bg-white p-5 shadow-sm sm:rounded-[24px]">
                                            <span className="break-all text-center text-xs font-medium text-gray-800 sm:text-sm">
                                                {deanEmail}
                                            </span>

                                            <div className="mb-2 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-3xl font-normal text-white sm:h-20 sm:w-20 sm:text-4xl">
                                                {getInitial(deanName)}
                                            </div>

                                            <h2 className="w-full break-words text-center text-lg font-normal text-gray-900 sm:text-xl">
                                                Xin chào, {deanName}!
                                            </h2>

                                            <button
                                                onClick={() => window.open('/dean/profile', '_blank')}
                                                className="mt-4 rounded-full border border-indigo-300 px-4 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50 sm:px-6 sm:text-sm"
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

                                        <div className="mb-1 mt-2 flex justify-center gap-2 text-[10px] text-gray-600 sm:text-xs">
                                            <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                                                Chính sách riêng tư
                                            </Link>
                                            <span className="py-1.5">|</span>
                                            <Link to="#" className="rounded-md px-2 py-1.5 transition-colors hover:bg-gray-200">
                                                Điều khoản
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* --- MOBILE NAVIGATION --- */}
                    {!inDetailView && (
                        <div className="flex gap-2 overflow-x-auto px-4 py-3 md:px-6 xl:hidden hide-scrollbar bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-[61px] z-20">
                            {deanModuleLinks.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dean'}
                                    className={({ isActive }) =>
                                        `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${
                                            isActive
                                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    )}

                    {/* Nơi render các trang con */}
                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 scroll-smooth">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}