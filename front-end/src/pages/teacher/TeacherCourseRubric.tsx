import { FileText } from 'lucide-react';

export default function TeacherCourseRubric() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Rubric</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900">Rubric cua hoc phan</h4>
        </div>
        <FileText className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="mt-6 space-y-3">
        {[
          'Rubric bao cao ky thuat',
          'Rubric presentation',
          'Rubric du an nhom',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

