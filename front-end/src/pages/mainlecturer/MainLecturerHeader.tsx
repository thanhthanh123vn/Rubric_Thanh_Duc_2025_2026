import { Bell, Search, User } from 'lucide-react';

export default function MainLecturerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative hidden min-w-0 flex-1 md:block md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm CLO, rubric..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
