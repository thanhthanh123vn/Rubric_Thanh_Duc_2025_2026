import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertCircle, Loader2, Building2, User } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.tsx';
import {facultyService} from "@/api/facultyService.ts";


export interface Faculty {
    facultyId: string;
    facultyName: string;
    deanName: string;
    email: string;
}

export default function FacultyManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Faculty>>({
        facultyId: '',
        facultyName: '',
        deanName: '',
        email: '',
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await facultyService.getAll();
            setFaculties(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khoa:", error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);



    const closeAllModals = () => {
        setEditingFaculty(null);
        setIsCreateModalOpen(false);
        setDeletingFaculty(null);
        setFormData({ facultyId: '', facultyName: '', deanName: '', email: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingFaculty) {
                await facultyService.update(formData.facultyId!, formData);
                alert("Cập nhật thành công!");
            } else {
                await facultyService.create(formData);
                alert("Thêm thành công!");
            }
            loadData(); // Tải lại danh sách
            closeAllModals();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingFaculty) return;
        setIsSubmitting(true);
        try {
            await facultyService.delete(deletingFaculty.facultyId);
            alert("Đã xóa thành công!");
            loadData();
            closeAllModals();
        } catch (error) {
            alert("Không thể xóa, vui lòng kiểm tra lại dữ liệu liên quan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Danh sách Khoa</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý các Khoa trực thuộc nhà trường.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white">
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Thêm Khoa
                </Button>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo mã hoặc tên Khoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="pl-6 w-[120px]">Mã Khoa</TableHead>
                            <TableHead>Tên Khoa</TableHead>
                            <TableHead>Trưởng Khoa</TableHead>
                            <TableHead>Email Liên hệ</TableHead>
                            <TableHead className="text-right pr-6">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {faculties.map((fac) => (
                            <TableRow key={fac.facultyId} className="hover:bg-blue-50 transition-colors group">
                                <TableCell className="font-semibold text-slate-900 pl-6">{fac.facultyId}</TableCell>
                                <TableCell className="font-bold text-slate-700">{fac.facultyName}</TableCell>
                                <TableCell className="text-slate-600">{fac.deanName || "---"}</TableCell>
                                <TableCell className="text-slate-500">{fac.email || "---"}</TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => { setEditingFaculty(fac); setFormData(fac); }} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                        <Button onClick={() => setDeletingFaculty(fac)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-3 pb-4 relative">
                {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex justify-center pt-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                {faculties.map((fac) => (
                    <div key={fac.facultyId} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => { setEditingFaculty(fac); setFormData(fac); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-blue-50/50">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingFaculty(fac)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors bg-red-50/50">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pr-20">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner border border-slate-100">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{fac.facultyName}</h3>
                                <p className="text-sm font-medium text-slate-500">{fac.facultyId}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1 text-slate-600">
                            <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate pr-2">{fac.deanName || "Chưa bổ nhiệm"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 gap-2 text-slate-500">
                                <span className="truncate">{fac.email}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL THÊM/SỬA KHOA */}
            {(isCreateModalOpen || editingFaculty) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 animate-in fade-in" onClick={!isSubmitting ? closeAllModals : undefined}></div>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 relative z-10 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingFaculty ? "Sửa thông tin Khoa" : "Thêm Khoa mới"}</h3>
                            <button onClick={closeAllModals} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Khoa <span className="text-red-500">*</span></label>
                                <Input required name="facultyId" value={formData.facultyId} onChange={handleInputChange} disabled={!!editingFaculty} className="h-11 rounded-xl bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Khoa <span className="text-red-500">*</span></label>
                                <Input required name="facultyName" value={formData.facultyName} onChange={handleInputChange} className="h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trưởng Khoa</label>
                                <Input name="deanName" value={formData.deanName} onChange={handleInputChange} placeholder="VD: TS. Nguyễn Văn A" className="h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Liên hệ</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} className="h-11 rounded-xl" />
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

            {/* MODAL XÓA */}
            {deletingFaculty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 text-sm mb-6">Xóa khoa <strong className="text-slate-800">{deletingFaculty.facultyName}</strong>? Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={closeAllModals} disabled={isSubmitting} className="flex-1 h-12 rounded-xl">Hủy</Button>
                            <Button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đồng ý xóa"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}