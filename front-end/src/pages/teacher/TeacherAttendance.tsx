import { MapPin, TimerReset } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';
import { attendanceRules } from './teacherData';

export default function TeacherAttendance() {
  const { id } = useParams<{ id: string }>();
  const course = teacherCourses.find((item) => item.id === id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Attendance</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          Điểm danh thông minh QR + GPS {course ? `- ${course.courseTitle}` : ''}
        </h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            {attendanceRules.map((rule) => (
              <div key={rule.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{rule.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{rule.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Buổi học hiện tại</p>
                <p className="mt-2 text-2xl font-bold">DHKTPM-2026-08</p>
              </div>
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-sm text-slate-300">QR hết hạn sau 05:00 phút</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Chuyên cần tuần này</p>
              <TimerReset className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>Đúng giờ</span>
              <span className="font-semibold text-emerald-600">86%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[86%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
