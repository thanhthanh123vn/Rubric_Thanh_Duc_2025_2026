import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, GraduationCap, X, AlertCircle, Loader2, Phone, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.tsx';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";

import sinhVienService from "@/pages/admin/api/sinhVienService.ts";
import type { StudentProfile } from "@/pages/admin/api/type.ts";
import {enrollmentService} from "@/api/enrollmentApi.ts";

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

    // STATE CHO CHỨC NĂNG IN BẢNG ĐIỂM
    const [viewingTranscriptStudent, setViewingTranscriptStudent] = useState<StudentProfile | null>(null);

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

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await sinhVienService.getAllSinhVien(
                currentPage,
                10,
                searchQuery
            );
            setStudents(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [currentPage, searchQuery, refreshTrigger]);

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

    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingStudent) {
                await sinhVienService.updateProfile(formData);
                await fetchStudents();
                alert("Cập nhật hồ sơ thành công!");
            } else {
                await sinhVienService.createStudent(formData);
                await fetchStudents();
                alert("Thêm hồ sơ thành công!");
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

    const handlePrintTrigger = () => {
        window.print();
    };


    const [transcriptData, setTranscriptData] = useState<any[]>([]);
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

    useEffect(() => {
        const fetchStudentTranscript = async () => {
            if (!viewingTranscriptStudent) return;
            setIsTranscriptLoading(true);
            try {

                const data = await enrollmentService.getStudentGrading(viewingTranscriptStudent.studentId);
                setTranscriptData(data);
            } catch (error) {
                console.error("Lỗi khi tải bảng điểm:", error);
                setTranscriptData([]);
            } finally {
                setIsTranscriptLoading(false);
            }
        };

        fetchStudentTranscript();
    }, [viewingTranscriptStudent]);


    if (viewingTranscriptStudent) {
        const totalCredits = transcriptData.reduce((sum, item) => sum + (item.credits || 3), 0);
        const avgScore = totalCredits > 0
            ? (transcriptData.reduce((sum, item) => sum + (item.totalScore * (item.credits || 3)), 0) / totalCredits).toFixed(2)
            : "0.00";

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Thanh công cụ - Sẽ tự động biến mất khi in nhờ class print:hidden */}
                <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <Button variant="outline" onClick={() => setViewingTranscriptStudent(null)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                    </Button>
                    <Button
                        onClick={() => window.print()}
                        disabled={isTranscriptLoading || transcriptData.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Printer className="w-4 h-4 mr-2" /> In ngay
                    </Button>
                </div>

                {/* KHUNG BẢN IN: Chỉ vùng này được in ra nhờ id="printable-transcript" */}
                <div id="printable-transcript" className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto relative">
                    {isTranscriptLoading && (
                        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center print:hidden">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}

                    {/* Nội dung bảng điểm A4 */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase">Bộ Giáo dục và Đào tạo</p>
                            <p className="text-base font-bold uppercase mt-1">Trường Đại học Nông Lâm TP.HCM</p>
                            <div className="w-24 h-[1px] bg-slate-800 mx-auto mt-2"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
                            <p className="text-sm font-bold mt-1">Độc lập - Tự do - Hạnh phúc</p>
                            <div className="w-32 h-[1px] bg-slate-800 mx-auto mt-2"></div>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase text-slate-800">Bảng điểm học tập sinh viên</h1>
                        <p className="text-sm text-slate-600 mt-2">Năm học: 2025 - 2026</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm">
                        <div className="flex"><span className="w-32 font-semibold">Họ và tên:</span> <span className="font-bold uppercase">{viewingTranscriptStudent.fullName}</span></div>
                        <div className="flex"><span className="w-32 font-semibold">Mã sinh viên:</span> <span>{viewingTranscriptStudent.studentId}</span></div>
                        <div className="flex"><span className="w-32 font-semibold">Lớp:</span> <span>{viewingTranscriptStudent.className || '---'}</span></div>
                        <div className="flex"><span className="w-32 font-semibold">Số điện thoại:</span> <span>{viewingTranscriptStudent.phoneNumber || '---'}</span></div>
                    </div>

                    <table className="w-full text-sm border-collapse mb-8 border border-slate-800">
                        <thead>
                        <tr className="bg-slate-100">
                            <th className="border border-slate-800 py-2 px-3 text-center w-12">STT</th>
                            <th className="border border-slate-800 py-2 px-3 text-left">Tên học phần</th>
                            <th className="border border-slate-800 py-2 px-3 text-center w-20">Tín chỉ</th>
                            <th className="border border-slate-800 py-2 px-3 text-center w-24">Tổng kết (H10)</th>
                            <th className="border border-slate-800 py-2 px-3 text-center w-24">Điểm chữ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transcriptData.length > 0 ? (
                            transcriptData.map((item, index) => (
                                <tr key={item.enrollmentId || index}>
                                    <td className="border border-slate-800 py-2 px-3 text-center">{index + 1}</td>
                                    <td className="border border-slate-800 py-2 px-3 font-medium">{item.courseName}</td>
                                    <td className="border border-slate-800 py-2 px-3 text-center">{item.credits || 3}</td>
                                    <td className="border border-slate-800 py-2 px-3 text-center font-semibold">{item.totalScore?.toFixed(1)}</td>
                                    <td className="border border-slate-800 py-2 px-3 text-center font-semibold">{item.letterGrade}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="border border-slate-800 py-6 text-center text-slate-500">
                                    Chưa có dữ liệu điểm cho sinh viên này.
                                </td>
                            </tr>
                        )}
                        </tbody>
                        {transcriptData.length > 0 && (
                            <tfoot>
                            <tr className="font-bold bg-slate-50">
                                <td colSpan={2} className="border border-slate-800 py-3 px-3 text-right">Tổng tín chỉ / ĐTB:</td>
                                <td className="border border-slate-800 py-3 px-3 text-center">{totalCredits}</td>
                                <td className="border border-slate-800 py-3 px-3 text-center text-blue-700">{avgScore}</td>
                                <td className="border border-slate-800 py-3 px-3 text-center"></td>
                            </tr>
                            </tfoot>
                        )}
                    </table>

                    <div className="flex justify-between text-sm mt-12 px-8">
                        <div className="text-center">
                            <p className="font-semibold mb-20">Người lập bảng</p>
                            <p className="text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div className="text-center">
                            <p className="italic mb-1">TP. Hồ Chí Minh, ngày ... tháng ... năm 2026</p>
                            <p className="font-bold uppercase mb-20">Phòng Đào Tạo</p>
                            <p className="text-slate-400 italic">(Ký, đóng dấu)</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Hồ sơ Sinh viên</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý chi tiết thông tin cá nhân của sinh viên.</p>
                </div>
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
                                            {/* NÚT IN BẢNG ĐIỂM */}
                                            <Button
                                                onClick={() => setViewingTranscriptStudent(sv)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                title="In bảng điểm"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </Button>
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
                            {/* NÚT IN BẢNG ĐIỂM MOBILE */}
                            <button onClick={() => setViewingTranscriptStudent(sv)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors bg-emerald-50/50" title="In bảng điểm"><Printer className="w-4 h-4" /></button>
                            <button onClick={() => handleOpenEdit(sv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-blue-50/50"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingStudent(sv)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors bg-red-50/50"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <div className="flex items-center gap-3 pr-28">
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

            {/* MODAL TẠO & CẬP NHẬT HỒ SƠ SINH VIÊN */}
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
                                        disabled={!!editingStudent}
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