import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';
import { gradingQueue } from './teacherData';

export default function TeacherGrading() {
  const { id } = useParams<{ id: string }>();
  const course = teacherCourses.find((item) => item.id === id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Grading & feedback</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          Chấm bài và phản hồi theo rubric {course ? `- ${course.courseTitle}` : ''}
        </h3>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Nhận xét mẫu</p>
              <div className="mt-3 space-y-2">
                {['Cần bổ sung trích dẫn', 'Lập luận chưa chặt', 'Trình bày rõ ràng', 'Phân tích tốt'].map((comment) => (
                  <div key={comment} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                    {comment}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Quy trình chấm</p>
              <div className="mt-3 space-y-3">
                {['Mở bài nộp và rubric', 'Chọn mức độ từng tiêu chí', 'Thêm phản hồi nhanh', 'Lưu và đồng bộ điểm'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {index + 1}
                    </div>
                    <span className="text-sm text-slate-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Danh sách chờ chấm</p>
              <h4 className="mt-1 text-xl font-bold text-slate-900">Bài nộp gần đây</h4>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-3">
            {gradingQueue.map((item) => (
              <div key={item.student} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.student}</h4>
                    <p className="mt-1 text-sm text-slate-500">{item.task}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>Hạn: {item.deadline}</span>
                  <span className="font-semibold text-slate-900">Điểm hiện tại: {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
