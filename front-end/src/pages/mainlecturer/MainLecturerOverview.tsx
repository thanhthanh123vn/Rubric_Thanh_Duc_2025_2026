import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Grid3X3,
  Megaphone,
  Plus,
  Target,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector.ts";

const stats = [
  { label: "Học phần", value: "06", icon: BookOpen, tone: "bg-blue-50 text-blue-700" },
  { label: "CLO", value: "48", icon: Target, tone: "bg-violet-50 text-violet-700" },
  { label: "Rubric", value: "32", icon: ClipboardCheck, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Ma trận", value: "12", icon: Grid3X3, tone: "bg-amber-50 text-amber-700" },
] as const;

const priorities = [
  { label: "CLO chờ duyệt", count: 6, icon: Target, path: "/mainlecturer/clo", tone: "bg-amber-50 text-amber-700" },
  { label: "Rubric bản nháp", count: 4, icon: ClipboardCheck, path: "/mainlecturer/rubric", tone: "bg-blue-50 text-blue-700" },
  { label: "Học phần chưa phân công", count: 2, icon: UsersRound, path: "/mainlecturer/semester", tone: "bg-rose-50 text-rose-700" },
] as const;

const recentClos = [
  { code: "CLO1", title: "Hiểu nguyên lý hệ thống", bloom: "Hiểu", status: "Đã duyệt", statusTone: "bg-emerald-50 text-emerald-700" },
  { code: "CLO2", title: "Thiết kế dữ liệu rubric", bloom: "Vận dụng", status: "Chờ duyệt", statusTone: "bg-amber-50 text-amber-700" },
  { code: "CLO3", title: "Ánh xạ bài làm theo tiêu chí", bloom: "Phân tích", status: "Bản nháp", statusTone: "bg-slate-100 text-slate-600" },
] as const;

const quickActions = [
  { label: "Tạo CLO", icon: Target, path: "/mainlecturer/clo" },
  { label: "Tạo Rubric", icon: Plus, path: "/mainlecturer/rubric" },
  { label: "Phân công", icon: UsersRound, path: "/mainlecturer/semester" },
  { label: "Thông báo", icon: Megaphone, path: "/mainlecturer/notifications/send" },
] as const;

export default function MainLecturerOverview() {
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.fullName?.trim().split(/\s+/).at(-1) || "Thầy/Cô";

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-5 pb-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-700 to-green-600 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
            <CalendarDays className="h-4 w-4" />
            <span>HK2 · 2025–2026</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Chào {firstName}!</h1>
          <p className="mt-1 text-sm text-emerald-50/90">Bạn có 12 việc cần xử lý.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/mainlecturer/clo" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50">
            <Plus className="h-4 w-4" /> Tạo CLO
          </Link>
          <Link to="/mainlecturer/semester" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
            Quản lý học kỳ <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-label="Số liệu tổng quan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CircleAlert className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-bold text-slate-900">Cần xử lý</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">12 việc</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {priorities.map((item) => (
                <Link key={item.label} to={item.path} className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-black leading-none text-slate-900">{item.count}</p>
                    <p className="mt-1 truncate text-xs font-medium text-slate-600">{item.label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </Link>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-slate-900">CLO gần đây</h2>
              <Link to="/mainlecturer/clo" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentClos.map((item) => (
                <Link key={item.code} to="/mainlecturer/clo" className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-700">{item.code}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Bloom · {item.bloom}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.statusTone}`}>{item.status}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Tiến độ học kỳ</p>
                <p className="mt-1 text-3xl font-black text-slate-900">78%</p>
              </div>
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[conic-gradient(#16a34a_78%,#e2e8f0_0)]">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white"><Check className="h-5 w-5 text-emerald-700" /></div>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[78%] rounded-full bg-emerald-600" /></div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Đã chuẩn hóa</span>
              <span className="font-bold text-slate-800">18 / 24 học phần</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
              <CalendarDays className="h-4 w-4 shrink-0" /> Hạn tiếp theo · 30/08/2026
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Thao tác nhanh</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.path} className="group flex min-h-24 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50">
                  <action.icon className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-800">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
