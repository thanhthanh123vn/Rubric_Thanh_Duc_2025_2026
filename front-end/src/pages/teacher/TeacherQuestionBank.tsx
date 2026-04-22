import { BookOpen, Sparkles, ShieldCheck } from 'lucide-react';
import { questionMatrix } from './teacherData';

export default function TeacherQuestionBank() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Question bank</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Ngan hang cau hoi va ma tran Bloom</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Muc do</th>
                  <th className="px-4 py-3 font-medium">So cau</th>
                  <th className="px-4 py-3 font-medium">Ti le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {questionMatrix.map((row) => (
                  <tr key={row.level}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.level}</td>
                    <td className="px-4 py-3 text-slate-600">{row.count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.round((row.count / row.total) * 100)}%` }} />
                        </div>
                        <span className="w-14 text-right text-sm font-semibold text-slate-700">
                          {Math.round((row.count / row.total) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 font-semibold text-slate-900">Smart Import</p>
              <p className="mt-1 text-sm text-slate-500">Word / Excel / PDF</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck className="h-5 w-5 text-cyan-600" />
              <p className="mt-3 font-semibold text-slate-900">Tagging bat buoc</p>
              <p className="mt-1 text-sm text-slate-500">Gan CLO va Bloom khi tao cau hoi</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <p className="mt-3 font-semibold text-slate-900">Tao de theo rang buoc</p>
              <p className="mt-1 text-sm text-slate-500">Random with constraints theo ma tran de</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

