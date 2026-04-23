import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertCircle, Loader2, Briefcase, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.tsx';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";

import lecturerService from "@/pages/admin/api/lecturerService.ts";
import type { LecturerProfile } from "@/pages/admin/api/type.ts";

export default function LecturerManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const [deletingLecturer, setDeletingLecturer] = useState<LecturerProfile | null>(null);
    const [editingLecturer, setEditingLecturer] = useState<LecturerProfile | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<LecturerProfile>>({
        lecturerId: '',
        fullName: '',
        email: '',
        department: '',
        academicTitle: '',
    });

    useEffect(() => {
        const fetchLecturers = async () => {
            setIsLoading(true);
            try {
                const data = await lecturerService.getAllLecturers(currentPage, 10, searchQuery);
                setLecturers(data.content);
                setTotalPages(data.totalPages);
            } catch (err) {

            } finally {
                setIsLoading(false);
            }
        };
        const timer = setTimeout(fetchLecturers, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, refreshTrigger]);

    const closeAllModals = () => {
        setEditingLecturer(null);
        setIsCreateModalOpen(false);
        setDeletingLecturer(null);
        setFormData({ lecturerId: '', fullName: '', email: '', department: '', academicTitle: '' });
    };

    const handleOpenEdit = (lecturer: LecturerProfile) => {
        setFormData(lecturer);
        setEditingLecturer(lecturer);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingLecturer) {
                await lecturerService.updateLecturer(formData.lecturerId!, formData);
                alert("Cập nhật thành công!");
            } else {
                // await lecturerService.createLecturer(formData); // Nếu API có hàm này
                alert("Đã gửi yêu cầu thêm giảng viên!");
            }
            closeAllModals();
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert("Có lỗi xảy ra!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingLecturer) return;
        setIsSubmitting(true);
        try {
            await lecturerService.deleteLecturer(deletingLecturer.lecturerId);
            closeAllModals();
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            alert("Lỗi khi xóa!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Quản lý Giảng viên</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý danh sách và hồ sơ Giảng viên.</p>
                </div>
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white">
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Thêm giảng viên
                </Button>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo tên hoặc mã giảng viên..."
                        value={searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(0);}}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {error && <div className="text-red-500 p-4 text-center">{error}</div>}


            {/* BẢNG CHO DESKTOP (PC)*/}

            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}

                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="pl-6 w-[150px]">Mã GV</TableHead>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Khoa/Bộ môn</TableHead>
                            <TableHead>Học hàm/Học vị</TableHead>
                            <TableHead className="text-right pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lecturers.length > 0 ? lecturers.map((gv) => (
                            <TableRow key={gv.lecturerId} className="hover:bg-blue-50 transition-colors group">
                                <TableCell className="font-semibold text-slate-900 pl-6">{gv.lecturerId}</TableCell>
                                <TableCell className="font-bold text-slate-700">{gv.fullName || "---"}</TableCell>
                                <TableCell className="text-slate-500">{gv.email || "---"}</TableCell>
                                <TableCell className="text-slate-500">{gv.department || "---"}</TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                                        {gv.academicTitle || "Giảng viên"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => handleOpenEdit(gv)} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                        <Button onClick={() => setDeletingLecturer(gv)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500">Không tìm thấy giảng viên.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>


            {/* CARD CHO ĐIỆN THOẠI (MOBILE)  */}

            <div className="md:hidden space-y-3 pb-4 relative">
                {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex justify-center pt-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}

                {lecturers.length > 0 ? lecturers.map((gv) => (
                    <div key={gv.lecturerId} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        {/* Nút Thao tác nổi ở góc phải */}
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => handleOpenEdit(gv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-blue-50/50">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingLecturer(gv)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors bg-red-50/50">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Avatar & Tên */}
                        <div className="flex items-center gap-3 pr-20">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner border border-slate-100">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{gv.fullName || "---"}</h3>
                                <p className="text-sm font-medium text-slate-500">{gv.lecturerId}</p>
                            </div>
                        </div>

                        {/* Chi tiết phụ */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1 text-slate-600">
                            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate pr-2">{gv.email || "---"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 gap-2">
                                <span className="truncate font-medium text-slate-700">{gv.department || "Khoa CNTT"}</span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[11px] font-semibold rounded-md whitespace-nowrap shrink-0">
                                    {gv.academicTitle || "Giảng viên"}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200/60 font-medium">
                        Không tìm thấy giảng viên nào.
                    </div>
                )}
            </div>

            {/* --- PHÂN TRANG --- */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mt-4">
                    <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage(p => p - 1)} className="h-10">Trước</Button>
                    <span className="text-sm font-medium text-slate-600">Trang {currentPage + 1} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage(p => p + 1)} className="h-10">Sau</Button>
                </div>
            )}


            {(editingLecturer || isCreateModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 animate-in fade-in" onClick={!isSubmitting ? closeAllModals : undefined}></div>

                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 relative z-10 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingLecturer ? "Sửa Giảng viên" : "Thêm Giảng viên"}
                                </h3>
                            </div>
                            <button onClick={closeAllModals} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Giảng viên <span className="text-red-500">*</span></label>
                                <Input required name="lecturerId" value={formData.lecturerId} onChange={handleInputChange} disabled={!!editingLecturer} className="h-11 rounded-xl bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                <Input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Khoa / Bộ môn</label>
                                <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="Ví dụ: Khoa Công Nghệ Thông Tin" className="h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Học hàm / Học vị</label>
                                <Input name="academicTitle" value={formData.academicTitle} onChange={handleInputChange} placeholder="Ví dụ: ThS, TS, PGS.TS" className="h-11 rounded-xl" />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={closeAllModals} className="flex-1 h-12 rounded-xl text-slate-600">Hủy</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Lưu lại"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            <AlertDialog open={!!deletingLecturer} onOpenChange={(open) => !open && setDeletingLecturer(null)}>
                <AlertDialogContent className="max-w-sm rounded-3xl">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Xóa hồ sơ giảng viên <strong className="text-slate-800">{deletingLecturer?.fullName}</strong>? Hành động này không thể hoàn tác.
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