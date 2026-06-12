import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Library, Sparkles, LayoutDashboard, ClipboardCheck, BarChart3, BookOpen } from 'lucide-react';

const deanModuleLinks = [
    { path: '/dean', label: 'Tổng quan Khoa', icon: LayoutDashboard },
    { path: '/dean/rubrics', label: 'Phê duyệt Rubric', icon: ClipboardCheck },
    { path: '/dean/analytics', label: 'Phân Tích OBE', icon: ClipboardCheck },
    { path: '/dean/reports', label: 'Báo cáo chất lượng', icon: BarChart3 },
    { path: '/dean/courses', label: 'Quản lý Môn học', icon: BookOpen },
];

export default function DeanLayout() {
    const location = useLocation();

    const inDetailView = location.pathname.includes('/detail/');

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] font-sans antialiased text-slate-900">
            <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">

                {/* --- DESKTOP SIDEBAR --- */}
                {!inDetailView && (
                    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col">

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
                                <div className="rounded-2xl bg-white p-3 text-indigo-700 shadow-sm">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Giám sát chất lượng đào tạo, phê duyệt Rubric đánh giá và xem báo cáo thống kê toàn Khoa.
                            </p>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="mt-6 space-y-1">
                            {deanModuleLinks.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dean'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                                                : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-700'
                                        }`
                                    }
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex min-w-0 flex-1 flex-col">

                    {/* Header: Giả định bạn dùng chung hoặc tạo DeanHeader */}
                    {/* {!inDetailView ? <DeanHeader /> : null} */}

                    {/* --- MOBILE NAVIGATION (Chỉ hiện trên màn hình nhỏ) --- */}
                    {!inDetailView && (
                        <div className="flex gap-2 overflow-x-auto px-4 py-4 md:px-6 xl:hidden hide-scrollbar">
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

                    {/* Nơi render các trang con (Dashboard, Rubrics, Reports...) */}
                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}