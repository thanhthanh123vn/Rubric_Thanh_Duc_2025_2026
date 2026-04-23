import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Shield, X, AlertCircle, Save, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button.tsx';
import { Input } from '../../../components/ui/input.tsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table.tsx';
import type { User } from "@/pages/admin/api/type.ts";
import userService from "@/pages/admin/api/userService.ts";

export default function AdminManagement() {
    // === STATES QUẢN LÝ DANH SÁCH ===
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // === STATES QUẢN LÝ MODAL (DIALOG) ===
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // States cho Form và xử lý
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Đổi mặc định role thành ADMIN
    const [formData, setFormData] = useState({
        Id: '',
        username: '',
        email: '',
        password: '',
        role: 'ADMIN'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const data = await userService.getAdmins(currentPage, 10, searchQuery);
                const cleanedUsers = data.content.map((u: User) => ({
                    ...u,
                    userId: u.userId ? String(u.userId).trim() : 'N/A'
                }));
                setUsers(cleanedUsers);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error("Lỗi khi tải danh sách người dùng:", err);

            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [currentPage, searchQuery, refreshTrigger]);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const resetForm = () => {
        // Đổi mặc định role thành ADMIN
        setFormData({ Id: '', username: '', email: '', password: '', role: 'ADMIN' });
        setFormError(null);
    };

    const closeAllModals = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
        setDeletingUser(null);
        resetForm();
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        resetForm();
        setFormData({
            Id: user.userId,
            username: user.username,
            email: user.email,
            password: '',
            role: user.role
        });
        setEditingUser(user);
    };

    const handleOpenDelete = (user: User) => {
        setDeletingUser(user);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await userService.updateUser(editingUser.userId, payload);
                alert("Cập nhật thành công!");
            } else {
                await userService.createUser(formData);
                alert("Tạo tài khoản Admin thành công!");
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
        if (!deletingUser) return;
        setIsSubmitting(true);
        try {
            await userService.deleteUser(deletingUser.userId);
            alert("Xóa thành công!");
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err:any) {
            alert("Lỗi khi xóa người dùng!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'TEACHER': return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[11px] font-semibold rounded-md uppercase">Giảng viên</span>;
            case 'ADMIN': return <span className="px-2 py-1 bg-red-100 text-red-700 text-[11px] font-semibold rounded-md uppercase">Admin</span>;
            default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-md uppercase">Sinh viên</span>;
        }
    };

    if (isLoading && users.length === 0) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">

            {/* HEADER TƯƠNG THÍCH MOBILE */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Hồ Sơ Quản Trị Viên</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý danh sách các tài khoản có quyền Admin.</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white"
                >
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Tạo Admin mới
                </Button>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo ID, Tên hoặc Email..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {/* BẢNG MÁY TÍNH */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="w-full overflow-x-auto relative">
                    {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}

                    <div className="min-w-[800px] inline-block w-full align-middle">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-slate-100">
                                    <TableHead className="w-[150px] text-slate-500 font-medium pl-6">Mã (ID)</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Tên đăng nhập</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Email</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Vai trò</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Đăng nhập</TableHead>
                                    <TableHead className="text-right text-slate-500 font-medium pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? users.map((user) => (
                                    <TableRow key={user.userId} className="border-slate-100 hover:bg-blue-50 transition-colors group">
                                        <TableCell className="font-semibold text-slate-900 pl-6">{user.userId}</TableCell>
                                        <TableCell className="font-medium text-slate-700">{user.username}</TableCell>
                                        <TableCell className="text-slate-500">{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-md tracking-wider ${user.authProvider === 'GOOGLE' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-600'}`}>
                                                {user.authProvider}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <Button onClick={() => handleOpenEdit(user)} variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                                <Button onClick={() => handleOpenDelete(user)} variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            Không tìm thấy Quản trị viên nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* GIAO DIỆN MOBILE */}
            <div className="md:hidden space-y-3 pb-4 relative">
                {isLoading && <div className="absolute inset-0 bg-white/50 z-10 flex justify-center pt-10 "><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
                {users.length > 0 ? users.map((user) => (
                    <div key={user.userId} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-blue-50/50">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingUser(user)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors bg-red-50/50">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pr-16">
                            <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner border border-slate-100 bg-red-100 text-red-600">
                                <Shield className="w-6 h-6" /> {/* Đổi icon thành Khiên cho Admin */}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{user.username}</h3>
                                <p className="text-sm font-medium text-slate-500">{user.userId}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60">
                                {getRoleBadge(user.role)}
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  {user.authProvider}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200/60 font-medium">
                        Không tìm thấy Quản trị viên.
                    </div>
                )}
            </div>

            {/* THANH PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mt-4">
                    <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="text-slate-600 hover:bg-slate-100 h-10">
                        Trang trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button variant="outline" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="text-slate-600 hover:bg-slate-100 h-10">
                        Trang sau
                    </Button>
                </div>
            )}

            {/* MODAL TẠO / SỬA ADMIN */}
            {(isCreateModalOpen || editingUser) && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40  animate-in fade-in">
                    <div className="bg-white w-full sm:w-[500px] sm:rounded-2xl rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingUser ? "Chỉnh sửa Admin" : "Tạo Admin mới"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
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

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã số (ID) <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    name="Id"
                                    value={formData.Id}
                                    onChange={handleInputChange}
                                    disabled={!!editingUser}
                                    placeholder="Ví dụ: ADM001"
                                    className={`h-12 rounded-xl ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                                <Input
                                    required
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên hiển thị / username"
                                    className="h-12 bg-slate-50 rounded-xl focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <Input
                                    required type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="admin@hcmuaf.edu.vn"
                                    className="h-12 bg-slate-50 rounded-xl focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu {editingUser ? '(Bỏ trống nếu không đổi)' : <span className="text-red-500">*</span>}</label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingUser}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="h-12 bg-slate-50 rounded-xl focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò hệ thống <span className="text-red-500">*</span></label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none font-medium"
                                >
                                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                                    <option value="TEACHER">Giảng viên (TEACHER)</option>
                                    <option value="STUDENT">Sinh viên (STUDENT)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 pb-safe">
                                <Button type="button" variant="outline" onClick={closeAllModals} className="flex-1 h-12 rounded-xl text-slate-600">
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                    {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang lưu...</> : <><Save className="w-5 h-5 mr-2" /> Lưu lại</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ALERT XÁC NHẬN XÓA */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  animate-in fade-in p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản Admin <strong className="text-slate-800">{deletingUser.userId}</strong> không? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex gap-3">
                            <Button variant="outline" disabled={isSubmitting} onClick={closeAllModals} className="flex-1 h-12 rounded-xl font-medium text-slate-600">
                                Hủy bỏ
                            </Button>
                            <Button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm font-medium">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đồng ý xóa"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}