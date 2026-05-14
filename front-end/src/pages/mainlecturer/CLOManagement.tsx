import { Plus, Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cloItems, bloomLevels } from './mainLecturerData';

export default function CLOManagement() {
  const [clos, setClos] = useState(cloItems);
  const [showModal, setShowModal] = useState(false);
  const [selectedCLO, setSelectedCLO] = useState<typeof cloItems[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClos = filterStatus === 'all' ? clos : clos.filter(c => c.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Quản lý chuẩn đầu ra</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Course Learning Outcomes (CLO)</h3>
        </div>
        <button
          onClick={() => {
            setSelectedCLO(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Tạo CLO mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'Duyệt', 'Chờ duyệt', 'Nháp'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filterStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'Tất cả' : status}
          </button>
        ))}
      </div>

      {/* CLO List */}
      <div className="space-y-3">
        {filteredClos.map((clo) => (
          <div key={clo.code} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-600">
                    {clo.code}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{clo.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {clo.bloom}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        clo.status === 'Duyệt' ? 'bg-green-100 text-green-700' :
                        clo.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {clo.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Độ hoàn thiện</span>
                <span className="text-xs font-bold text-indigo-600">{clo.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div 
                  className="h-2 rounded-full bg-indigo-600 transition-all" 
                  style={{ width: `${clo.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bloom's Taxonomy Reference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="font-bold text-slate-900">Tham chiếu Bloom's Taxonomy</h4>
        <p className="mt-1 text-sm text-slate-600">Các mức độ nhận thức từ thấp đến cao</p>
        
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {bloomLevels.map((level) => (
            <div key={level.level} className={`rounded-lg border p-3 text-center text-sm font-medium ${level.color}`}>
              {level.level}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedCLO ? 'Chỉnh sửa CLO' : 'Tạo CLO mới'}
            </h2>
            
            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mã CLO</label>
                <input 
                  type="text" 
                  placeholder="VD: CLO1"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Mô tả CLO</label>
                <textarea 
                  placeholder="Mô tả chuẩn đầu ra của sinh viên"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Mức độ Bloom</label>
                <select className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none">
                  {bloomLevels.map(level => (
                    <option key={level.level} value={level.level}>{level.level}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                >
                  {selectedCLO ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
