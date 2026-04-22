import { ArrowRight, CheckCircle2, MoreHorizontal, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  cloItems,
  quickStats,
  teacherHighlights,
  teacherTones,
} from './teacherData';
import { teacherCourses } from './teacherCourseData';

function ToneBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${teacherTones[tone] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {label}
    </span>
  );
}

export default function TeacherOverview() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-6 text-white shadow-2xl shadow-emerald-900/10 md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {teacherHighlights.map((item) => (
                <ToneBadge key={item.title} label={item.title} tone={item.tone} />
              ))}
            </div>

            <div className="max-w-3xl">
              <h3 className="text-3xl font-black tracking-tight md:text-5xl">
                Một nơi để thiết kế, chấm, phản hồi và chứng minh chuẩn đầu ra.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 md:text-base">
                Tổng quan giúp giảng viên nắm nhanh bài nộp, rubric, quiz, điểm danh và báo cáo năng lực.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5">
                Mở Rubric Builder
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/teacher/courses"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Xem học phần
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-lg shadow-slate-200/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <stat.icon className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Học phần phụ trách</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Danh sách lớp giảng viên đang quản lý</h3>
          </div>
          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Tìm theo tên học phần, mã lớp, học kỳ..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {teacherCourses.map((course) => (
            <div key={course.id} className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`relative h-36 bg-gradient-to-r ${course.colorClass}`}>
                <div className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {course.semester}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{course.courseTitle}</h4>
                    <p className="mt-1 text-sm text-slate-500">{course.courseCode}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">SV</p>
                    <p className="text-xl font-black text-slate-900">{course.studentCount}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <CourseMetric label="Rubric" value={course.rubricCount} />
                  <CourseMetric label="Bài tập" value={course.assignmentCount} />
                  <CourseMetric label="OBE" value={`${course.obeProgress}%`} />
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tiến độ OBE</span>
                    <span className="font-bold text-slate-900">{course.obeProgress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${course.colorClass}`}
                      style={{ width: `${course.obeProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm italic text-slate-500">{course.lecturerName}</span>
                  <Link to={`/teacher/course/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
                    Vào học phần
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}
