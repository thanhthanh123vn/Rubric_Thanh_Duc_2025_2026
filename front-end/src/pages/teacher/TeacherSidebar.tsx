import { GraduationCap, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { teacherModuleLinks } from './teacherData';

export default function TeacherSidebar() {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Teacher Hub</p>
            <h1 className="text-lg font-bold text-slate-900">NLU Rubric Studio</h1>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Hoc ky hien tai</p>
              <p className="text-xl font-bold text-slate-900">HK2 2025-2026</p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Quan ly CLO, rubric, cham diem, phan hoi va bao cao nang luc trong mot khong gian lam viec duy nhat.
          </p>
        </div>

        <nav className="mt-6 space-y-1">
          {teacherModuleLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/teacher'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex gap-2 overflow-x-auto px-4 py-4 md:px-6 xl:hidden">
        {teacherModuleLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/teacher'}
            className={({ isActive }) =>
              `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${
                isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
