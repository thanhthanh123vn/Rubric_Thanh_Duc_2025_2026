import { BookOpen, ChevronLeft, GraduationCap, PanelLeft, Users2 } from 'lucide-react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { type TeacherCourseItem, teacherCourseMenu } from './teacherCourseData';
import { useEffect, useState } from 'react';
import courseService from '@/pages/admin/api/courseService.ts';
import { NotificationBell } from '@/components/home/NotificationBell.tsx';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@radix-ui/react-accordion";

export default function TeacherCourseLayout() {
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getLecturerDashBoardCourses();
        setCourses(data || []);
      } catch (error) {
        console.error('Loi khi tai danh sach lop:', error);
      }
    };

    fetchCourses();
  }, []);

  const course = courses.find((item) => item.offeringId === id);

  return (
    <div className="min-h-[calc(100vh-2rem)] rounded-[2rem] bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f3_100%)] font-sans antialiased">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-6 px-0 py-0 xl:grid-cols-[320px_1fr]">
        <aside className="hidden overflow-hidden rounded-l-[2rem] border-r border-white/60 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:flex xl:flex-col">
          <div className="border-b border-slate-200 p-6">
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại tổng quan
            </Link>

            <div className="mt-5 rounded-[1.75rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/80">Học phần</p>
                  <h2 className="mt-1 text-lg font-bold leading-tight">{course?.courseName || 'Học phần'}</h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoTile label="Mã lớp" value={course?.courseCode || '---'} />
                <InfoTile label="Sinh viên" value={String(course?.studentCount || 0)} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-emerald-50/90">
                <span>{course?.semester || 'Học kỳ'}</span>
                <span>{course?.obeProgress || 0}% OBE</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white" style={{ width: `${course?.obeProgress || 0}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Điều hướng học phần
            </p>
            <nav className="space-y-1">
              {teacherCourseMenu.map((item) => {
                const to =
                    item.key === "questions"
                        ? `/teacher/questions`
                        : item.path
                            ? `/teacher/course/${id}/${item.path}`
                            : `/teacher/course/${id}`;

                const isQuestionActive =
                    item.key === "questions" &&
                    location.pathname.includes("/questions");
                if (item.children) {
                  return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>

                        <div className="ml-6 space-y-1 border-l border-slate-200 pl-4">
                          {item.children.map((child) => (
                              <NavLink
                                  key={child.key}
                                  to={`/teacher/course/${id}/${item.path}/${child.path}`}
                                  className={({ isActive }) =>
                                      `flex items-center rounded-xl px-3 py-2 text-sm transition ${
                                          isActive
                                              ? "bg-emerald-600 text-white"
                                              : "text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
                                      }`
                                  }
                              >
                                {child.label}
                              </NavLink>
                          ))}
                        </div>
                      </div>
                  );
                }
                return (
                    <NavLink
                        key={item.key}
                        to={to}
                        end={item.path === ""}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                isActive || isQuestionActive
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                            }`
                        }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <PanelLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Chế độ làm việc</p>
                  <p className="text-xs text-slate-500">Tập trung vào nghiệp vụ của học phần</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl xl:rounded-r-[2rem]">
          <header className="border-b border-slate-200/70 bg-white/80 px-4 py-4 md:px-6 md:py-5 xl:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to="/teacher"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm xl:hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <div className="min-w-0 truncate">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                    Chi tiết học phần
                  </p>
                  <h3 className="truncate text-lg font-bold text-slate-900 md:text-2xl">
                    {course?.courseTitle || 'Học phần'}
                  </h3>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="relative cursor-pointer rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
                  <NotificationBell />
                </div>

                <div className="hidden items-center gap-3 md:flex">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      {course?.lecturerName ? course.lecturerName.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Giảng viên phụ trách</p>
                      <p className="font-semibold text-slate-900">{course?.lecturerName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                      <Users2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tổng sinh viên</p>
                      <p className="font-semibold text-slate-900">{course?.studentCount || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">OBE</p>
                      <p className="font-semibold text-slate-900">{course?.obeProgress || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
              {teacherCourseMenu.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path ? `/teacher/course/${id}/${item.path}` : `/teacher/course/${id}`}
                  end={item.path === ''}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </header>

          <main className="p-4 md:p-6 xl:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-50/80">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
