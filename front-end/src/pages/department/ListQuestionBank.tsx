import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, CheckCircle2, Circle, Edit, Globe, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { questionApi, type Question } from '@/api/questionApi.ts';
import { questionBankApi, type QuestionBankResponse } from '@/api/QuestionBankApi.ts';
import { getAllClo } from '@/features/rubric/rubricApi.ts';
import DepartmentHeadLayout from "@/pages/department/DepartmentHeadLayout.tsx";

interface AnswerOption {
    content: string;
    isCorrect: boolean;
}

interface Clo {
    cloId: string;
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
}

function getPermissionLabel(permission: string) {
    if (permission === 'VIEW') return 'Xem';
    if (permission === 'EDIT') return 'Chỉnh sửa';
    if (permission === 'IMPORT') return 'Import';
    return permission;
}

export default function ListQuestionBank() {
    const { bankId } = useParams();

    const [bank, setBank] = useState<QuestionBankResponse | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [cloItems, setCloItems] = useState<Clo[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        cloId: [] as string[],
        topicId: '',
        difficulty: 'MEDIUM',
        type: 'ESSAY',
        content: ''
    });
    const [options, setOptions] = useState<AnswerOption[]>([
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
    ]);

    const permissions = bank?.sharePermissions || [];
    const canEdit = permissions.includes('EDIT');
    const canImport = permissions.includes('IMPORT');

    const loadData = async () => {
        if (!bankId) return;

        try {
            setIsLoading(true);
            const [bankData, questionData] = await Promise.all([
                questionBankApi.getQuestionBankById(bankId),
                questionApi.getQuestionsByBankId(bankId),
            ]);

            setBank(bankData);
            setQuestions(questionData || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải kho công cộng.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadClos = async () => {
        try {
            const response = await getAllClo();
            setCloItems(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách chuẩn đầu ra.');
        }
    };

    useEffect(() => {
        loadData();
        loadClos();
    }, [bankId]);

    useEffect(() => {
        if (!isModalOpen) {
            setEditingQuestionId(null);
            setFormData({ cloId: [], topicId: '', difficulty: 'MEDIUM', type: 'ESSAY', content: '' });
            setOptions([
                { content: '', isCorrect: true },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
            ]);
        }
    }, [isModalOpen]);

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            const matchSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDifficulty = filterDifficulty ? question.difficulty === filterDifficulty : true;
            return matchSearch && matchDifficulty;
        });
    }, [questions, searchTerm, filterDifficulty]);

    const handleEditClick = (question: Question) => {
        if (!canEdit) {
            toast.error('Kho này không cấp quyền chỉnh sửa.');
            return;
        }

        setEditingQuestionId(question.id);
        setFormData({
            cloId: question.cloIds?.map((clo: any) => clo.cloId || clo) || [],
            topicId: '',
            difficulty: question.difficulty,
            type: question.type,
            content: question.content
        });

        if (question.type === 'MULTIPLE_CHOICE' && question.options) {
            const newOptions = Array(4).fill({ content: '', isCorrect: false }).map((defaultOpt, idx) => {
                return question.options[idx]
                    ? { content: question.options[idx].content, isCorrect: question.options[idx].isCorrect }
                    : defaultOpt;
            });
            setOptions(newOptions);
        }

        setIsModalOpen(true);
    };

    const handleDeleteClick = async (questionId: string) => {
        if (!canEdit || !bankId) {
            toast.error('Kho này không cấp quyền xóa câu hỏi.');
            return;
        }

        const isConfirm = window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?');
        if (!isConfirm) return;

        try {
            await questionApi.deleteQuestionFromBank(bankId, questionId);
            toast.success('Đã xóa câu hỏi thành công!');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Xóa câu hỏi thất bại.');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canImport || !bank?.offeringId || !bankId) {
            toast.error('Kho này không cấp quyền import.');
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            toast.error('Vui lòng chọn file Excel.');
            return;
        }

        try {
            setIsUploading(true);
            await questionApi.importQuestionsToBank(bank.offeringId, file, bankId);
            toast.success('Import thành công!');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi import file.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveQuestion = async () => {
        if (!canEdit || !bank?.offeringId || !bankId) {
            toast.error('Kho này không cấp quyền chỉnh sửa.');
            return;
        }

        if (!formData.content || formData.cloId.length === 0) {
            toast.error('Vui lòng nhập nội dung câu hỏi và chọn chuẩn đầu ra.');
            return;
        }

        const payload = {
            content: formData.content,
            cloIds: formData.cloId,
            topicId: formData.topicId,
            difficulty: formData.difficulty,
            type: formData.type,
            options: formData.type === 'MULTIPLE_CHOICE' ? options : [],
        };

        try {
            if (editingQuestionId) {
                await questionApi.updateQuestion(editingQuestionId, payload);
                toast.success('Đã cập nhật câu hỏi thành công!');
            } else {
                await questionApi.createQuestionToBank(bank.offeringId, bankId, payload);
                toast.success('Đã tạo câu hỏi mới thành công!');
            }

            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Không thể lưu câu hỏi.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Globe className="h-5 w-5" />
                            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Kho công cộng</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{bank?.name || 'Đang tải...'}</h1>
                        <p className="text-sm text-slate-500">
                            Môn: {bank?.courseName || 'Chưa cập nhật'} • Mã học phần: {bank?.offeringId || '--'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                            <BookOpen className="mr-1 h-3.5 w-3.5" />
                            {questions.length} câu hỏi
                        </Badge>
                        {(bank?.sharePermissions || []).map((permission) => (
                            <Badge key={permission} variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                                {getPermissionLabel(permission)}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>


            <Card className="rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col flex-1">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-4 bg-white">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm nội dung câu hỏi..."
                                className="pl-10 h-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-slate-700 sm:min-w-[180px]"
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                        >
                            <option value="">Tất cả độ khó</option>
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {canImport ? (
                            <>
                                <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                    <Upload className="h-4 w-4" />
                                    {isUploading ? 'Đang xử lý...' : 'Import vào kho'}
                                </button>
                            </>
                        ) : null}

                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm câu hỏi
                            </button>
                        ) : null}

                        {!canEdit && !canImport ? (
                            <p className="text-sm text-slate-500">Kho này chỉ có quyền xem.</p>
                        ) : null}
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <div className="min-w-[980px] w-full align-middle">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="w-[60px] text-center font-semibold text-slate-600">STT</TableHead>
                                    <TableHead className="font-semibold text-slate-600">Nội dung câu hỏi</TableHead>
                                    <TableHead className="w-[140px] font-semibold text-slate-600">Kiểu</TableHead>
                                    <TableHead className="w-[120px] font-semibold text-slate-600 text-center">Độ khó</TableHead>
                                    <TableHead className="w-[150px] font-semibold text-slate-600">CĐR</TableHead>
                                    <TableHead className="w-[120px] font-semibold text-slate-600 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[220px] text-center text-slate-500">
                                            Đang tải dữ liệu...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredQuestions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[220px] text-center text-slate-500">
                                            Không có câu hỏi nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredQuestions.map((question, index) => (
                                        <TableRow key={question.id} className="border-slate-100">
                                            <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                                            <TableCell>
                                                <p className="line-clamp-2 text-slate-700 font-medium max-w-[420px]" title={question.content}>
                                                    {question.content}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={question.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}
                                                    className={`font-medium shadow-none ${
                                                        question.type === 'MULTIPLE_CHOICE'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}
                                                >
                                                    {question.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            question.difficulty === 'EASY'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : question.difficulty === 'MEDIUM'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {question.difficulty === 'EASY' ? 'Dễ' : question.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                        </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {question.cloIds && question.cloIds.length > 0 ? question.cloIds.map((clo: any) => (
                                                        <Badge key={clo.id || clo} variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-medium">
                                                            {clo.cloCode || clo}
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-xs text-slate-400 italic">--</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canEdit ? (
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditClick(question)}
                                                            className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(question.id)}
                                                            className="rounded-md p-2 text-rose-600 transition-colors hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Chỉ xem</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-[95vw] max-w-[820px] overflow-hidden rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingQuestionId ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Môn học</label>
                                    <Input
                                        disabled
                                        value={`${bank?.courseName || 'Học phần'} (Mã: ${bank?.offeringId || '--'})`}
                                        className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Chuẩn đầu ra</label>
                                    <div className="max-h-40 overflow-y-auto rounded-md border border-slate-300 p-3 space-y-2">
                                        {cloItems.map((clo) => (
                                            <label key={clo.cloId} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.cloId.includes(clo.cloId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, cloId: [...formData.cloId, clo.cloId] });
                                                        } else {
                                                            setFormData({ ...formData, cloId: formData.cloId.filter((id) => id !== clo.cloId) });
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm">
                          <span className="font-medium">{clo.cloCode}</span>
                                                    {clo.description ? <span className="ml-1 text-slate-500">- {clo.description}</span> : null}
                        </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Chủ đề</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        value={formData.topicId}
                                        onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                    >
                                        <option value="">-- Chọn chủ đề --</option>
                                        <option value="T1">JSP, Servlet</option>
                                        <option value="T2">Spring Boot</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Độ khó</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="EASY">Dễ</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HARD">Khó</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Kiểu câu hỏi</label>
                                <select
                                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-1/2"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="ESSAY">Tự luận</option>
                                    <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nội dung câu hỏi</label>
                                <textarea
                                    className="min-h-[120px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            {formData.type === 'MULTIPLE_CHOICE' ? (
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700">Các đáp án</label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {['A', 'B', 'C', 'D'].map((label, index) => (
                                            <div
                                                key={label}
                                                className={`flex items-start gap-3 rounded-lg border p-3 ${
                                                    options[index].isCorrect ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white'
                                                }`}
                                            >
                                                <div
                                                    className="mt-0.5 cursor-pointer text-slate-400 hover:text-blue-500"
                                                    onClick={() => {
                                                        const newOptions = options.map((option, optionIndex) => ({
                                                            ...option,
                                                            isCorrect: optionIndex === index,
                                                        }));
                                                        setOptions(newOptions);
                                                    }}
                                                >
                                                    {options[index].isCorrect ? <CheckCircle2 className="h-5 w-5 text-blue-600" /> : <Circle className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-xs font-semibold text-slate-500">Đáp án {label}</span>
                                                    <Input
                                                        className="h-8 border-slate-200 bg-transparent px-2 text-sm"
                                                        value={options[index].content}
                                                        onChange={(e) => {
                                                            const newOptions = [...options];
                                                            newOptions[index].content = e.target.value;
                                                            setOptions(newOptions);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveQuestion}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                {editingQuestionId ? 'Lưu thay đổi' : 'Lưu câu hỏi mới'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
