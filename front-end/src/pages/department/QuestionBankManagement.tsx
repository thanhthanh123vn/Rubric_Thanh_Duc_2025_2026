import React, { useState, useEffect } from 'react';
import {
    Database, Search, Filter, Plus, Eye, CheckCircle2,
    XCircle, ArrowLeft, Trash2, Edit, Save, BookOpen, Tag, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { questionBankApi } from "@/api/QuestionBankApi.ts";
import {useNavigate} from "react-router-dom";

interface QuestionBank {
    id: string;
    name: string;
    offeringId: string;
    courseId?: string;
    lecturerId: string;
    courseCode: string;
    creatorName: string;
    questionCount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Question {
    id: string;
    bankId: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'PRACTICAL';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    clo: string;
}

export default function QuestionBankManagement() {
    const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
    const navigate = useNavigate();
    // State cho Modal Kho câu hỏi tổng hợp
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [courseQuestions, setCourseQuestions] = useState<Question[]>([]);

    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState<QuestionBank[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);


    useEffect(() => {
        const fetchQuestionBank = async () => {
            try {
                const data = await questionBankApi.getQuestionsByLecturerUserId();
                setBanks(data.data || data || []);
            } catch (e) {
                toast.error('Lỗi khi tải danh sách ngân hàng câu hỏi');
            }
        }
        fetchQuestionBank();
    }, []);

    // 2. Fetch giả lập câu hỏi khi bấm vào "Xem chi tiết" 1 Ngân hàng
    useEffect(() => {
        if (!selectedBank) return;
        setLoading(true);
        setTimeout(() => {
            setQuestions([
                { id: 'Q1', bankId: 'B01', content: 'Thế nào là DBMS?', type: 'ESSAY', difficulty: 'EASY', clo: 'CLO1' },
                { id: 'Q2', bankId: 'B01', content: 'Viết câu lệnh SQL cơ bản', type: 'PRACTICAL', difficulty: 'MEDIUM', clo: 'CLO2' },
            ]);
            setLoading(false);
        }, 500);
    }, [selectedBank]);

    // 3. Logic duyệt / từ chối
    const approveBank = (id: string) => {
        setBanks(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
        toast.success("Đã duyệt ngân hàng câu hỏi!");
    };

    const rejectBank = (id: string) => {
        setBanks(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
        toast.success("Đã từ chối ngân hàng câu hỏi!");
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">Đã duyệt</span>;
            case 'REJECTED': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-md">Từ chối</span>;
            case 'PENDING': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-md">Chờ duyệt</span>;
            default: return null;
        }
    };

    // 4. Mở Modal & Lấy TẤT CẢ câu hỏi của môn học
    const handleOpenQuestionBank = async () => {
        if (banks.length === 0) {
            toast.error("Chưa có dữ liệu môn học để lấy kho câu hỏi.");
            return;
        }

        setIsModalOpen(true);
        setIsLoading(true);
        try {
            const targetId = banks[0].courseId || banks[0].offeringId;


            const data = await questionBankApi.getQuestionBanksByCourseForDep(targetId);



            const questionsData = data.data || data || [];


            setCourseQuestions(questionsData);
        } catch (error) {
            toast.error("Không thể tải Kho câu hỏi!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!selectedBank) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-300 relative">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Database className="w-6 h-6 text-indigo-600" /> Quản lý Ngân hàng Câu hỏi
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Danh sách các kho câu hỏi do giảng viên tải lên</p>
                    </div>

                    <Button
                        onClick={handleOpenQuestionBank}
                        variant="outline"
                        className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <Database className="w-4 h-4" />
                        Kho Câu Hỏi Môn Học
                    </Button>
                </div>

                {/* Bảng Danh sách Ngân hàng */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-4">Tên ngân hàng</th>
                            <th className="px-5 py-4">Môn học</th>
                            <th className="px-5 py-4">Người tạo</th>
                            <th className="px-5 py-4 text-center">Số câu hỏi</th>
                            <th className="px-5 py-4 text-center">Trạng thái</th>
                            <th className="px-5 py-4 text-right">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                        {banks.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-500">Chưa có ngân hàng câu hỏi nào.</td></tr>
                        ) : (
                            banks.map(bank => (
                                <tr key={bank.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-slate-800">{bank.name}</td>
                                    <td className="px-5 py-4 font-medium">{bank.courseCode}</td>
                                    <td className="px-5 py-4">{bank.creatorName}</td>
                                    <td className="px-5 py-4 text-center font-semibold text-slate-600">{bank.questionCount || 0}</td>
                                    <td className="px-5 py-4 text-center">{renderStatus(bank.status)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8 text-xs"
                                                onClick={() => navigate(`question-banks/${banks[0].offeringId}/form-question/${bank[0].id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-1.5"/> Xem
                                            </Button>

                                            {bank.status === "PENDING" && (
                                                <>
                                                    <Button className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs" onClick={() => approveBank(bank.id)}>
                                                        <CheckCircle2 className="w-3 h-3 mr-1"/> Duyệt
                                                    </Button>
                                                    <Button variant="destructive" className="h-8 text-xs" onClick={() => rejectBank(bank.id)}>
                                                        <XCircle className="w-3 h-3 mr-1"/> Từ chối
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL KHO CÂU HỎI (HIỂN THỊ DẠNG BẢNG CÂU HỎI) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-5xl rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Kho Câu Hỏi Tổng Hợp Môn Học</h2>
                                    <p className="text-sm text-slate-500">Môn học: {banks[0]?.courseCode || 'N/A'}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                                    <p className="text-sm text-slate-500">Đang tải toàn bộ dữ liệu kho câu hỏi...</p>
                                </div>
                            ) : courseQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Database className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-500">Môn học này chưa có câu hỏi nào trong hệ thống.</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm max-h-[60vh] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-4 w-20">Mã CH</th>
                                            <th className="px-5 py-4">Nội dung câu hỏi</th>
                                            <th className="px-5 py-4">Loại / CLO</th>
                                            <th className="px-5 py-4 text-center">Độ khó</th>
                                            <th className="px-5 py-4 text-right">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                                        {courseQuestions.map((q, idx) => (
                                            <tr key={q.id || idx} className="hover:bg-slate-50">
                                                <td className="px-5 py-4 font-bold text-slate-500">{q.id || `Q${idx+1}`}</td>
                                                <td className="px-5 py-4 font-medium text-slate-800">{q.content}</td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-slate-700">{q.type}</div>
                                                    <div className="text-[11px] text-slate-400 mt-1">CĐR: {q.clo || 'N/A'}</div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">{q.difficulty}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Button variant="outline" size="sm" className="text-indigo-600 hover:bg-indigo-50 text-xs h-8">
                                                        <Plus className="w-3 h-3 mr-1" /> Trích xuất
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH 2: CHI TIẾT (KHI ĐÃ BẤM VÀO 1 BANK)
    // ==========================================
    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in slide-in-from-right-8 duration-300">
            {/* Header cho trang chi tiết */}
            <div className="flex justify-between items-start bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <div>
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-800 mb-2 -ml-3"
                        onClick={() => setSelectedBank(null)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                    </Button>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Chi tiết: {selectedBank.name}
                    </h2>
                    <div className="flex gap-4 text-sm text-slate-500 mt-2">
                        <span>Môn học: <strong className="text-slate-700">{selectedBank.courseCode}</strong></span>
                        <span>•</span>
                        <span>Giảng viên: <strong className="text-slate-700">{selectedBank.creatorName}</strong></span>
                        <span>•</span>
                        <span>Trạng thái: {renderStatus(selectedBank.status)}</span>
                    </div>
                </div>

                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
                </Button>
            </div>

            {/* Bảng Danh sách Câu hỏi của Bank này */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-4 w-20">Mã CH</th>
                        <th className="px-5 py-4">Nội dung câu hỏi</th>
                        <th className="px-5 py-4">Loại / CLO</th>
                        <th className="px-5 py-4 text-center">Độ khó</th>
                        <th className="px-5 py-4 text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600"/></td></tr>
                    ) : questions.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-slate-500">Chưa có câu hỏi nào.</td></tr>
                    ) : (
                        questions.map(q => (
                            <tr key={q.id} className="hover:bg-slate-50">
                                <td className="px-5 py-4 font-bold text-slate-500">{q.id}</td>
                                <td className="px-5 py-4 font-medium text-slate-800">{q.content}</td>
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-slate-700">{q.type}</div>
                                    <div className="text-[11px] text-slate-400 mt-1">CĐR: {q.clo}</div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">{q.difficulty}</span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}