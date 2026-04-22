import { ClipboardList } from 'lucide-react';

const assignments = [
  { name: 'Quiz CLO1', status: 'Da mo', due: '25/04/2026' },
  { name: 'Bao cao project', status: 'Dang nhan bai', due: '29/04/2026' },
  { name: 'Bai tap tuan 3', status: 'Dang cham', due: '30/04/2026' },
];

export default function TeacherCourseAssignments() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Bai tap</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900">Quan ly bai tap, quiz va nho han</h4>
        </div>
        <ClipboardList className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="mt-6 space-y-3">
        {assignments.map((item) => (
          <div key={item.name} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">Han: {item.due}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

