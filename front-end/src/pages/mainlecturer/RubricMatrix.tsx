import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { rubricMatrixData } from './mainLecturerData';

export default function RubricMatrix() {
  const [matrices, setMatrices] = useState(rubricMatrixData);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<typeof rubricMatrixData[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Ánh xạ tiêu chí</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Ma trận Rubric</h3>
        </div>
        <button
          onClick={() => {
            setSelectedMatrix(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Ma trận mới
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          💡 Ma trận Rubric giúp ánh xạ các Course Learning Outcomes (CLO) với tiêu chí chấm điểm và các bài làm của sinh viên.
        </p>
      </div>

      {/* Matrix List */}
      <div className="space-y-4">
        {matrices.map((matrix) => (
          <div key={matrix.id} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900">{matrix.name}</h4>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Học phần</p>
                    <p className="mt-1 text-xl font-bold text-indigo-600">{matrix.courses}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-xs font-medium text-slate-600">CLO</p>
                    <p className="mt-1 text-xl font-bold text-purple-600">{matrix.cloCount}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs font-medium text-slate-600">Tiêu chí</p>
                    <p className="mt-1 text-xl font-bold text-blue-600">{matrix.criteria}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    matrix.status === 'Hoàn tất' ? 'bg-green-100 text-green-700' :
                    matrix.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {matrix.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
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

            {/* Matrix Preview */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">CLO</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Mức độ Bloom</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Tiêu chí</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Trọng số</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-900 font-medium">CLO{i}</td>
                      <td className="px-4 py-2 text-slate-600">Vận dụng</td>
                      <td className="px-4 py-2 text-slate-600">Tiêu chí {i}</td>
                      <td className="px-4 py-2 text-slate-900 font-medium">30%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedMatrix ? 'Chỉnh sửa Ma trận' : 'Tạo Ma trận Rubric mới'}
            </h2>

            <form className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Tên Ma trận</label>
                <input 
                  type="text" 
                  placeholder="VD: Ma trận OBE - Lập trình hệ thống"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Chọn CLO cần ánh xạ</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <label key={i} className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">CLO{i} - Mô tả chuẩn đầu ra {i}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Chọn Rubric để ánh xạ</label>
                <div className="space-y-2">
                  {['Báo cáo kỹ thuật', 'Dự án phần mềm', 'Thuyết trình học phần'].map((rubric) => (
                    <label key={rubric} className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rubric"
                        className="text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{rubric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Chọn học phần áp dụng</label>
                <select className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none">
                  <option>Lập trình hệ thống - K66A</option>
                  <option>Lập trình hệ thống - K66B</option>
                  <option>Lập trình hệ thống - K66C</option>
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
                  {selectedMatrix ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
