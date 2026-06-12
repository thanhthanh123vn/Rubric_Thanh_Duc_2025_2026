import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Building2,
    LayoutDashboard,
    ClipboardCheck,
    Layers,
    FileSignature,
    Settings2, Database, BarChart3, Target
} from 'lucide-react';

// Dữ liệu menu điều hướng của Trưởng Bộ Môn map với route.ts
const deptHeadLinks = [
    { path: '/department', label: 'Tổng quan Bộ môn', icon: LayoutDashboard },
    { path: '/department/rubrics', label: 'Phê duyệt Rubric', icon: ClipboardCheck },
    { path: '/department/assessments', label: 'Quản lý Đánh giá', icon: FileSignature },
    { path: '/department/offerings', label: 'Phân công Học phần', icon: Layers },
    { path: '/department/clo', label: 'Chuẩn CLO', icon: Target },
    { path: '/department/analytics', label: 'Phân tích chuẩn đầu ra OBE', icon: BarChart3 },
    { path: '/department/question-banks', label: 'Ngân Hàng Câu Hỏi', icon: Database },
];

export default function DepartmentHeadLayout() {
    const location = useLocation();
    // Ẩn sidebar nếu đang ở trong các trang chi tiết sâu (Ví dụ: /department/rubrics/RB001)
    const inDetailView = location.pathname.split('/').length > 3;

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
                        <nav className="mt-6 space-y-1.5 flex-1">
                            {deptHeadLinks.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/department'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50 translate-x-1'
                                                : 'text-slate-600 hover:bg-slate-100/60 hover:text-teal-700'
                                        }`
                                    }
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Profile snippet dưới cùng của Sidebar (Tuỳ chọn) */}
                        <div className="mt-auto pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">Quản lý Bộ môn</p>
                                    <p className="text-xs text-slate-500 truncate">Sẵn sàng làm việc</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">

                    {/* --- MOBILE NAVIGATION (Chỉ hiện trên màn hình tablet/phone) --- */}
                    {!inDetailView && (
                        <div className="flex gap-2 overflow-x-auto px-4 py-4 md:px-6 xl:hidden hide-scrollbar bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
                            {deptHeadLinks.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/department'}
                                    className={({ isActive }) =>
                                        `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${
                                            isActive
                                                ? 'border-teal-200 bg-teal-50 text-teal-700'
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

                    {/* Nơi render các trang con (Dashboard, Phân công, Duyệt Rubric...) */}
                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 scroll-smooth">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}