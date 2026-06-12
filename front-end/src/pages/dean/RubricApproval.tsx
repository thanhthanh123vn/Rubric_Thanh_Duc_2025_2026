import React, { useState, useEffect } from 'react';
import {
    Search, FileText, CheckCircle2, XCircle, Clock,
    Eye, ChevronRight, X
} from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Layers } from 'lucide-react';
import {rubricApi} from "@/api/RubricApi.ts";
import {RubricPreview} from "@/pages/department/RubricPreview.tsx";





interface RubricSubmission {
    rubricId: string;
    rubricName: string;
    courseId: string;
    createdBy: string;   // ID người tạo
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    feedback?: string;

}

export default function RubricApproval() {
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const isDean = user?.role === 'DEAN';

    const [rubrics, setRubrics] = useState<RubricSubmission[]>([]);
    const [filteredRubrics, setFilteredRubrics] = useState<RubricSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    const [selectedRubric, setSelectedRubric] = useState<RubricSubmission | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);


    const fetchRubrics = async (status: string) => {
        setLoading(true);
        try {

            const data = await rubricApi.getApprovals(status);


            const rawData = Array.isArray(data) ? data : (data.data || []);
            setRubrics(rawData);

        } catch (error) {
            console.error("Lỗi fetch rubrics:", error);
            toast.error("Không thể tải danh sách Rubric từ máy chủ.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchRubrics(activeTab);
    }, [activeTab]);


    useEffect(() => {
        let result = rubrics;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.rubricName?.toLowerCase().includes(query) ||
                r.courseId?.toLowerCase().includes(query) ||
                r.createdBy?.toLowerCase().includes(query)
            );
        }

        setFilteredRubrics(result);
    }, [rubrics, searchQuery]);


    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedRubric) return;

        if (action === 'REJECT' && feedback.trim() === '') {
            toast.error("Vui lòng nhập lý do từ chối để giảng viên có thể chỉnh sửa.");
            return;
        }

        setSubmitting(true);
        try {

            await rubricApi.reviewRubric(selectedRubric.rubricId, action, feedback);

            toast.success(action === 'APPROVE' ? "Đã phê duyệt Rubric thành công!" : "Đã từ chối Rubric.");

            setIsModalOpen(false);
            setFeedback('');

            // Reload lại danh sách sau khi duyệt xong
            fetchRubrics(activeTab);

        } catch (error: any) {
            console.error("Lỗi xử lý rubric:", error);
            const msg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };


    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md"><CheckCircle2 className="w-3.5 h-3.5"/> Đã duyệt</span>;
            case 'REJECTED': return <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-md"><XCircle className="w-3.5 h-3.5"/> Từ chối</span>;
            default: return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md"><Clock className="w-3.5 h-3.5"/> Chờ duyệt</span>;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" /> Phê duyệt Rubric
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Xem xét và đánh giá các bảng tiêu chí chấm điểm do Giảng viên đệ trình.
                </p>
            </div>

            {/* Khung Bộ lọc & Tìm kiếm */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                    {[
                        { id: 'PENDING', label: 'Cần duyệt' },
                        { id: 'APPROVED', label: 'Đã duyệt' },
                        { id: 'REJECTED', label: 'Từ chối' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 px-2 pb-2 md:p-0">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm mã môn, tên người gửi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Tên Rubric / Mã môn</th>
                            <th className="px-6 py-4">Người đệ trình</th>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-400">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : filteredRubrics.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-16">
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText className="w-12 h-12 text-slate-200 mb-3" />
                                        <p className="text-slate-500 font-medium">Không có Rubric nào trong mục này.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRubrics.map((rubric) => (
                                <tr key={rubric.rubricId} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{rubric.rubricName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Mã học phần: {rubric.courseId}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{rubric.createdBy}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {formatDate(rubric.reviewedAt)}
                                    </td>
                                    <td className="px-6 py-4">{renderStatusBadge(rubric.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            onClick={() => { setSelectedRubric(rubric); setIsModalOpen(true); }}
                                            variant="ghost"
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm h-8 px-3 rounded-lg"
                                        >
                                            <Eye className="w-4 h-4 mr-1.5" /> Xem xét
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>


            {isModalOpen && selectedRubric && (
                <div className="fixed inset-0 bg-slate-900/50  z-50 flex items-center justify-center p-4 md:p-6">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{selectedRubric.rubricName}</h3>
                                <p className="text-sm text-slate-500">Mã môn: {selectedRubric.courseId}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Giảng viên đệ trình</p>
                                    <p className="font-semibold text-slate-800">{selectedRubric.createdBy}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Thời gian đệ trình</p>
                                    <p className="font-semibold text-slate-800">{formatDate(selectedRubric.reviewedAt)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 mb-1">Trạng thái hiện tại</p>
                                    <div>{renderStatusBadge(selectedRubric.status)}</div>
                                </div>
                            </div>

                            {/* KHUNG XEM TRƯỚC BẢNG TIÊU CHÍ */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-indigo-500" /> Bản xem trước Nội dung
                                    </h4>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                                        Xem chi tiết <ChevronRight className="w-3 h-3 ml-1"/>
                                    </Button>
                                </div>


                                <RubricPreview rubricId={selectedRubric.rubricId} />
                            </div>

                            {selectedRubric.status === 'PENDING' ? (
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nhận xét / Lý do từ chối <span className="text-slate-400 font-normal">(Bắt buộc nếu Từ chối)</span>
                                    </label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        rows={3}
                                        placeholder="Nhập nội dung phản hồi cho giảng viên..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                </div>
                            ) : (
                                selectedRubric.feedback && (
                                    <div className={`p-4 rounded-2xl border ${selectedRubric.status === 'REJECTED' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                        <p className="text-xs font-bold uppercase mb-1">Phản hồi của cấp quản lý:</p>
                                        <p className="text-sm">{selectedRubric.feedback}</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 border-t border-slate-100 bg-white rounded-b-3xl flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-10 font-medium">Đóng</Button>

                            {selectedRubric.status === 'PENDING' && (
                                <>
                                    <Button
                                        disabled={submitting}
                                        onClick={() => handleAction('REJECT')}
                                        className="bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 border-none rounded-xl h-10 font-bold"
                                    >
                                        Yêu cầu sửa lại (Từ chối)
                                    </Button>
                                    <Button
                                        disabled={submitting}
                                        onClick={() => handleAction('APPROVE')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold shadow-sm"
                                    >
                                        Phê duyệt Rubric
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}