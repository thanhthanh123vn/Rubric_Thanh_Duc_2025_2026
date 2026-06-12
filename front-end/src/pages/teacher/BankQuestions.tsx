import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Globe, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from "sonner";

import { questionApi } from "@/api/questionApi.ts";
import {
    questionBankApi,
    type QuestionBankRequest,
    type QuestionBankResponse,
} from "@/api/QuestionBankApi.ts";
import courseService from '../admin/api/courseService';

const colorClasses = [
    "from-emerald-500 to-teal-400",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-fuchsia-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
];

type BankItem = QuestionBankResponse & {
    questionCount: number;
    colorClass: string;
    owned: boolean;
};

const SHARE_PERMISSION_OPTIONS = [
    { key: 'VIEW', label: 'Xem', note: 'Được mở kho và xem câu hỏi.' },
    { key: 'EDIT', label: 'Chỉnh sửa', note: 'Được sửa thông tin và nội dung câu hỏi.' },
    { key: 'IMPORT', label: 'Import', note: 'Được import thêm câu hỏi vào kho.' },
];

export default function BankQuestions() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState<any[]>([]);
    const [myBanks, setMyBanks] = useState<BankItem[]>([]);
    const [publicBanks, setPublicBanks] = useState<BankItem[]>([]);
    const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedCourseForBank, setSelectedCourseForBank] = useState("");
    const [bankName, setBankName] = useState("");
    const [isPublicBank, setIsPublicBank] = useState(false);
    const [sharePermissions, setSharePermissions] = useState<string[]>(['VIEW']);

    const [editBankName, setEditBankName] = useState("");
    const [editBankVisibility, setEditBankVisibility] = useState(false);
    const [editSharePermissions, setEditSharePermissions] = useState<string[]>(['VIEW']);
    const [selectedBankForAction, setSelectedBankForAction] = useState<BankItem | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const enrichBanks = async (banks: QuestionBankResponse[], owned: boolean) => {
        const withCounts = await Promise.all(
            banks.map(async (bank, index) => {
                const questionCount = await questionApi.countQuestionsByBank(bank.offeringId, bank.id);
                return {
                    ...bank,
                    questionCount,
                    owned,
                    colorClass: colorClasses[index % colorClasses.length],
                };
            })
        );

        return withCounts;
    };

    const loadData = async () => {
        try {
            setIsLoading(true);

            const [coursesData, myBanksData, publicBanksData] = await Promise.all([
                courseService.getTeacherCourses(),
                questionBankApi.getMyQuestionBanks(),
                questionBankApi.getPublicQuestionBanks(),
            ]);

            setCourses(coursesData || []);
            setMyBanks(await enrichBanks(myBanksData || [], true));
            setPublicBanks(await enrichBanks(publicBanksData || [], false));
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            toast.error("Không thể tải danh sách kho câu hỏi.");
        } finally {
            setIsLoading(false);
        }
    };

    const displayedBanks = useMemo(() => {
        const source = activeTab === 'my' ? myBanks : publicBanks;
        const q = searchTerm.trim().toLowerCase();

        if (!q) return source;

        return source.filter((bank) =>
            [bank.name, bank.courseName, bank.offeringId]
                .filter(Boolean)
                .some((value) => value!.toString().toLowerCase().includes(q))
        );
    }, [activeTab, myBanks, publicBanks, searchTerm]);

    const handleManageBank = (bank: BankItem) => {
        if (bank.owned) {
            navigate(`/teacher/course/${bank.offeringId}/questions/bank/${bank.id}`);
            return;
        }

        navigate(`/teacher/questions/public/${bank.id}`);
    };

    const resetCreateForm = () => {
        setBankName("");
        setSelectedCourseForBank("");
        setIsPublicBank(false);
        setSharePermissions(['VIEW']);
    };

    const handleOpenCreateModal = () => {
        resetCreateForm();
        setIsCreateModalOpen(true);
    };

    const handleSubmitCreateBank = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCourseForBank) {
            toast.error("Vui lòng chọn môn học cho kho câu hỏi.");
            return;
        }

        try {
            const payload: QuestionBankRequest = {
                name: bankName,
                offeringId: selectedCourseForBank,
                isPublic: isPublicBank,
                sharePermissions: isPublicBank ? sharePermissions : [],
            };

            await questionBankApi.createQuestionBank(payload);
            toast.success(`Tạo thành công: ${bankName}`);
            setIsCreateModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo kho câu hỏi.");
        }
    };

    const handleOpenEditModal = (e: React.MouseEvent, bank: BankItem) => {
        e.stopPropagation();
        setSelectedBankForAction(bank);
        setEditBankName(bank.name);
        setEditBankVisibility(Boolean(bank.isPublic));
        setEditSharePermissions(bank.sharePermissions?.length ? bank.sharePermissions : ['VIEW']);
        setIsEditModalOpen(true);
    };

    const handleSubmitEditBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBankForAction) return;

        try {
            await questionBankApi.updateQuestionBank(selectedBankForAction.id, {
                name: editBankName,
                offeringId: selectedBankForAction.offeringId,
                isPublic: editBankVisibility,
                sharePermissions: editBankVisibility ? editSharePermissions : [],
            });

            toast.success("Cập nhật thành công!");
            setIsEditModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật kho câu hỏi.");
        }
    };

    const handleOpenDeleteModal = (e: React.MouseEvent, bank: BankItem) => {
        e.stopPropagation();
        setSelectedBankForAction(bank);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBankForAction) return;

        try {
            await questionBankApi.deleteQuestionBank(selectedBankForAction.id);
            toast.success("Đã xóa kho câu hỏi thành công!");
            setIsDeleteModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa kho câu hỏi.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                            Ngân hàng câu hỏi
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">
                            Tách riêng kho của bạn và kho công cộng để chia sẻ câu hỏi giữa các giảng viên.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo kho câu hỏi
                    </button>
                </div>

                <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('my')}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'my'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Lock className="h-4 w-4" />
                            Kho của tôi
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">{myBanks.length}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('public')}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                activeTab === 'public'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Globe className="h-4 w-4" />
                            Kho công cộng
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">{publicBanks.length}</span>
                        </button>
                    </div>

                    <div className="relative min-w-[280px]">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kho câu hỏi..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
                        <p className="font-medium text-slate-500">Đang tải danh sách kho câu hỏi...</p>
                    </div>
                ) : displayedBanks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            {activeTab === 'my' ? <Lock className="h-8 w-8 text-gray-400" /> : <Globe className="h-8 w-8 text-gray-400" />}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {activeTab === 'my' ? 'Chưa có kho câu hỏi cá nhân' : 'Chưa có kho công cộng nào'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {activeTab === 'my'
                                ? 'Hãy tạo kho đầu tiên của bạn hoặc bật chia sẻ để dùng chung với giảng viên khác.'
                                : 'Các kho được giảng viên khác chia sẻ sẽ xuất hiện tại đây.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {displayedBanks.map((bank) => (
                            <div
                                key={bank.id}
                                onClick={() => handleManageBank(bank)}
                                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
                            >
                                <div className={`h-1.5 w-full bg-gradient-to-r ${bank.colorClass}`}></div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-md ${bank.colorClass}`}>
                                            <BookOpen className="h-6 w-6" />
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                {bank.questionCount} câu hỏi
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                bank.isPublic
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {bank.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                                {bank.isPublic ? 'Công cộng' : 'Cá nhân'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                            {bank.name}
                                        </h3>
                                        <div className="mt-2 space-y-1.5">
                                            <p className="truncate text-sm font-medium text-gray-600" title={bank.courseName}>
                                                Môn: {bank.courseName || 'Chưa cập nhật'}
                                            </p>
                                            <span className="inline-flex w-fit items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                Mã: {bank.offeringId}
                                            </span>
                                            {bank.isPublic && bank.sharePermissions?.length ? (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {bank.sharePermissions.map((permission) => (
                                                        <span
                                                            key={`${bank.id}-${permission}`}
                                                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                                                        >
                                                            {getPermissionLabel(permission)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleManageBank(bank);
                                            }}
                                            className="flex-1 rounded-lg bg-blue-50 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                                        >
                                            Quản lý kho
                                        </button>

                                        {bank.owned ? (
                                            <>
                                                <button
                                                    onClick={(e) => handleOpenEditModal(e, bank)}
                                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500"
                                                    title="Chỉnh sửa kho"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleOpenDeleteModal(e, bank)}
                                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                    title="Xóa kho"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isCreateModalOpen ? (
                <ModalShell title="Tạo kho câu hỏi mới" onClose={() => setIsCreateModalOpen(false)}>
                    <form onSubmit={handleSubmitCreateBank} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Chọn môn học</label>
                            <select
                                required
                                value={selectedCourseForBank}
                                onChange={(e) => setSelectedCourseForBank(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" disabled>-- Chọn học phần --</option>
                                {courses.map((course) => (
                                    <option key={course.offeringId} value={course.offeringId}>
                                        {course.courseName} ({course.offeringId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên kho câu hỏi</label>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Ví dụ: Kho giữa kỳ Lập trình Web"
                            />
                        </div>

                        <VisibilityField
                            isPublic={isPublicBank}
                            onChange={setIsPublicBank}
                            permissions={sharePermissions}
                            onTogglePermission={(permission) =>
                                setSharePermissions((current) => togglePermission(current, permission))
                            }
                        />

                        <ModalActions
                            onCancel={() => setIsCreateModalOpen(false)}
                            confirmLabel="Xác nhận tạo"
                        />
                    </form>
                </ModalShell>
            ) : null}

            {isEditModalOpen && selectedBankForAction ? (
                <ModalShell title="Cập nhật kho câu hỏi" onClose={() => setIsEditModalOpen(false)}>
                    <form onSubmit={handleSubmitEditBank} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên kho mới</label>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={editBankName}
                                onChange={(e) => setEditBankName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Nhập tên kho..."
                            />
                        </div>

                        <VisibilityField
                            isPublic={editBankVisibility}
                            onChange={setEditBankVisibility}
                            permissions={editSharePermissions}
                            onTogglePermission={(permission) =>
                                setEditSharePermissions((current) => togglePermission(current, permission))
                            }
                        />

                        <ModalActions
                            onCancel={() => setIsEditModalOpen(false)}
                            confirmLabel="Lưu thay đổi"
                        />
                    </form>
                </ModalShell>
            ) : null}

            {isDeleteModalOpen && selectedBankForAction ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Xóa kho câu hỏi?</h3>
                        <p className="mb-6 mt-2 text-sm text-gray-500">
                            Bạn có chắc chắn muốn xóa <strong className="text-gray-700">{selectedBankForAction.name}</strong> không?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function VisibilityField({
    isPublic,
    onChange,
    permissions,
    onTogglePermission,
}: {
    isPublic: boolean;
    onChange: (value: boolean) => void;
    permissions: string[];
    onTogglePermission: (permission: string) => void;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Phạm vi kho</p>
            <p className="mt-1 text-sm text-slate-500">
                Chọn công cộng nếu muốn chia sẻ kho này cho các giảng viên khác.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                        !isPublic
                            ? 'border-slate-300 bg-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                >
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Lock className="h-4 w-4" />
                        Kho của tôi
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Chỉ bạn nhìn thấy và quản lý.</p>
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                        isPublic
                            ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                >
                    <div className="flex items-center gap-2 font-semibold text-emerald-700">
                        <Globe className="h-4 w-4" />
                        Kho công cộng
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Giảng viên khác có thể vào dùng chung.</p>
                </button>
            </div>

            {isPublic ? (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-800">Quyền của giảng viên khác</p>
                    <div className="space-y-2">
                        {SHARE_PERMISSION_OPTIONS.map((option) => {
                            const checked = permissions.includes(option.key);
                            return (
                                <label
                                    key={option.key}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition ${
                                        checked
                                            ? 'border-emerald-300 bg-white'
                                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => onTogglePermission(option.key)}
                                        className="mt-1 h-4 w-4"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                                        <p className="text-xs text-slate-500">{option.note}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function ModalShell({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        x
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ModalActions({
    onCancel,
    confirmLabel,
}: {
    onCancel: () => void;
    confirmLabel: string;
}) {
    return (
        <div className="flex justify-end gap-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
                Hủy
            </button>
            <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                {confirmLabel}
            </button>
        </div>
    );
}

function togglePermission(current: string[], permission: string) {
    if (permission === 'VIEW') {
        if (current.includes('VIEW')) {
            return current;
        }
        return ['VIEW', ...current];
    }

    const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];

    return next.includes('VIEW') ? next : ['VIEW', ...next];
}

function getPermissionLabel(permission: string) {
    return SHARE_PERMISSION_OPTIONS.find((item) => item.key === permission)?.label || permission;
}
