import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';

export default function TeacherCourses() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teacherCourses;
    return teacherCourses.filter((course) =>
      [course.courseTitle, course.courseCode, course.semester].some((value) => value.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-6 text-white shadow-2xl shadow-emerald-900/10 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-50/80">Hoc phan phu trach</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Xem nhanh tat ca hoc phan dang giang day.
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 md:text-base">
            Giao dien giong student, nhung tap trung vao view cua giang vien: vao tung hoc phan de quan ly sinh vien,
            rubric, bai tap, OBE va du an.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-black/10">
              Tao hoc phan moi
            </button>
            <button className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
              Import danh sach lop
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: 'Hoc phan dang phu trach', value: '3' },
            { label: 'Tong so sinh vien', value: '164' },
            { label: 'Rubric dang su dung', value: '18' },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-lg shadow-slate-200/40">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tim theo ten hoc phan, ma lop, hoc ky..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {filtered.map((course) => (
          <div key={course.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className={`h-24 bg-gradient-to-r ${course.colorClass} relative`}>
              <div className="absolute right-4 top-4 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {course.semester}
              </div>
            </div>

            <div className="p-5">
              <h4 className="text-lg font-bold text-slate-900">{course.courseTitle}</h4>
              <p className="mt-1 text-sm text-slate-500">{course.courseCode}</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <StatPill label="SV" value={course.studentCount} />
                <StatPill label="Rubric" value={course.rubricCount} />
                <StatPill label="Bai tap" value={course.assignmentCount} />
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tien do OBE</span>
                  <span className="font-bold text-slate-900">{course.obeProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${course.colorClass}`} style={{ width: `${course.obeProgress}%` }} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm italic text-slate-500">{course.lecturerName}</span>
                <button
                  onClick={() => navigate(`/teacher/course/${course.id}`)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Vao hoc phan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

