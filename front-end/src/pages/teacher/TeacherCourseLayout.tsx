import { BookOpen, ChevronDown, ChevronLeft, GraduationCap, LogOut, PanelLeft, Settings, User, Users2 } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { type TeacherCourseItem, teacherCourseMenu } from './teacherCourseData';
import { useEffect, useRef, useState } from 'react';
import courseService from '@/pages/admin/api/courseService.ts';
import { NotificationBell } from '@/components/home/NotificationBell.tsx';
import authService from '@/user/api/authService.ts';
import Banner from '@/components/common/Banner.tsx';
import type { CourseOfferingResponse } from '@/pages/admin/api/type.ts';
import { resolveBannerColor } from '@/utils/colorUtils.ts';
import { courseService as courseDataService } from '@/features/course/courseApi.ts';
import { clampObeProgress } from '@/utils/obeUtils.ts';

export default function TeacherCourseLayout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [offeringDetails, setOfferingDetails] = useState<CourseOfferingResponse | null>(null);
  const [obeProgress, setObeProgress] = useState(0);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const account = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}') as { fullName?: string; email?: string; avatarUrl?: string };
    } catch {
      return {};
    }
  })();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(() =>
    teacherCourseMenu.find(
      (item) => item.children && location.pathname.startsWith(`/teacher/course/${id}/${item.path}`),
    )?.key || null,
  );

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

  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    courseService.getOffering(id)
      .then((data) => { if (active) setOfferingDetails(data); })
      .catch((error) => console.error('Lỗi khi tải giao diện lớp học:', error));

    const updateAppearance = (event: Event) => {
      const detail = (event as CustomEvent<CourseOfferingResponse>).detail;
      if (detail?.offeringId === id) setOfferingDetails(detail);
    };
    window.addEventListener('course-banner-updated', updateAppearance);
    return () => {
      active = false;
      window.removeEventListener('course-banner-updated', updateAppearance);
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    courseDataService.getOBEProgress(id)
      .then((data) => {
        if (active) setObeProgress(clampObeProgress(Number(data?.overallProgress || 0)));
      })
      .catch(() => { if (active) setObeProgress(0); });
    return () => { active = false; };
  }, [id, location.pathname]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const course = courses.find((item) => item.offeringId === id);

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f3_100%)] font-sans antialiased">
      <div className="mx-auto grid h-screen w-full max-w-[1600px] px-0 py-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-white/60 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:flex xl:flex-col">
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
                <Link
                  to={`/teacher/course/${id}/settings`}
                  aria-label="Mở cài đặt lớp học"
                  title="Cài đặt lớp học"
                  className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoTile label="Mã lớp" value={course?.courseCode || '---'} />
                <InfoTile label="Sinh viên" value={String(course?.studentCount || 0)} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-emerald-50/90">
                <span>{course?.semester || 'Học kỳ'}</span>
                <span>{obeProgress}% OBE</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white" style={{ width: `${obeProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Điều hướng học phần
            </p>
            <nav className="space-y-1">
              {teacherCourseMenu.map((item) => {
                const to = item.path
                    ? `/teacher/course/${id}/${item.path}`
                    : `/teacher/course/${id}`;

                if (item.children) {
                  const isExpanded = expandedMenu === item.key;
                  const isParentActive = location.pathname.startsWith(`/teacher/course/${id}/${item.path}`);
                  return (
                      <div key={item.key} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setExpandedMenu((current) => current === item.key ? null : item.key)}
                          aria-expanded={isExpanded}
                          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                            isParentActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                          <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded ? <div className="ml-6 space-y-1 border-l border-slate-200 pl-4">
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
                        </div> : null}
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
                                isActive
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

        <div className="h-screen min-w-0 overflow-y-auto bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-4 py-4 backdrop-blur-xl md:px-6 md:py-5 xl:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to="/teacher"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm xl:hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {/*<div className="relative cursor-pointer rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">*/}
                {/*  <NotificationBell />*/}
                {/*</div>*/}

                <div className="hidden items-center gap-3 md:flex">
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      type="button"
                      aria-expanded={showAccountMenu}
                      onClick={() => setShowAccountMenu((current) => !current)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        {account.avatarUrl ? <img src={account.avatarUrl} alt="" className="h-full w-full object-cover" /> :
                          (course?.lecturerName ? course.lecturerName.charAt(0).toUpperCase() : 'T')}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Giảng viên phụ trách</p>
                        <p className="font-semibold text-slate-900">{course?.lecturerName || 'Chưa cập nhật'}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showAccountMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showAccountMenu ? (
                      <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        <div className="border-b border-slate-100 px-3 py-3">
                          <p className="truncate font-semibold text-slate-900">{account.fullName || course?.lecturerName}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{account.email || 'Tài khoản giảng viên'}</p>
                        </div>
                        <Link to="/teacher/profile" onClick={() => setShowAccountMenu(false)}
                          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                          <User className="h-4 w-4" /> Thông tin cá nhân
                        </Link>
                        <Link to="/teacher/profile/forgot-password" onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">
                          <Settings className="h-4 w-4" /> Cài đặt tài khoản
                        </Link>
                        <button type="button" onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    ) : null}
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
                      <p className="font-semibold text-slate-900">{obeProgress}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
              {teacherCourseMenu.map((item) => {
                if (item.children) {
                  const activeChild = item.children.find((child) =>
                    location.pathname.startsWith(`/teacher/course/${id}/${item.path}/${child.path}`),
                  );
                  return (
                    <label
                      key={item.key}
                      className={`relative inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2.5 text-sm font-medium transition-all ${
                        activeChild
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <select
                        aria-label={item.label}
                        value={activeChild?.path || ''}
                        onChange={(event) => navigate(`/teacher/course/${id}/${item.path}/${event.target.value}`)}
                        className="appearance-none bg-transparent pr-5 font-medium outline-none"
                      >
                        <option value="" disabled className="text-slate-700">{item.label}</option>
                        {item.children.map((child) => <option key={child.key} value={child.path} className="text-slate-700">{child.label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5" />
                    </label>
                  );
                }
                return <NavLink
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
                  </NavLink>;
              })}
            </div>
          </header>

          <main className="p-4 md:p-6 xl:p-8">
            <Banner
              title={course?.courseTitle || offeringDetails?.course?.courseName || 'Học phần'}
              description={`Giảng viên: ${course?.lecturerName || offeringDetails?.lecturers?.map((item) => item.lecturerName).join(', ') || 'Chưa cập nhật'} - Mã lớp: ${id || ''}`}
              color={resolveBannerColor(id || '', offeringDetails?.bannerColor || course?.bannerColor)}
              imageUrl={offeringDetails?.bannerImageUrl}
            />
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
