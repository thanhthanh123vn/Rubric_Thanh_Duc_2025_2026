import { BarChart3 } from 'lucide-react';

export default function TeacherCourseOBE() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">OBE</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900">Tien do OBE cua hoc phan</h4>
        </div>
        <BarChart3 className="h-5 w-5 text-cyan-600" />
      </div>

      <div className="mt-6 space-y-4">
        {[
          { clo: 'CLO1', progress: 90 },
          { clo: 'CLO2', progress: 82 },
          { clo: 'CLO3', progress: 74 },
        ].map((item) => (
          <div key={item.clo}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.clo}</span>
              <span className="font-semibold text-slate-900">{item.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

