import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, BookOpen, X, AlertCircle, Save, Loader2, AlignLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table.tsx';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";
import type { Course } from "@/pages/admin/api/type.ts";
import courseService from "@/pages/admin/api/courseService.ts";

export default function CourseManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Course>>({
        courseId: '',
        courseName: '',
        credits: 3,
        description: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                // Đảm bảo backend trả về dạng Page<Course>
                const data = await courseService.getAllCourses(currentPage, 10, searchQuery);
                setCourses(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách khóa học.");
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchCourses();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [currentPage, searchQuery, refreshTrigger]);

    const resetForm = () => {
        setFormData({ courseId: '', courseName: '', credits: 3, description: '', status: 'ACTIVE' });
        setFormError(null);
    };

    const closeAllModals = () => {
        setIsCreateModalOpen(false);
        setEditingCourse(null);
        setDeletingCourse(null);
        resetForm();
    };

    const handleOpenEdit = (course: Course) => {
        resetForm();
        setFormData(course);
        setEditingCourse(course);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingCourse) {
                await courseService.updateCourse(editingCourse.courseId, formData);
                alert("Cập nhật thành công!");
            } else {
                await courseService.createCourse(formData);
                alert("Tạo khóa học thành công!");
            }
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setFormError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingCourse) return;
        setIsSubmitting(true);
        try {
            await courseService.deleteCourse(deletingCourse.courseId);
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err:any) {
            alert("Lỗi khi xóa khóa học!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'ACTIVE') return <span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] font-semibold rounded-md uppercase">Đang mở</span>;
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md uppercase">Đã đóng</span>;
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Quản lý Khóa học</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý danh sách các môn học / khóa học trong hệ thống.</p>
                </div>
                <Button onClick={() => {resetForm(); setIsCreateModalOpen(true);}} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white">
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Tạo khóa học
                </Button>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo mã hoặc tên khóa học..."
                        value={searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(0);}}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {error && <div className="text-red-500 p-4 text-center">{error}</div>}

            {/* BẢNG DESKTOP */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="w-full overflow-x-auto relative">
                    {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-slate-100">
                                <TableHead className="w-[120px] text-slate-500 pl-6">Mã môn</TableHead>
                                <TableHead className="text-slate-500">Tên khóa học</TableHead>
                                <TableHead className="text-slate-500">Số tín chỉ</TableHead>
                                <TableHead className="text-slate-500">Trạng thái</TableHead>
                                <TableHead className="text-right text-slate-500 pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length > 0 ? courses.map((course) => (
                                <TableRow key={course.courseId} className="border-slate-100 hover:bg-blue-50 transition-colors group">
                                    <TableCell className="font-semibold text-slate-900 pl-6">{course.courseId}</TableCell>
                                    <TableCell className="font-medium text-slate-700">{course.courseName}</TableCell>
                                    <TableCell className="text-slate-500">{course.credits}</TableCell>
                                    <TableCell>{getStatusBadge(course.status || 'ACTIVE')}</TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button onClick={() => handleOpenEdit(course)} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                            <Button onClick={() => setDeletingCourse(course)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">Không tìm thấy khóa học nào.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CARD MOBILE */}
            <div className="md:hidden space-y-3 pb-4 relative">
                {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex justify-center pt-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                {courses.length > 0 ? courses.map((course) => (
                    <div key={course.courseId} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => handleOpenEdit(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full bg-blue-50/50"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingCourse(course)} className="p-2 text-red-500 hover:bg-red-50 rounded-full bg-red-50/50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-3 pr-16">
                            <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner border border-slate-100 bg-blue-100 text-blue-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{course.courseName}</h3>
                                <p className="text-sm font-medium text-slate-500">{course.courseId}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium">Số tín chỉ: {course.credits}</span>
                                {getStatusBadge(course.status || 'ACTIVE')}
                            </div>
                            {course.description && (
                                <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2 text-slate-500 text-xs">
                                    <AlignLeft className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{course.description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200/60 font-medium">Không tìm thấy khóa học.</div>
                )}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mt-4">
                    <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage(p => p - 1)}>Trước</Button>
                    <span className="text-sm font-medium text-slate-600">Trang {currentPage + 1} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage(p => p + 1)}>Sau</Button>
                </div>
            )}

            {/* MODAL CREATE / EDIT */}
            {(isCreateModalOpen || editingCourse) && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-in fade-in">
                    <div className="bg-white w-full sm:w-[500px] sm:rounded-2xl rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{editingCourse ? "Chỉnh sửa Khóa học" : "Tạo Khóa học mới"}</h3>
                            </div>
                            <button onClick={closeAllModals} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        {formError && <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">{formError}</div>}

                        <form onSubmit={handleSaveCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã khóa học <span className="text-red-500">*</span></label>
                                <Input required name="courseId" value={formData.courseId} onChange={handleInputChange} disabled={!!editingCourse} placeholder="VD: COMP101" className={`h-11 rounded-xl ${editingCourse ? 'bg-slate-100' : 'bg-slate-50'}`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên khóa học <span className="text-red-500">*</span></label>
                                <Input required name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="VD: Lập trình Web" className="h-11 bg-slate-50 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Số tín chỉ</label>
                                    <Input type="number" min="1" max="10" required name="credits" value={formData.credits} onChange={handleInputChange} className="h-11 bg-slate-50 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none">
                                        <option value="ACTIVE">Đang mở (ACTIVE)</option>
                                        <option value="INACTIVE">Đã đóng (INACTIVE)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 resize-none" placeholder="Nhập mô tả khóa học..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeAllModals} className="flex-1 h-12 rounded-xl">Hủy bỏ</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Lưu lại"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ALERT XÓA */}
            <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
                <AlertDialogContent className="max-w-sm rounded-3xl">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><AlertCircle className="w-8 h-8 text-red-600" /></div>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Xóa khóa học <strong className="text-slate-800">{deletingCourse?.courseName}</strong>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 mt-4">
                        <AlertDialogCancel disabled={isSubmitting} onClick={closeAllModals} className="flex-1 h-12 rounded-xl mt-0">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đồng ý xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}