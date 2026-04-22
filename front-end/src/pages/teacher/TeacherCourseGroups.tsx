import { Workflow } from 'lucide-react';

export default function TeacherCourseGroups() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Nhom & du an</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900">Quan ly nhom trong hoc phan</h4>
        </div>
        <Workflow className="h-5 w-5 text-violet-600" />
      </div>

      <div className="mt-6 space-y-3">
        {[
          { name: 'Nhom 01', task: 'Bao cao tuan 3', progress: '80%' },
          { name: 'Nhom 02', task: 'Prototype', progress: '65%' },
          { name: 'Nhom 03', task: 'Demo 1', progress: '92%' },
        ].map((group) => (
          <div key={group.name} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{group.name}</p>
                <p className="mt-1 text-sm text-slate-500">{group.task}</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                {group.progress}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

