import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi } from "@/api/questionApi.ts";
import { toast } from "sonner";
import courseService from '../admin/api/courseService';
// Import API mà bạn vừa tạo
import { questionBankApi } from "@/api/QuestionBankApi.ts";

const colorClasses = [
    "from-emerald-500 to-teal-400",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-fuchsia-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
];

export default function CourseList() {
    const navigate = useNavigate();

    // States quản lý dữ liệu
    const [courses, setCourses] = useState<any[]>([]); // Dùng cho Dropdown khi Tạo kho
    const [countQuestion, setCountQuestion] = useState<number>();

    const [banks, setBanks] = useState<any[]>([]);     // Dùng để render danh sách Card
    const [isLoading, setIsLoading] = useState(true);

    // 1. Modal Tạo mới
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCourseForBank, setSelectedCourseForBank] = useState<string>("");
    const [bankName, setBankName] = useState("");

    // 2. Modal Chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editBankName, setEditBankName] = useState("");

    // 3. Modal Xóa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State chung để lưu Kho câu hỏi đang được thao tác (Sửa/Xóa)
    const [selectedBankForAction, setSelectedBankForAction] = useState<any>(null);

    // --- FETCH DATA ---
    useEffect(() => {
        console.log("countQuestion =", countQuestion);
    }, [countQuestion]);
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // 1. Tải danh sách môn học
            const coursesData = await courseService.getTeacherCourses();
            const fetchedCourses = coursesData || [];
            setCourses(fetchedCourses);

            if (fetchedCourses.length === 0) {
                setBanks([]);
                return;
            }

            // 2. Tải danh sách kho câu hỏi của từng môn học
            let allBanks: any[] = [];

            for (const course of fetchedCourses) {

                const courseBanks =
                    await questionBankApi.getQuestionBanksByCourse(
                        course.offeringId
                    );

                const mappedBanks = await Promise.all(
                    courseBanks.map(async (bank: any) => {

                        const count =
                            await questionApi.countQuestionsByBank(
                                bank.offeringId,
                                bank.id
                            );

                        return {
                            ...bank,
                            courseName:
                                course.courseName || course.title,
                            questionCount: count
                        };
                    })
                );

                allBanks.push(...mappedBanks);
            }





            const finalBanks = allBanks.map((bank: any, index: number) => ({
                ...bank,
                colorClass: colorClasses[index % colorClasses.length],

            }));

            setBanks(finalBanks);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            toast.error("Không thể tải danh sách dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLERS ---

    // Quản lý kho -> Chuyển hướng vào trong
    const handleManageBank = (bankId: string,offeringId:string) => {

        navigate(`/teacher/course/${offeringId}/questions/bank/${bankId}`);
    };

    // --- TẠO KHO ---
    const handleOpenCreateModal = () => {
        setBankName("");
        setSelectedCourseForBank("");
        setIsCreateModalOpen(true);
    };

    const handleSubmitCreateBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseForBank) {
            toast.error("Vui lòng chọn môn học cho kho câu hỏi!");
            return;
        }

        try {
            await questionBankApi.createQuestionBank({
                name: bankName,
                offeringId: selectedCourseForBank
            });
            toast.success(`Tạo thành công: ${bankName}`);
            setIsCreateModalOpen(false);
            loadData(); // Tải lại danh sách
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo kho câu hỏi");
        }
    };

    // --- SỬA KHO ---
    const handleOpenEditModal = (e: React.MouseEvent, bank: any) => {
        e.stopPropagation();
        setSelectedBankForAction(bank);
        setEditBankName(bank.name); // Gán tên cũ của kho vào ô input
        setIsEditModalOpen(true);
    };

    const handleSubmitEditBank = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await questionBankApi.updateQuestionBank(selectedBankForAction.id, {
                name: editBankName,
                offeringId: selectedBankForAction.offeringId // Vẫn giữ nguyên mã môn
            });

            toast.success(`Cập nhật thành công!`);
            setIsEditModalOpen(false);
            loadData(); // Tải lại danh sách
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        }
    };

    // --- XÓA KHO ---
    const handleOpenDeleteModal = (e: React.MouseEvent, bank: any) => {
        e.stopPropagation();
        setSelectedBankForAction(bank);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await questionBankApi.deleteQuestionBank(selectedBankForAction.id);
            toast.success("Đã xóa kho câu hỏi thành công!");
            setIsDeleteModalOpen(false);
            loadData(); // Tải lại danh sách
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa kho câu hỏi");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Ngân hàng câu hỏi
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-gray-500">
                            Quản lý và duyệt danh sách câu hỏi cho các học phần của bạn
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tạo kho câu hỏi
                    </button>
                </div>

                {/* DANH SÁCH KHO CÂU HỎI */}
                {banks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 py-16 px-4 text-center shadow-sm">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có kho câu hỏi nào</h3>
                        <p className="text-gray-500 text-sm max-w-sm">Hãy nhấn nút tạo mới ở góc trên bên phải để bắt đầu.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {banks.map((bank) => (
                            <div
                                key={bank.id}
                                onClick={() => handleManageBank(bank.id , bank.offeringId)}
                                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden"
                            >
                                {/* Thanh viền màu */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${bank.colorClass}`}></div>

                                <div className="p-5 flex flex-col flex-grow">
                                    {/* Icon & Badge */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${bank.colorClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                            {bank.questionCount} câu hỏi
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2" title={bank.name}>
                                            {bank.name}
                                        </h3>
                                        <div className="mt-2 flex flex-col gap-1.5">
                                            <span className="text-sm font-medium text-gray-600 truncate" title={bank.courseName}>
                                                Môn: {bank.courseName}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600 w-fit">
                                                Mã: {bank.offeringId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ACTIONS FOOTER (Quản lý, Sửa, Xóa) */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleManageBank(bank.id,bank.offeringId);
                                            }}
                                            className="flex-1 py-2 text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                        >
                                            Quản lý kho
                                        </button>

                                        {/* Nút Sửa */}
                                        <button
                                            onClick={(e) => handleOpenEditModal(e, bank)}
                                            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa tên kho"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {/* Nút Xóa */}
                                        <button
                                            onClick={(e) => handleOpenDeleteModal(e, bank)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa kho"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CÁC MODALS --- */}

            {/* 1. MODAL TẠO KHO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-gray-900">Tạo kho câu hỏi mới</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreateBank}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn môn học <span className="text-red-500">*</span></label>
                                <select required value={selectedCourseForBank} onChange={(e) => setSelectedCourseForBank(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                                    <option value="" disabled>-- Chọn học phần --</option>
                                    {courses.map(c => <option key={c.offeringId} value={c.offeringId}>{c.courseName || c.title} ({c.offeringId})</option>)}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên kho câu hỏi <span className="text-red-500">*</span></label>
                                <input type="text" required autoFocus value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ví dụ: Kho giữa kỳ Lập trình Web..." />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Xác nhận tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. MODAL CHỈNH SỬA KHO */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-gray-900">Cập nhật kho câu hỏi</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEditBank}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên kho mới <span className="text-red-500">*</span></label>
                                <input type="text" required autoFocus value={editBankName} onChange={(e) => setEditBankName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Nhập tên kho..." />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. MODAL XÁC NHẬN XÓA */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa kho câu hỏi?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Bạn có chắc chắn muốn xóa <strong className="text-gray-700">{selectedBankForAction?.name}</strong> không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                Hủy bỏ
                            </button>
                            <button onClick={handleConfirmDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm">
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}