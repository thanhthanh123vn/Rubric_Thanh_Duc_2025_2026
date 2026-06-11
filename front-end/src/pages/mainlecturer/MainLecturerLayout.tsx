import { Outlet, useLocation } from 'react-router-dom';
import MainLecturerHeader from './MainLecturerHeader';
import MainLecturerSidebar from './MainLecturerSidebar';

export default function MainLecturerLayout() {
  const location = useLocation();
  const inCourseDetail = location.pathname.startsWith('/mainlecturer/course/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.10),_transparent_28%),linear-gradient(180deg,_#f7fcf8_0%,_#eefbf1_100%)] font-sans antialiased text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        {!inCourseDetail && <MainLecturerSidebar />}

        <div className="flex min-w-0 flex-1 flex-col">
          {!inCourseDetail ? <MainLecturerHeader /> : null}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
