import { Plus, Copy, Trash2, Settings } from 'lucide-react';
import { useState } from 'react';
import { rubricTemplates } from './mainLecturerData';

export default function RubricBuilder() {
  const [rubrics, setRubrics] = useState(rubricTemplates);
  const [showModal, setShowModal] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<typeof rubricTemplates[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Xây dựng tiêu chí</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Tạo và Quản lý Rubric</h3>
        </div>
        <button
          onClick={() => {
            setSelectedRubric(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Rubric mới
        </button>
      </div>

      {/* Rubric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rubrics.map((rubric) => (
          <div key={rubric.id} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{rubric.name}</h4>
                <p className="mt-2 text-sm text-slate-600">{rubric.description}</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {rubric.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {tag}
                </span>
              ))}
            </div>

            {/* Criteria */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Tiêu chí đánh giá</p>
              {rubric.criteria.map((criterion) => (
                <div key={criterion} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  {criterion}
                </div>
              ))}
            </div>

            {/* Weight */}
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-600">Trọng số</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{rubric.weight}</p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                Chi tiết
              </button>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                <Copy className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedRubric ? 'Chỉnh sửa Rubric' : 'Tạo Rubric mới'}
            </h2>

            <form className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Tên Rubric</label>
                <input 
                  type="text" 
                  placeholder="VD: Rubric đánh giá báo cáo kỹ thuật"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea 
                  placeholder="Mô tả chi tiết rubric này"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tiêu chí đánh giá</label>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Tiêu chí ${i}`}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Trọng số %"
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <button 
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  + Thêm tiêu chí
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Thẻ (Tags)</label>
                <input 
                  type="text" 
                  placeholder="Nhập các thẻ, phân cách bằng dấu phẩy"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
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
                  {selectedRubric ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
