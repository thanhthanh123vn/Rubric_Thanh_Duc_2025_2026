import { useContext, useEffect, useMemo, useState } from "react";
import {
  BarChart3, Bell, BookOpen, CheckCircle2, ChevronDown, ChevronLeft,
  ClipboardList, FileText, FolderKanban, GraduationCap, LayoutDashboard,
  PanelLeft, ReceiptText, TimerReset, Users, Users2, X,
} from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { courseService } from "@/features/course/courseApi";
import { StudentCourseLayoutContext } from "./StudentCourseLayoutContext";
import { calculateStudentObeProgress } from '@/utils/obeUtils';

interface SidebarProps { isOpen?: boolean; onClose?: () => void; layoutRoot?: boolean; }
type IconType = React.ComponentType<{ size?: number; className?: string }>;
type SubItem = { key: string; label: string; path: string; search?: string; icon: IconType };
type MenuItem = { key: string; label: string; path: string; icon: IconType; children?: SubItem[] };
type CourseSummary = { name: string; code: string; semester: string };

export default function ClassSidebar({ isOpen = false, onClose, layoutRoot = false }: SidebarProps) {
  const insideCourseLayout = useContext(StudentCourseLayoutContext);
  const { id = "" } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [obeProgress, setObeProgress] = useState(0);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [evaluationsOpen, setEvaluationsOpen] = useState(() =>
    location.pathname.includes("/evaluations") || location.pathname.includes("/my-exams"),
  );

  useEffect(() => {
    let active = true;
    if (!id) return undefined;

    courseService.getCourseById(id).then((data) => {
      if (!active) return;
      setCourse({
        name: data?.course?.courseName || data?.courseName || "Học phần",
        code: data?.course?.courseCode || data?.courseCode || id,
        semester: [data?.semester, data?.year].filter(Boolean).join(" · "),
      });
    }).catch(() => {
      if (active) setCourse({ name: "Học phần", code: id, semester: "" });
    });

    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!id) return undefined;

    courseService.getOBEProgressByStudent(id).then((items) => {
      if (!active) return;
      setObeProgress(calculateStudentObeProgress(items));
    }).catch(() => {
      if (active) setObeProgress(0);
    });

    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (location.pathname.includes("/evaluations") || location.pathname.includes("/my-exams")) {
      setEvaluationsOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (onClose) return undefined;
    const openSidebar = () => setUncontrolledOpen(true);
    window.addEventListener("student-course-sidebar:open", openSidebar);
    return () => window.removeEventListener("student-course-sidebar:open", openSidebar);
  }, [onClose]);

  const menuItems: MenuItem[] = useMemo(() => [
    { key: "posts", icon: FileText, label: "Bảng tin", path: "" },
    { key: "assignments", icon: ClipboardList, label: "Bài tập", path: "assignments" },
    { key: "document", icon: ReceiptText, label: "Tài liệu", path: "document" },
    {
      key: "evaluations", icon: CheckCircle2, label: "Đánh giá & kết quả", path: "evaluations",
      children: [
        { key: "attendance", label: "Điểm danh", path: "evaluations", search: "?section=attendance", icon: TimerReset },
        { key: "assignment", label: "Kết quả bài tập", path: "evaluations", search: "?section=assignments", icon: ClipboardList },
        { key: "my-exams", label: "Bài thi", path: "my-exams", icon: BookOpen },
        { key: "project", label: "Project", path: "evaluations", search: "?section=project", icon: FolderKanban },
        { key: "course-result", label: "Kết quả học phần", path: "evaluations", search: "?section=course-result", icon: GraduationCap },
      ],
    },
    { key: "obe", icon: BarChart3, label: "Tiến độ OBE", path: "obe" },
    { key: "groups", icon: Users2, label: "Nhóm của tôi", path: "groups" },
    { key: "students", icon: Users, label: "Thành viên lớp", path: "students" },
    { key: "notifications", icon: Bell, label: "Thông báo", path: "notifications" },
  ], []);

  const sidebarOpen = onClose ? isOpen : uncontrolledOpen;
  const closeSidebar = () => {
    setUncontrolledOpen(false);
    onClose?.();
  };
  const basePath = `/course/${id}`;

  if (insideCourseLayout && !layoutRoot) {
    return <span data-student-course-legacy-sidebar className="hidden" />;
  }

  return (
    <>
      {sidebarOpen && (
        <button type="button" aria-label="Đóng menu lớp học"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`${layoutRoot ? "fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen" : "fixed inset-y-0 left-0"} z-50 flex w-[286px] flex-col overflow-hidden border-r border-white/60 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-300 lg:w-72 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-slate-200 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <NavLink to="/dashboard" onClick={closeSidebar}
              className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
              <ChevronLeft size={17} /> Tất cả môn học
            </NavLink>
            <button type="button" onClick={closeSidebar}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden" aria-label="Đóng menu">
              <X size={20} />
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><GraduationCap size={24} /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-50/80">Học phần</p>
                <h2 className="mt-1 line-clamp-2 text-base font-bold leading-tight">{course?.name || "Đang tải..."}</h2>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="min-w-0 rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-50/80">Mã lớp</p>
                <p className="mt-1 truncate text-sm font-bold text-white">{course?.code || id}</p>
              </div>
              <div className="min-w-0 rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-50/80">Học kỳ</p>
                <p className="mt-1 truncate text-sm font-bold text-white">{course?.semester || "---"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-emerald-50/90">
              <span>Tiến độ cá nhân</span>
              <span className="font-bold">{obeProgress}% OBE</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, obeProgress))}%` }} />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Điều hướng trong học phần">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Điều hướng học phần</p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const itemUrl = item.path ? `${basePath}/${item.path}` : basePath;
              if (item.children) {
                const parentActive = location.pathname.startsWith(`${basePath}/evaluations`) || location.pathname.startsWith(`${basePath}/my-exams`);
                return (
                  <div key={item.key} className="space-y-1">
                    <button type="button" onClick={() => setEvaluationsOpen((current) => !current)} aria-expanded={evaluationsOpen}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${parentActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"}`}>
                      <Icon size={19} className="shrink-0" /><span>{item.label}</span>
                      <ChevronDown size={16} className={`ml-auto transition-transform ${evaluationsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {evaluationsOpen && (
                      <div className="ml-5 space-y-0.5 border-l border-slate-200 pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childUrl = `${basePath}/${child.path}${child.search || ""}`;
                          const childActive = location.pathname === `${basePath}/${child.path}` && location.search === (child.search || "");
                          return (
                            <NavLink key={child.key} to={childUrl} onClick={closeSidebar}
                              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition ${childActive ? "bg-emerald-600 font-semibold text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-700"}`}>
                              <ChildIcon size={15} className="shrink-0" /><span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <NavLink key={item.key} to={itemUrl} end={!item.path} onClick={closeSidebar}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${isActive ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"}`}>
                  <Icon size={19} className="shrink-0" /><span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <PanelLeft className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Chế độ học tập</p>
                <p className="text-xs leading-relaxed text-slate-500">Theo dõi bài học, đánh giá và chuẩn đầu ra</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200/80 p-3">
          <NavLink to="/dashboard" onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-emerald-700">
            <LayoutDashboard size={19} /> Trang chủ sinh viên
          </NavLink>
        </div>
      </aside>
      {!layoutRoot && <div aria-hidden="true" className="hidden w-72 shrink-0 lg:block" />}
    </>
  );
}
