import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Lock, Shield, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import userService from "@/pages/admin/api/userService.ts";

export default function EditUser() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();

    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });


    useEffect(() => {
        const fetchUserDetail = async () => {
            if (!userId) return;
            try {
                const userDetail = await userService.getUserById(userId);
                setFormData({
                    username: userDetail.username || '',
                    email: userDetail.email || '',
                    password: '',
                    role: userDetail.role || 'STUDENT'
                });
            } catch (err) {
                console.error("Lỗi tải thông tin:", err);
                setError("Không thể tải thông tin người dùng. Vui lòng thử lại!");
            } finally {
                setIsFetching(false);
            }
        };

        fetchUserDetail();
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {

            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password;
            }

            await userService.updateUser(userId, payload);
            alert("Cập nhật thông tin thành công!");
            navigate('/admin/users');

        } catch (err: any) {
            console.error("Lỗi cập nhật:", err);
            setError(err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin.");
        } finally {
            setIsLoading(false);
        }
    };

    // Màn hình chờ tải dữ liệu ban đầu
    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Đang tải thông tin người dùng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Chỉnh sửa Người dùng</h2>
                    <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin tài khoản: <strong className="text-blue-600">{userId}</strong></p>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã số (ID)</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        disabled
                                        value={userId}
                                        className="pl-9 h-11 bg-slate-100 border-slate-200 text-slate-500 rounded-xl cursor-not-allowed font-medium"
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">Mã số không thể thay đổi.</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Bỏ trống nếu không muốn đổi"
                                        minLength={6}
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Vai trò hệ thống <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full pl-9 pr-4 h-11 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="STUDENT">Sinh viên (STUDENT)</option>
                                <option value="TEACHER">Giảng viên (TEACHER)</option>
                                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                            </select>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="h-11 px-6 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Cập nhật</>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}