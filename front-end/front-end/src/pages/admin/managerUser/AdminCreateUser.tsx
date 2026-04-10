import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Lock, Shield, Hash } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import userService from "@/pages/admin/api/userService.ts";

export default function CreateUser() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const [formData, setFormData] = useState({
        userId: '',
        username: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {

            await userService.createUser(formData);


            alert(" Tạo người dùng thành công!");
            navigate('/admin/users/list-users'); 

        } catch (err: any) {
            console.error("Lỗi khi tạo người dùng:", err);
            
            const errorMsg = err.response?.data?.message || "Đã xảy ra lỗi khi tạo người dùng. Có thể ID/Email đã tồn tại.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Thêm Người dùng mới</h2>
                    <p className="text-sm text-slate-500 mt-1">Điền đầy đủ thông tin bên dưới để cấp phát tài khoản.</p>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                    {/* Báo lỗi nếu có */}
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã số (ID) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        name="userId"
                                        value={formData.userId}
                                        onChange={handleInputChange}
                                        placeholder="VD: 21130001 hoặc GV001"
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
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
                                        placeholder="Nhập tên đăng nhập"
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
                                        placeholder="email@hcmuaf.edu.vn"
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Tối thiểu 6 ký tự"
                                        minLength={6}
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dòng riêng cho Select Vai trò */}
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

                    {/* Dòng phân cách */}
                    <hr className="border-slate-100" />

                    {/* BUTTON LƯU */}
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
                                <span>Đang xử lý...</span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Lưu người dùng
                                </>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}