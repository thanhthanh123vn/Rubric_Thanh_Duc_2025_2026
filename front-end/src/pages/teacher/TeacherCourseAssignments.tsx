import {
    ClipboardList, Plus, UploadCloud, X, MoreVertical,
    FileText, Loader2, ChevronDown, Clock, Paperclip, CheckCircle, Pencil
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";

export default function TeacherCourseAssignments() {
    const { id } = useParams<{ id: string }>();
    const offeringId = id;

    const [assignments, setAssignments] = useState<any[]>([]);

    // --- STATE MỚI ĐỂ QUẢN LÝ VIỆC SỬA ---
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        assessmentName: '',
        description: '',
        weight: '',
        endTime: '',
        assessmentType: 'upload',
    });
    const [selectedClos, setSelectedClos] = useState<string[]>([]);
    const [selectedRubric, setSelectedRubric] = useState("");

    const listClos = [ { id: "CLO1", code: "CLO1" }, { id: "CLO2", code: "CLO2" } ];
    const listRubrics = [ { id: "R001", name: "Rubric Báo cáo" }, { id: "R002", name: "Rubric Quiz" } ];

    const fetchAssignments = async () => {
        if (!offeringId) return;
        try {
            const data = await assessmentService.getAssessmentsByOffering(offeringId);
            setAssignments(data);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [offeringId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const toggleExpand = (idx: number) => {
        setExpandedIdx(prev => prev === idx ? null : idx);
    };

    // --- HÀM MỞ FORM ĐỂ SỬA BÀI TẬP ---
    const handleEdit = (item: any, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn mở accordion khi bấm nút Sửa

        // Đổ dữ liệu cũ vào Form (Lưu ý: Input datetime-local cần format YYYY-MM-DDThh:mm)
        const dateObj = new Date(item.endTime);
        const formattedDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setFormData({
            assessmentName: item.assessmentName,
            description: item.description || '',
            weight: item.weight?.toString() || '',
            endTime: formattedDate,
            assessmentType: item.assessmentType || 'upload',
        });

        setSelectedRubric(item.rubricId || "");
        setEditingId(item.assessmentId); // Ghi nhớ ID đang sửa
        setIsUploading(true); // Mở Form lên
        setExpandedIdx(null); // Đóng accordion lại cho gọn
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    };

    // --- HÀM ĐÓNG FORM VÀ RESET DATA ---
    const handleCloseForm = () => {
        setIsUploading(false);
        setEditingId(null);
        setFormData({ assessmentName: '', description: '', weight: '', endTime: '', assessmentType: 'upload' });
        setSelectedClos([]);
        setSelectedRubric("");
        setFile(null);
    };

    // --- HÀM SUBMIT XỬ LÝ CẢ TẠO MỚI & CẬP NHẬT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const dataToSubmit = new FormData();
        dataToSubmit.append('assessmentName', formData.assessmentName);
        dataToSubmit.append('description', formData.description);
        dataToSubmit.append('weight', formData.weight);
        dataToSubmit.append('endTime', formData.endTime);
        dataToSubmit.append('assessmentType', formData.assessmentType);

        if (selectedRubric && selectedRubric.trim() !== "") {
            dataToSubmit.append('rubricId', selectedRubric);
        }

        selectedClos.forEach(id => dataToSubmit.append('cloIds', id));
        if (file) dataToSubmit.append('file', file);

        try {
            if (editingId) {
                // GỌI API CẬP NHẬT
                await assessmentService.updateAssessmentWithFormData(editingId, dataToSubmit);
                alert("Cập nhật bài tập thành công!");
            } else {
                // GỌI API TẠO MỚI
                await assessmentService.createAssessmentForOffering(offeringId!, dataToSubmit);
                alert("Tạo bài tập thành công!");
            }

            fetchAssignments();
            handleCloseForm();

        } catch (error) {
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

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

                {!isUploading && (
                    <button
                        onClick={() => {
                            handleCloseForm();
                            setIsUploading(true);
                        }}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tạo bài tập mới</span>
                    </button>
                )}
            </div>

            {/* FORM TẠO/SỬA BÀI TẬP */}
            {isUploading && (
                <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 sm:p-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-emerald-800">
                            {editingId ? "Cập nhật bài tập" : "Thêm bài tập mới"}
                        </h5>
                        <button onClick={handleCloseForm} className="rounded-full p-1 text-slate-400 hover:bg-emerald-100 hover:text-slate-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* --- TOÀN BỘ CÁC INPUT CỦA FORM BẠN GIỮ NGUYÊN CODE CŨ Ở ĐÂY --- */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên bài tập <span className="text-red-500">*</span></label>
                            <input type="text" name="assessmentName" value={formData.assessmentName} onChange={handleInputChange} required className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1" />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô Tả <span className="text-red-500">*</span></label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 resize-none" />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Điểm <span className="text-red-500">*</span></label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} required className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Chọn Rubric chấm điểm</label>
                                <select className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" value={selectedRubric} onChange={(e) => setSelectedRubric(e.target.value)}>
                                    <option value="">-- Không sử dụng Rubric --</option>
                                    {listRubrics.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Loại bài tập</label>
                                <select name="assessmentType" value={formData.assessmentType} onChange={handleInputChange} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1">
                                    <option value="upload">Nộp file (Upload)</option>
                                    <option value="quiz">Trắc nghiệm (Quiz)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Gán chuẩn đầu ra (CLO)</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {listClos.map(clo => (
                                        <label key={clo.id} className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-50">
                                            <input type="checkbox" value={clo.id} checked={selectedClos.includes(clo.id)} onChange={(e) => {
                                                if (e.target.checked) setSelectedClos([...selectedClos, clo.id]);
                                                else setSelectedClos(selectedClos.filter(id => id !== clo.id));
                                            }} />
                                            <span className="text-sm">{clo.code}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Hạn nộp <span className="text-red-500">*</span></label>
                                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1" />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-8 w-8 text-slate-400"/>
                                <div className="mt-2 flex text-sm text-slate-600 justify-center">
                                    <label className="cursor-pointer rounded-md font-semibold text-emerald-600 hover:text-emerald-500">
                                        <span>Tải file mới lên {editingId && "(Thay thế file cũ)"}</span>
                                        <input type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {file ? <span className="font-semibold text-emerald-600">{file.name}</span> : "Tài liệu đính kèm (PDF, DOCX, ZIP tối đa 10MB)"}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={handleCloseForm} disabled={isLoading} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                                Hủy
                            </button>
                            <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70">
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin"/>}
                                {isLoading ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu bài tập')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DANH SÁCH BÀI TẬP */}
            <div className="mt-6 space-y-4">
                {assignments.length === 0 && !isUploading && (
                    <p className="text-center text-slate-500 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Chưa có bài tập nào trong khóa học này.
                    </p>
                )}

                {assignments.map((item, idx) => {
                    const endDate = new Date(item.endTime);
                    const isExpired = endDate < new Date();
                    const isExpanded = expandedIdx === idx;

                    return (
                        <div key={idx} className={`group flex flex-col rounded-2xl border bg-white transition-all duration-200 overflow-hidden ${isExpanded ? 'border-emerald-300 shadow-md ring-2 ring-emerald-50' : 'border-slate-200 hover:border-emerald-200 shadow-sm'}`}>
                            <div onClick={() => toggleExpand(idx)} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 gap-4 sm:gap-0">
                                {/* Trái */}
                                <div className="flex items-start gap-3.5 w-full sm:w-auto">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${isExpanded ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                        <FileText className="h-6 w-6"/>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-[15px] sm:text-base font-bold text-slate-900 leading-tight pr-2">
                                            {item.assessmentName}
                                        </h5>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
                                            <span className="flex items-center gap-1.5 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3.5 h-3.5" />
                                                {endDate.toLocaleString('vi-VN')}
                                            </span>
                                            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                {item.weight} điểm
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phải (Status + Các Nút bấm) */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-100 sm:border-none pt-3 sm:pt-0 w-full sm:w-auto">
                                    <span className={`rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold flex items-center gap-1 ${!isExpired ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {!isExpired ? <CheckCircle className="w-3.5 h-3.5"/> : <X className="w-3.5 h-3.5"/>}
                                        {!isExpired ? "Đang mở" : "Đã hết hạn"}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        {/* --- NÚT SỬA --- */}
                                        <button
                                            onClick={(e) => handleEdit(item, e)}
                                            title="Sửa bài tập"
                                            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>

                                        <button onClick={(e) => e.stopPropagation()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 transition-colors">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                        <div className={`rounded-lg p-1 transition-transform duration-200 text-slate-400 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`}>
                                            <ChevronDown className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chi tiết */}
                            {isExpanded && (
                                <div className="px-4 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-2">
                                        <h6 className="text-sm font-bold text-slate-800 mb-2">Mô tả bài tập:</h6>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.description}</p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                                {item.assessmentType === 'upload' ? <UploadCloud className="w-4 h-4"/> : <ClipboardList className="w-4 h-4"/>}
                                                {item.assessmentType === 'upload' ? 'Nộp File' : 'Trắc nghiệm'}
                                            </span>
                                            {item.rubricId && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                                                    Đánh giá qua Rubric
                                                </span>
                                            )}
                                            {item.fileUrl && (
                                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold border transition-colors">
                                                    <Paperclip className="w-4 h-4"/> Tải tài liệu đính kèm
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}