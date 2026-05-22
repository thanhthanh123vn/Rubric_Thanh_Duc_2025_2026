import { Plus, MoreVertical, Calendar } from 'lucide-react';
import { quickStats, mainLecturerHighlights, mainLecturerDots, mainLecturerTones, cloItems } from './mainLecturerData';

export default function MainLecturerOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Chào mừng</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-900">Quản lý chuẩn chất lượng đào tạo</h3>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-700 font-medium hover:bg-green-100">
          <Calendar className="h-5 w-5" />
          Xem theo Học kì
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-6 ${mainLecturerTones[stat.tone as keyof typeof mainLecturerTones]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs opacity-60">{stat.note}</p>
              </div>
              <div className={`rounded-lg p-2 ${mainLecturerTones[stat.tone as keyof typeof mainLecturerTones]}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        {/* CLO Overview */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">CLO gần đây</h4>
              <p className="mt-1 text-sm text-slate-500">Những chuẩn đầu ra đang quản lý</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700 hover:bg-green-100">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {cloItems.map((item) => (
              <div key={item.code} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-green-200 hover:bg-green-50/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 font-semibold text-sm shrink-0">
                      {item.code.replace('CLO', '')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">{item.bloom}</span>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === 'Duyệt' ? 'bg-green-100 text-green-700' :
                          item.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-xl border border-green-200 bg-green-50 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
            Xem tất cả CLO →
          </button>
        </div>

        {/* Highlights */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-bold text-slate-900">Tính năng nổi bật</h4>
          <p className="mt-1 text-sm text-slate-500">Quản lý toàn bộ hệ thống đánh giá</p>

          <div className="mt-6 space-y-4">
            {mainLecturerHighlights.map((highlight) => (
              <div key={highlight.title} className={`rounded-xl border p-4 ${mainLecturerTones[highlight.tone as keyof typeof mainLecturerTones]}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${mainLecturerDots[highlight.tone as keyof typeof mainLecturerDots]}`} />
                  <p className="font-medium">{highlight.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mẹo</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sử dụng ma trận rubric để ánh xạ các CLO với tiêu chí chấm điểm, đảm bảo tính nhất quán trên toàn bộ các học phần.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

