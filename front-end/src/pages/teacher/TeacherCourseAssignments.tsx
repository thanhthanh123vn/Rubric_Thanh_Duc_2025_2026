import { ClipboardList, Plus, UploadCloud, X, MoreVertical, FileText } from 'lucide-react';
import { useState } from 'react';

const assignments = [
    { name: 'Quiz CLO1', status: 'Đã mở', due: '25/04/2026', type: 'quiz' },
    { name: 'Báo cáo project', status: 'Đang nhận bài', due: '29/04/2026', type: 'upload' },
    { name: 'Bài tập tuần 3', status: 'Đang chấm', due: '30/04/2026', type: 'upload' },
];

export default function TeacherCourseAssignments() {
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-emerald-600 sm:hidden" />
                        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Bài tập</p>
                    </div>
                    <h4 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">Quản lý bài tập & Quiz</h4>
                </div>

                {/* Action Button - Full width on mobile, auto on sm+ */}
                {!isUploading && (
                    <button
                        onClick={() => setIsUploading(true)}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tạo / Tải lên bài tập</span>
                    </button>
                )}
            </div>

            {/* Upload/Create Form Section (Conditional) */}
            {isUploading && (
                <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 sm:p-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-emerald-800">Thêm bài tập mới</h5>
                        <button onClick={() => setIsUploading(false)} className="rounded-full p-1 text-slate-400 hover:bg-emerald-100 hover:text-slate-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên bài tập</label>
                            <input type="text" placeholder="Nhập tên bài tập..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                        </div>

                        {/* --- TRƯỜNG MÔ TẢ BÀI TẬP MỚI THÊM VÀO --- */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả / Hướng dẫn</label>
                            <textarea
                                rows={3}
                                placeholder="Nhập yêu cầu, hướng dẫn chi tiết cho bài tập này..."
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        {/* -------------------------------------- */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Hạn nộp</label>
                                <input type="datetime-local" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Loại</label>
                                <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                                    <option>Nộp file (Upload)</option>
                                    <option>Trắc nghiệm (Quiz)</option>
                                </select>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                                <div className="mt-2 flex text-sm text-slate-600 justify-center">
                                    <label className="relative cursor-pointer rounded-md font-semibold text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 hover:text-emerald-500">
                                        <span>Tải file lên</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                    </label>
                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                </div>
                                <p className="text-xs text-slate-500">Tài liệu đính kèm (PDF, DOCX, ZIP tối đa 10MB)</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsUploading(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                Hủy
                            </button>
                            <button type="button" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
                                Lưu bài tập
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assignment List */}
            <div className="mt-6 space-y-3">
                {assignments.map((item, idx) => (
                    <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all hover:border-emerald-200 hover:shadow-sm bg-slate-50/50 hover:bg-white gap-3 sm:gap-0">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-emerald-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 leading-tight">{item.name}</p>
                                <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Hạn: <span className="font-medium text-slate-700">{item.due}</span></p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 ml-13 sm:ml-0">
              <span className={`rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold w-fit
                ${item.status === 'Đã mở' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  item.status === 'Đang nhận bài' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'}`}
              >
                {item.status}
              </span>
                            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}