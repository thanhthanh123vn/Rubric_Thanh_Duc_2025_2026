import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Building2,
    LayoutDashboard,
    ClipboardCheck,
    Layers,
    FileSignature,
    Settings2,
    Database,
    BarChart3,
    Target,
    LogOut,
    Menu,
    UserPlus, Bell, Send, Inbox, ChevronDown // Đã thêm icon này
} from 'lucide-react';

import { useAppSelector } from "@/hooks/useAppSelector";
import { NotificationBell } from "@/components/home/NotificationBell.tsx";
import authService from "@/user/api/authService.ts"; // Chú ý đường dẫn

const deptHeadLinks = [
    { path: '/department', label: 'Tổng quan Bộ môn', icon: LayoutDashboard },
    { path: '/department/rubrics', label: 'Phê duyệt Rubric', icon: ClipboardCheck },
    { path: '/department/assessments', label: 'Quản lý Đánh giá', icon: FileSignature },
    { path: '/department/offerings', label: 'Phân công Học phần', icon: Layers },
    { path: '/department/clo', label: 'Chuẩn CLO', icon: Target },
    { path: '/department/obe', label: 'Phân tích chuẩn đầu ra OBE', icon: BarChart3 },
    { path: '/department/question-banks', label: 'Ngân Hàng Câu Hỏi', icon: Database },
    {
        label: 'Thông Báo',
        path: '/department/notifications',
        icon: Bell,
        subItems: [
            {
                label: 'Gửi thông báo',
                path: '/department/notifications/send',
                icon: Send
            },
            {
                label: 'Thông báo đã gửi',
                path: '/department/notifications/sent',
                icon: Inbox
            }
        ]
    }
];

export default function DepartmentHeadLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Quản lý trạng thái mở/đóng menu tài khoản
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const currentUser = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

    const inDetailView = location.pathname.split('/').length > 6;
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
            await authService.logout();


            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Lỗi khi đăng xuất backend:", error);

        }
    };
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



    const checkIsActive = (path: string) => {
        if (path === '/department') {
            return location.pathname === '/department';
        }
        if (path === '/department/question-banks') {
            return location.pathname.includes('/question-banks') || location.pathname.includes('/questions/public');
        }
        return location.pathname.startsWith(path);
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitial = (name?: string) => {
        if (!name) return 'T';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const headName = currentUser?.fullName || 'Trưởng Bộ Môn';
    const headEmail = currentUser?.email || `${headName.toLowerCase().replace(/\s+/g, '.')}@hcmuaf.edu.vn`;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f0fdfa_100%)] font-sans antialiased text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">

                {/* --- DESKTOP SIDEBAR --- */}
                {!inDetailView && (
                    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col z-10">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-teal-600">Department</p>
                                <h1 className="text-lg font-bold text-slate-900">Trưởng Bộ Môn</h1>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Khu vực quản lý</p>
                                </div>
                                <div className="rounded-2xl bg-white p-2.5 text-teal-600 shadow-sm border border-slate-100">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600">
                                Điều phối giảng dạy, phê duyệt tiêu chí đánh giá và theo dõi chất lượng các môn học thuộc bộ môn.
                            </p>
                        </div>

                        {/* Navigation Menu */}
                        {/* Navigation Menu */}
                        <nav className="mt-6 space-y-1.5 flex-1">
                            {deptHeadLinks.map((item: any) => {
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isSubMenuOpen = openMenus[item.label];
                                const isActive = checkIsActive(item.path);

                                // NẾU CÓ MENU CON
                                if (hasSubItems) {
                                    return (
                                        <div key={item.label} className="space-y-1">
                                            {/* Nút bấm cha để xổ menu con (Không phải Link) */}
                                            <button
                                                onClick={() => toggleSubMenu(item.label)}
                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100/60 hover:text-teal-700`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.label}</span>
                                                </div>
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Danh sách menu con */}
                                            {isSubMenuOpen && (
                                                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4">
                                                    {item.subItems.map((subItem: any) => {
                                                        const isSubActive = checkIsActive(subItem.path);
                                                        return (
                                                            <Link
                                                                key={subItem.path}
                                                                to={subItem.path}
                                                                className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                                    isSubActive
                                                                        ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50'
                                                                        : 'text-slate-500 hover:bg-slate-100/60 hover:text-teal-700'
                                                                }`}
                                                            >
                                                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                                <span>{subItem.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // NẾU KHÔNG CÓ MENU CON (Menu đơn)
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50 translate-x-1'
                                                : 'text-slate-600 hover:bg-slate-100/60 hover:text-teal-700'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        {/* ĐÃ XÓA USER PROFILE Ở ĐÂY ĐỂ ĐƯA LÊN HEADER */}
                    </aside>
                )}

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">

                    {/* --- TOP HEADER --- */}
                    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-3 xl:hidden">
                            <span className="font-bold text-teal-700">Trưởng Bộ Môn Portal</span>
                        </div>
                        <div className="hidden xl:block">
                            <span className="text-sm font-medium text-slate-500">Hệ thống quản lý đánh giá OBE - Khoa CNTT NLU</span>
                        </div>

                        {/* Khu vực bên phải Header */}
                        <div className="flex items-center gap-3 ml-auto" ref={menuRef}>
                            <div
                                className="hidden md:flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-700">
                                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"/>
                                <span>
                                  HK{semester} {schoolYear}
                                </span>
                            </div>

                            {/* Chuông thông báo */}
                            <NotificationBell />

                            {/* Menu Tài Khoản Avatar */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu((value) => !value)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-base font-bold text-white transition-all hover:ring-4 hover:ring-teal-100 focus:outline-none lg:h-10 lg:w-10"
                                    aria-label="Mở menu tài khoản"
                                >
                                    {getInitial(headName)}
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] origin-top-right rounded-2xl border border-gray-200 bg-[#f8fafd] p-2 shadow-xl transition-all sm:w-[380px] sm:rounded-[28px]">
                                        <div className="flex flex-col items-center rounded-xl bg-white p-5 shadow-sm sm:rounded-[24px]">
                                            <span className="break-all text-center text-xs font-medium text-gray-800 sm:text-sm">
                                                {headEmail}
                                            </span>

                                            <div className="mb-2 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-3xl font-normal text-white sm:h-20 sm:w-20 sm:text-4xl">
                                                {getInitial(headName)}
                                            </div>

                                            <h2 className="w-full break-words text-center text-lg font-normal text-gray-900 sm:text-xl">
                                                Xin chào, {headName}!
                                            </h2>

                                            <button
                                                onClick={() => window.open('/department/profile', '_blank')}
                                                className="mt-4 rounded-full border border-teal-300 px-4 py-2 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 sm:px-6 sm:text-sm"
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
                            {deptHeadLinks.map((item: any) => {
                                const isActive = checkIsActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all ${
                                            isActive
                                                ? 'border-teal-200 bg-teal-50 text-teal-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Nơi render các trang con */}
                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 scroll-smooth">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}