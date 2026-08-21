import { Outlet } from "react-router-dom";
import Header from "@/components/home/Header";
import Sidebar from "./Sidebar";
import { StudentCourseLayoutContext } from "./StudentCourseLayoutContext";

export default function StudentCourseLayout() {
  return (
    <StudentCourseLayoutContext.Provider value>
      <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f3_100%)] font-sans antialiased text-slate-900">
        <div className="mx-auto grid h-screen w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)]">
          <Sidebar layoutRoot />

          <div className="h-screen min-w-0 overflow-y-auto bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <Header layoutRoot />
            <main className="student-course-content min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </StudentCourseLayoutContext.Provider>
  );
}
