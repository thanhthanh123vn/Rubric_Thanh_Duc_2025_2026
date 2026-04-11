import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, GraduationCap, X, AlertCircle, Loader2, Phone } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.tsx';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";

import sinhVienService from "@/pages/admin/api/sinhVienService.ts";
import type { StudentProfile } from "@/pages/admin/api/type.ts";

export default function StudentManagement() {
    // === STATES DANH SÁCH ===
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // === STATES MODAL & FORM ===
    const [deletingStudent, setDeletingStudent] = useState<StudentProfile | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Dữ liệu Form
    const [formData, setFormData] = useState<Partial<StudentProfile>>({
        studentId: '',
        fullName: '',
        className: '',
        gender: 'Nam',
        dateOfBirth: '',
        phoneNumber: '',
        address: ''
    });

    // === FETCH API ===
    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            try {
                const data = await sinhVienService.getAllSinhVien(currentPage, 10, searchQuery);
                setStudents(data.content);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error("Lỗi:", err);
                setError("Không thể tải danh sách sinh viên.");
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => fetchStudents(), 500);
        return () => clearTimeout(debounceTimer);
    }, [currentPage, searchQuery, refreshTrigger]);

    // === HANDLERS UI FORM ===
    const resetForm = () => {
        setFormData({ studentId: '', fullName: '', className: '', gender: 'Nam', dateOfBirth: '', phoneNumber: '', address: '' });
        setFormError(null);
    };

    const closeAllModals = () => {
        setIsCreateModalOpen(false);
        setEditingStudent(null);
        setDeletingStudent(null);
        resetForm();
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (student: StudentProfile) => {
        resetForm();
        setFormData({
            studentId: student.studentId,
            fullName: student.fullName || '',
            className: student.className || '',
            gender: student.gender || 'Nam',
            dateOfBirth: student.dateOfBirth || '',
            phoneNumber: student.phoneNumber || '',
            address: student.address || ''
        });
        setEditingStudent(student);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // === LƯU SINH VIÊN (THÊM / SỬA) ===
    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingStudent) {
                // Sửa hồ sơ
                await sinhVienService.updateProfile(editingStudent.studentId, formData);
                alert("Cập nhật hồ sơ thành công!");
            } else {
                // Thêm hồ sơ (Nếu API Backend cho phép tạo mới qua service này)
                // Lưu ý: Thường Sinh Viên phải có tài khoản User trước. Nếu backend bạn hỗ trợ tạo trực tiếp thì dùng dòng dưới:
                await sinhVienService.updateProfile(formData.studentId as string, formData);
                alert("Thêm hồ sơ thành công!");
            }
            closeAllModals();
            setRefreshTrigger(prev => prev + 1); // Load lại danh sách
        } catch (err: any) {
            setFormError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // === XÓA SINH VIÊN ===
    const confirmDelete = async () => {
        if (!deletingStudent) return;
        setIsSubmitting(true);
        try {
            await sinhVienService.deleteSinhVien(deletingStudent.studentId);
            setDeletingStudent(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert("Lỗi khi xóa sinh viên!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Hồ sơ Sinh viên</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý chi tiết thông tin cá nhân của sinh viên.</p>
                </div>
                {/* GẮN SỰ KIỆN NÚT THÊM */}
                <Button onClick={handleOpenCreate} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white">
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Thêm hồ sơ
                </Button>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo MSSV, Họ tên hoặc SĐT..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {/* BẢNG PC */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="w-full overflow-x-auto relative">
                    {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}

                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-slate-100">
                                <TableHead className="pl-6 w-[130px]">MSSV</TableHead>
                                <TableHead>Họ và tên</TableHead>
                                <TableHead>Lớp</TableHead>
                                <TableHead>Giới tính</TableHead>
                                <TableHead>Ngày sinh</TableHead>
                                <TableHead>Số điện thoại</TableHead>
                                <TableHead>Địa Chỉ</TableHead>
                                <TableHead className="text-right pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length > 0 ? students.map((sv) => (
                                <TableRow key={sv.studentId} className="hover:bg-blue-50 group">
                                    <TableCell className="font-semibold text-slate-900 pl-6">{sv.studentId}</TableCell>
                                    <TableCell className="font-bold text-slate-700">{sv.fullName || "Chưa cập nhật"}</TableCell>
                                    <TableCell className="text-slate-500">{sv.className || "---"}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${sv.gender === 'Nam' ? 'bg-blue-100 text-blue-700' : sv.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {sv.gender || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{sv.dateOfBirth || "---"}</TableCell>
                                    <TableCell className="text-slate-500">{sv.phoneNumber || "---"}</TableCell>
                                    <TableCell className="text-slate-500 max-w-[200px] truncate" title={sv.address}>{sv.address || "---"}</TableCell>
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            {/* GẮN SỰ KIỆN NÚT SỬA */}
                                            <Button onClick={() => handleOpenEdit(sv)} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                            <Button onClick={() => setDeletingStudent(sv)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-500">Không tìm thấy sinh viên.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CARD MOBILE */}
            <div className="md:hidden space-y-3 pb-4 relative">
                {isLoading && <div className="absolute inset-0 bg-white/60 z-10 flex justify-center pt-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                {students.map((sv) => (
                    <div key={sv.studentId} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                            {/* GẮN SỰ KIỆN NÚT SỬA */}
                            <button onClick={() => handleOpenEdit(sv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-blue-50/50"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingStudent(sv)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors bg-red-50/50"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <div className="flex items-center gap-3 pr-20">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner border border-slate-100">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{sv.fullName || "Chưa cập nhật"}</h3>
                                <p className="text-sm font-medium text-slate-500">{sv.studentId}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1 text-slate-600">
                            <div className="flex justify-between border-b border-slate-200/60 pb-1">
                                <span>Giới tính: <strong>{sv.gender || 'N/A'}</strong></span>
                                <span>Ngày sinh: <strong>{sv.dateOfBirth || '---'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Phone className="w-4 h-4 text-slate-400" /> <span>{sv.phoneNumber || 'Chưa cập nhật SĐT'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-between bg-white p-4 rounded-xl border border-slate-200/60 mt-4">
                    <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage(p => p - 1)}>Trang trước</Button>
                    <span className="text-sm font-medium text-slate-600 self-center">Trang {currentPage + 1} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage(p => p + 1)}>Trang sau</Button>
                </div>
            )}


            {/* ==================================================== */}
            {/* ======= MODAL TẠO & CẬP NHẬT HỒ SƠ SINH VIÊN ======= */}
            {/* ==================================================== */}
            {(isCreateModalOpen || editingStudent) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 animate-in fade-in" onClick={!isSubmitting ? closeAllModals : undefined}></div>

                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 relative z-10 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingStudent ? "Chỉnh sửa Hồ sơ" : "Thêm Hồ sơ Sinh viên"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Cập nhật chi tiết thông tin cá nhân</p>
                            </div>
                            <button onClick={closeAllModals} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSaveStudent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mã số sinh viên (MSSV) <span className="text-red-500">*</span></label>
                                    <Input
                                        required name="studentId" value={formData.studentId} onChange={handleInputChange}
                                        disabled={!!editingStudent} // Không cho sửa MSSV khi Edit
                                        placeholder="Ví dụ: 21130001"
                                        className={`h-11 rounded-xl ${editingStudent ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <Input required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nguyễn Văn A" className="h-11 rounded-xl bg-slate-50 focus:bg-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                                    <Input name="className" value={formData.className} onChange={handleInputChange} placeholder="VD: DH21DT" className="h-11 rounded-xl bg-slate-50 focus:bg-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                                    <select
                                        name="gender" value={formData.gender} onChange={handleInputChange}
                                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                                    <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="h-11 rounded-xl bg-slate-50 focus:bg-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                                    <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="0901234567" className="h-11 rounded-xl bg-slate-50 focus:bg-white" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ thường trú</label>
                                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ..." className="h-11 rounded-xl bg-slate-50 focus:bg-white" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 pb-safe">
                                <Button type="button" variant="outline" onClick={closeAllModals} className="flex-1 h-12 rounded-xl text-slate-600">Hủy bỏ</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Lưu hồ sơ"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* XÓA DIALOG (SHADCN) */}
            <AlertDialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
                <AlertDialogContent className="max-w-sm rounded-3xl">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><AlertCircle className="w-8 h-8 text-red-600" /></div>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Xóa hồ sơ sinh viên <strong className="text-slate-800">{deletingStudent?.studentId} - {deletingStudent?.fullName}</strong>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 mt-4">
                        <AlertDialogCancel disabled={isSubmitting} onClick={() => setDeletingStudent(null)} className="flex-1 h-12 rounded-xl mt-0">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đồng ý xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}