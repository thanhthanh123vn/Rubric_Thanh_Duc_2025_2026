"use client"
import React, { useState } from 'react';
import {
    User, Settings, BookOpen, MessageSquare, Calendar,
    LogOut, Search, Bell, Menu, Lock, Save, Loader2
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {userService} from "@/api/userApi.ts";

export default function AccountSettings() {
    const router = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Lấy thông tin user từ localStorage để hiển thị Avatar trên header giống ProfilePage
    const storedUser = localStorage.getItem('user');
    const userInfo = storedUser ? JSON.parse(storedUser) : {
        studentId: '22130260',
        fullName: 'Nguyễn Văn Thạnh',
        avatarUrl: ''
    };

    // State quản lý form đổi mật khẩu
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State quản lý cài đặt thông báo & quyền riêng tư
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        publicProfile: true,
        twoFactorAuth: false
    });

    const getInitial = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        return words[words.length - 1].charAt(0).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router('/login');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            await userService.changePassword(passwordForm);

            toast.success("Đổi mật khẩu thành công!");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
        }

    };

    const handleSaveGeneralSettings = () => {
        toast.success("Đã lưu các thiết lập hệ thống thành công!");
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f9f5] font-sans pb-20 lg:pb-0">
            {/* SIDEBAR */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-emerald-100 flex-col shadow-sm z-20 sticky top-0 h-screen">
                <div className="h-20 flex items-center px-6 border-b border-emerald-50">
                    <div className="text-emerald-700 font-extrabold text-3xl mr-3 tracking-tighter">NLU Rubric</div>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <Link
                        to={`/profile`}
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                    </Link>
                    <a href="/profile/settings" className="flex items-center gap-4 px-4 py-3.5 bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                    </a>
                    <Link
                        to={`/profile/result-grading`}
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Kết quả học tập</span>
                    </Link>
                    {/*<a href="#" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">*/}
                    {/*    <Calendar className="w-5 h-5" />*/}
                    {/*    <span className="font-medium">Lịch học</span>*/}
                    {/*</a>*/}
                </nav>
                <div className="p-6 border-t border-emerald-50">
                    <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-1 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
                <header className="h-16 lg:h-20 bg-white flex items-center justify-between px-4 lg:px-10 border-b border-emerald-50 sticky top-0 z-30 shadow-sm lg:shadow-none">
                    <div className="flex lg:hidden items-center gap-2">
                        <div className="text-emerald-700 font-extrabold text-2xl tracking-tighter">NLU Rubric</div>
                    </div>
                    <div className="hidden sm:block relative w-64 lg:w-[400px]">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Tìm kiếm..." className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-transparent focus:border-emerald-200 focus:bg-white rounded-full text-sm outline-none transition-all" />
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="sm:hidden text-gray-500 hover:text-emerald-700">
                            <Search className="w-6 h-6"/>
                        </button>
                        <button className="relative text-gray-500 hover:text-emerald-700">
                            <Bell className="w-6 h-6"/>
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 cursor-pointer overflow-hidden">
                            {userInfo.avatarUrl ? (
                                <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                            ) : (
                                getInitial(userInfo.fullName)
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">Cài đặt tài khoản</h1>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                        {/* KHỐI 1: BẢO MẬT & MẬT KHẨU */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-sm border border-emerald-50 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-5 lg:mb-6">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base lg:text-lg font-bold text-gray-800">Bảo mật & Mật khẩu</h3>
                                        <p className="text-xs text-gray-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSavePassword} className="space-y-4 lg:space-y-5">
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Mật khẩu hiện tại</label>
                                        <Input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Mật khẩu mới</label>
                                        <Input
                                            type="password"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Xác nhận mật khẩu mới</label>
                                        <Input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-sm lg:text-base font-medium shadow-sm transition-colors"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cập nhật mật khẩu"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* KHỐI 2: TÙY CHỌN THÔNG BÁO & HỆ THỐNG */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-sm border border-emerald-50 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-5 lg:mb-6">
                                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base lg:text-lg font-bold text-gray-800">Tùy chọn thông báo</h3>
                                        <p className="text-xs text-gray-500">Quản lý cách hệ thống gửi thông báo cho bạn</p>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:space-y-5 mt-4">
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Nhận thông báo qua Email</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Gửi thông báo điểm số, lịch học về email trường</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={() => handleToggleSetting('emailNotifications')}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Thông báo đẩy (Push)</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Hiển thị thông báo trực tiếp trên trình duyệt</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.pushNotifications}
                                            onChange={() => handleToggleSetting('pushNotifications')}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Công khai hồ sơ cá nhân</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Cho phép các sinh viên khác tìm thấy bạn</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.publicProfile}
                                            onChange={() => handleToggleSetting('publicProfile')}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={handleSaveGeneralSettings}
                                    className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-xl h-11 text-sm lg:text-base font-medium shadow-sm transition-colors"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Lưu thiết lập chung
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* NAVBAR MOBILE */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <Link to="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Hồ sơ</span>
                </Link>
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <BookOpen className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Học tập</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <MessageSquare className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Tin nhắn</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <Menu className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Menu</span>
                </a>
            </nav>
        </div>
    );
}