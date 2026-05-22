import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Sparkles } from 'lucide-react';
import { mainLecturerModuleLinks } from './mainLecturerData';
import MainLecturerHeader from './MainLecturerHeader';

export default function MainLecturerLayout() {
  const location = useLocation();
  const inCourseDetail = location.pathname.startsWith('/mainlecturer/course/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.10),_transparent_28%),linear-gradient(180deg,_#f7fcf8_0%,_#eefbf1_100%)] font-sans antialiased text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        {!inCourseDetail && (
          <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg shadow-green-700/25">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Main Lecturer</p>
                <h1 className="text-lg font-bold text-slate-900">Rubric Studio</h1>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Mô tả chức năng</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-green-700 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Quản lý chuẩn đầu ra (CLO), xây dựng rubric, tạo ma trận đánh giá cho các học phần.
              </p>
            </div>

            <nav className="mt-6 space-y-1">
              {mainLecturerModuleLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/mainlecturer'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {!inCourseDetail ? <MainLecturerHeader /> : null}
          {!inCourseDetail && (
            <div className="flex gap-2 overflow-x-auto px-4 py-4 md:px-6 xl:hidden">
              {mainLecturerModuleLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/mainlecturer'}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${
                      isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

