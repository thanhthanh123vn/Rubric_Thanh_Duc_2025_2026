import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { assessmentService, type Assessment } from '../api/assessmentService.ts';

export default function AssessmentManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Assessment | null>(null);
    const [deletingItem, setDeletingItem] = useState<Assessment | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Assessment>>({
        title: '',
        type: 'EXAM',
        weight: 0,
        courseId: '',
        description: ''
    });

    useEffect(() => {
        const fetchAssessments = async () => {
            setIsLoading(true);
            try {
                const data = await assessmentService.getAllAssessments(currentPage, 10, searchQuery);
                setAssessments(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => fetchAssessments(), 500);
        return () => clearTimeout(debounceTimer);
    }, [currentPage, searchQuery, refreshTrigger]);

    const resetForm = () => {
        setFormData({ title: '', type: 'EXAM', weight: 0, courseId: '', description: '' });
        setFormError(null);
    };

    const closeAllModals = () => {
        setIsCreateModalOpen(false);
        setEditingItem(null);
        setDeletingItem(null);
        resetForm();
    };

    const handleOpenEdit = (item: Assessment) => {
        resetForm();
        setFormData(item);
        setEditingItem(item);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingItem) {
                await assessmentService.updateAssessment(editingItem.assessmentId, formData);
                alert("Cập nhật thành công!");
            } else {
                await assessmentService.createAssessment(formData);
                alert("Tạo đề thi/đánh giá thành công!");
            }
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setFormError(err.response?.data?.message || "Vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;
        setIsSubmitting(true);
        try {
            await assessmentService.deleteAssessment(deletingItem.assessmentId);
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Lỗi khi xóa!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { label: string, color: string }> = {
            'EXAM': { label: 'Thi Cuối Kỳ', color: 'bg-red-100 text-red-700' },
            'QUIZ': { label: 'Kiểm Tra', color: 'bg-blue-100 text-blue-700' },
            'ASSIGNMENT': { label: 'Bài Tập', color: 'bg-green-100 text-green-700' },
            'PROJECT': { label: 'Đồ Án', color: 'bg-purple-100 text-purple-700' },
        };
        const config = types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2 py-1 text-[11px] font-semibold rounded-md uppercase ${config.color}`}>{config.label}</span>;
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0 p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Quản lý Đề Thi / Bài Tập</h2>
                    <p className="text-sm text-slate-500 mt-1">Quản lý ngân hàng đề và các bài kiểm tra của môn học.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 h-10 rounded-lg text-white">
                    <Plus className="w-4 h-4 mr-2" /> Tạo Đề thi mới
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm tên đề, môn học..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                        className="pl-9 h-10 bg-slate-50 rounded-xl"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="pl-6 w-[250px]">Tên Đề / Bài Tập</TableHead>
                            <TableHead>Mã Môn Học</TableHead>
                            <TableHead>Loại Hình</TableHead>
                            <TableHead>Trọng số (%)</TableHead>
                            <TableHead className="text-right pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments.length > 0 ? assessments.map((item) => (
                            <TableRow key={item.assessmentId} className="hover:bg-blue-50 group">
                                <TableCell className="font-medium text-slate-900 pl-6 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" /> {item.title}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-700">{item.courseId}</TableCell>
                                <TableCell>{getTypeBadge(item.type)}</TableCell>
                                <TableCell className="text-slate-600 font-medium">{item.weight}%</TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => handleOpenEdit(item)} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                        <Button onClick={() => setDeletingItem(item)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">Chưa có dữ liệu.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mt-4">
                    <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage(p => p - 1)}>Trước</Button>
                    <span className="text-sm font-medium text-slate-600">Trang {currentPage + 1} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage(p => p + 1)}>Sau</Button>
                </div>
            )}

            {/* MODAL TẠO / SỬA */}
            {(isCreateModalOpen || editingItem) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in">
                    <div className="bg-white w-full sm:w-[500px] sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingItem ? "Sửa Đề Thi" : "Tạo Đề Thi Mới"}</h3>
                            <button onClick={closeAllModals} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        {formError && <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">{formError}</div>}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Đề / Bài tập <span className="text-red-500">*</span></label>
                                <Input required name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: Giữa kỳ môn Web..." className="h-11 bg-slate-50 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Môn Học <span className="text-red-500">*</span></label>
                                <Input required name="courseId" value={formData.courseId} onChange={handleInputChange} placeholder="VD: COMP101" className="h-11 bg-slate-50 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại Đánh Giá</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <option value="EXAM">Thi Cuối Kỳ (EXAM)</option>
                                        <option value="QUIZ">Kiểm Tra (QUIZ)</option>
                                        <option value="ASSIGNMENT">Bài Tập (ASSIGNMENT)</option>
                                        <option value="PROJECT">Đồ Án (PROJECT)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                                    <Input type="number" min="1" max="100" required name="weight" value={formData.weight} onChange={handleInputChange} className="h-11 bg-slate-50 rounded-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú / Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none" placeholder="Mô tả về bài kiểm tra này..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeAllModals} className="flex-1 h-12 rounded-xl">Hủy</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Lưu lại"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ALERT XÓA */}
            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent className="max-w-sm rounded-3xl">
                    <AlertDialogHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><AlertCircle className="w-8 h-8 text-red-600" /></div>
                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc muốn xóa đề thi <strong>{deletingItem?.title}</strong> không?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 mt-4">
                        <AlertDialogCancel disabled={isSubmitting} onClick={closeAllModals} className="flex-1 h-12 rounded-xl mt-0">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}