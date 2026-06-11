import { Link, Outlet, useLocation } from 'react-router-dom';
import TeacherHeader from './TeacherHeader';
import TeacherSidebar from './TeacherSidebar';

export default function TeacherLayout() {
  const location = useLocation();
  const inCourseDetail = location.pathname.startsWith('/teacher/course/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f3_100%)] font-sans antialiased text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        {!inCourseDetail && <TeacherSidebar />}

        <div className="flex min-w-0 flex-1 flex-col">
          {!inCourseDetail ? <TeacherHeader /> : null}

          <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-6 md:py-8 xl:px-8">
            <Outlet />
            {!inCourseDetail && (
              <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-xl shadow-slate-200/60 backdrop-blur-xl xl:hidden">
                <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                  Sinh vien
                </Link>
                <span className="text-slate-300">|</span>
                <Link to="/teacher" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  Giang vien
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
