import {
  ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, ChevronRight, CircleAlert,
  ClipboardCheck, Clock3, Grid3X3, Megaphone, Plus, Sparkles, Target, UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { cloItems, quickStats } from "./mainLecturerData";

const statStyles = {
  indigo: { icon: "bg-blue-50 text-blue-700", accent: "bg-blue-500" },
  purple: { icon: "bg-violet-50 text-violet-700", accent: "bg-violet-500" },
  blue: { icon: "bg-emerald-50 text-emerald-700", accent: "bg-emerald-500" },
  fuchsia: { icon: "bg-amber-50 text-amber-700", accent: "bg-amber-500" },
};

const pendingTasks = [
  { title: "CLO đang chờ duyệt", description: "Kiểm tra nội dung và mức độ Bloom trước khi công bố.", value: "06", label: "Cần xử lý", icon: Target, path: "/mainlecturer/clo", tone: "amber" },
  { title: "Rubric chưa hoàn thiện", description: "Bổ sung tiêu chí hoặc cân chỉnh tổng trọng số.", value: "04", label: "Bản nháp", icon: ClipboardCheck, path: "/mainlecturer/rubric", tone: "blue" },
  { title: "Học phần chưa phân công", description: "Hoàn tất phân công giảng viên cho học kỳ hiện tại.", value: "02", label: "Sắp đến hạn", icon: UsersRound, path: "/mainlecturer/semester", tone: "rose" },
] as const;

const quickActions = [
  { label: "Tạo CLO", description: "Khai báo chuẩn đầu ra mới", icon: Target, path: "/mainlecturer/clo" },
  { label: "Tạo Rubric", description: "Thiết kế bộ tiêu chí chấm", icon: Plus, path: "/mainlecturer/rubric" },
  { label: "Gửi thông báo", description: "Thông tin tới giảng viên", icon: Megaphone, path: "/mainlecturer/notifications" },
] as const;

const taskTone = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

function getCloStatusStyle(status: string) {
  if (status === "Duyệt") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "Chờ duyệt") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function MainLecturerOverview() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.fullName?.trim() || "Giảng viên phụ trách";

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 pb-6 sm:space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Sparkles className="h-4 w-4" /><span>Không gian quản lý đào tạo</span></div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Xin chào, {displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Theo dõi chuẩn đầu ra, Rubric và tiến độ phân công học phần trong một màn hình tổng quan.</p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <div className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
              <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Học kỳ hiện tại</p><p className="text-sm font-bold text-slate-800">Học kỳ 2 · 2025–2026</p></div>
            </div>
            <Link to="/mainlecturer/semester" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">Quản lý học kỳ <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section aria-label="Số liệu tổng quan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const style = statStyles[stat.tone as keyof typeof statStyles];
          return (
            <article key={stat.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <span className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{stat.label}</p><p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{stat.value}</p></div>
                <div className={`hidden rounded-xl p-2.5 sm:block ${style.icon}`}><stat.icon className="h-5 w-5" /></div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div><div className="flex items-center gap-2"><CircleAlert className="h-5 w-5 text-amber-600" /><h2 className="text-lg font-bold text-slate-900">Công việc cần xử lý</h2></div><p className="mt-1 text-sm text-slate-500">Ưu tiên các đầu việc ảnh hưởng đến tiến độ học kỳ.</p></div>
              <span className="self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">12 việc đang mở</span>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {pendingTasks.map((task) => (
                <Link key={task.title} to={task.path} className="group grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                  <div className={`hidden h-11 w-11 place-items-center rounded-xl border sm:grid ${taskTone[task.tone]}`}><task.icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3 sm:justify-start"><p className="font-semibold text-slate-900 group-hover:text-emerald-700">{task.title}</p><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${taskTone[task.tone]}`}>{task.label}</span></div>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{task.description}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:gap-3"><span className="text-xl font-black text-slate-800">{task.value}</span><ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-5 sm:px-6">
              <div><h2 className="text-lg font-bold text-slate-900">Chuẩn đầu ra gần đây</h2><p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái và mức độ hoàn thiện CLO.</p></div>
              <Link to="/mainlecturer/clo" className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:inline-flex">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="divide-y divide-slate-100">
              {cloItems.map((item) => (
                <Link key={item.code} to="/mainlecturer/clo" className="group block px-4 py-4 transition hover:bg-slate-50 sm:px-6">
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-700">{item.code}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0"><p className="truncate font-semibold text-slate-900 group-hover:text-emerald-700">{item.title}</p><p className="mt-1 text-xs text-slate-500">Bloom: {item.bloom}</p></div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getCloStatusStyle(item.status)}`}>{item.status}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.progress}%` }} /></div><span className="w-9 text-right text-xs font-semibold text-slate-500">{item.progress}%</span></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/mainlecturer/clo" className="flex min-h-12 items-center justify-center gap-2 border-t border-slate-100 text-sm font-semibold text-emerald-700 sm:hidden">Xem tất cả CLO <ArrowRight className="h-4 w-4" /></Link>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Tiến độ học kỳ</p><h2 className="mt-2 text-xl font-bold">Chuẩn hóa đánh giá</h2></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><BookOpenCheck className="h-5 w-5 text-emerald-300" /></div></div>
            <div className="mt-6 flex items-end justify-between gap-4"><div><span className="text-4xl font-black">78</span><span className="text-lg text-slate-300">%</span><p className="mt-1 text-xs text-slate-400">Mức độ hoàn thành</p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">Đúng tiến độ</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-emerald-400" /></div>
            <dl className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Đã chuẩn hóa</dt><dd className="mt-1 text-lg font-bold">18/24</dd></div><div className="rounded-2xl bg-white/5 p-3"><dt className="text-xs text-slate-400">Giảng viên</dt><dd className="mt-1 text-lg font-bold">18/20</dd></div></dl>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><div><p className="text-sm font-semibold">Mốc tiếp theo: 30/08/2026</p><p className="mt-1 text-xs leading-5 text-slate-400">Hoàn tất ma trận Rubric cho các học phần còn lại.</p></div></div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Thao tác nhanh</h2><p className="mt-1 text-sm text-slate-500">Truy cập nhanh các nghiệp vụ thường dùng.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-1">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.path} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><action.icon className="h-5 w-5" /></div>
                  <div className="min-w-0"><p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{action.label}</p><p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{action.description}</p></div><ChevronRight className="ml-auto hidden h-4 w-4 text-slate-300 xl:block" />
                </Link>
              ))}
            </div>
          </section>

          <section className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><p className="font-semibold text-emerald-900">Dữ liệu đang đồng bộ</p><p className="mt-1 text-sm leading-5 text-emerald-800/75">CLO và Rubric đã được cập nhật cho học kỳ hiện tại.</p></div></section>
        </aside>
      </div>
    </div>
  );
}
