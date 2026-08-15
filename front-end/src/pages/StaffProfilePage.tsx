"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    User, Settings, BookOpen, MessageSquare,
    LogOut, Search, Bell, MapPin, Edit, Menu,
    Shield, Briefcase, Library, Building
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import authService, { uploadAvatar } from "@/user/api/authService.ts";

export default function StaffProfilePage() {
    const router = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userInfo, setUserInfo] = useState({
        username: 'GV001',
        fullName: 'Tên Cán Bộ',
        role: 'TEACHER',
        avatarUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        nationality: 'Việt Nam',
        cccd: '',
        gender: 'Nam',
        phoneNumber: '',
        address: '',
        department: 'Khoa Công nghệ Thông tin',
        academicTitle: 'Thạc sĩ'
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUserInfo(parsed);
                setAvatarUrl(parsed.avatarUrl || '');

                try {
                    const fullData = await authService.getProfileLecturer();

                    setFormData(prev => ({
                        ...prev,
                        fullName: fullData.fullName || '',
                        email: fullData.email || '',
                        dateOfBirth: fullData.dateOfBirth || '',
                        nationality: 'Việt Nam',
                        cccd: fullData.cccd || '',
                        gender: fullData.gender || 'Nam',
                        phoneNumber: fullData.phoneNumber || '',
                        address: fullData.address || '',
                        department: fullData.department || 'Khoa Công nghệ Thông tin',
                        academicTitle: fullData.academicTitle || 'Thạc sĩ'
                    }));

                    if (fullData.avatarUrl) {
                        setAvatarUrl(fullData.avatarUrl);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải thông tin cán bộ:", error);
                }
            } else {
                router('/login');
            }
        };

        fetchUserProfile();
    }, [router]);

    // ==========================================
    // PHÂN QUYỀN HIỂN THỊ (RBAC LOGIC)
    // ==========================================
    const role = userInfo.role;
    const isAdmin = role === 'ADMIN';
    const isDean = role === 'DEAN';
    const isHeadOfDept = role === 'HEAD_OF_DEPARTMENT';
    const isTeacherOrAbove = ['TEACHER', 'MAIN_LECTURER', 'HEAD_OF_DEPARTMENT', 'DEAN'].includes(role);

    // Cấu hình linh hoạt cho nút Workspace ở Mobile Navbar dựa trên quyền cao nhất
    const mobileWorkspace = useMemo(() => {
        if (isAdmin) return { path: "/admin/dashboard", label: "Quản trị", icon: Shield };
        if (isDean) return { path: "/dean", label: "Khoa", icon: Building };
        if (isHeadOfDept) return { path: "/department", label: "Bộ môn", icon: Library };
        if (isTeacherOrAbove) return { path: "/teacher", label: "Giảng dạy", icon: Briefcase };
        return { path: "/profile/result-grading", label: "Học tập", icon: BookOpen };
    }, [role]);

    const getInitial = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        return words[words.length - 1].charAt(0).toUpperCase();
    };

    const handleLogout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        await authService.logout();
        router('/login');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const payloadToUpdate = {
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth || null,
                gender: formData.gender,
                cccd: formData.cccd,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            };

            await authService.updateProfileLecturer(payloadToUpdate);

            const updatedUser = { ...userInfo, fullName: formData.fullName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserInfo(updatedUser);
            setIsEditing(false);
            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            const newAvatarUrl = await uploadAvatar(uploadData);
            setAvatarUrl(newAvatarUrl);

            const updatedUser = { ...userInfo, avatarUrl: newAvatarUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserInfo(updatedUser);
            alert("Đổi Avatar thành công!");
        } catch (error) {
            console.error("Lỗi khi đổi Avatar:", error);
            alert("Lỗi khi đổi Avatar. Kích thước ảnh có thể quá lớn.");
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Quản trị viên';
            case 'DEAN': return 'Trưởng Khoa';
            case 'HEAD_OF_DEPARTMENT': return 'Trưởng Bộ Môn';
            case 'MAIN_LECTURER': return 'Giảng viên chính';
            case 'TEACHER': return 'Giảng viên';
            default: return 'Cán bộ';
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-600 text-white';
            case 'DEAN': return 'bg-amber-600 text-white';
            case 'HEAD_OF_DEPARTMENT': return 'bg-blue-600 text-white';
            case 'MAIN_LECTURER': return 'bg-emerald-700 text-white';
            case 'TEACHER': return 'bg-emerald-500 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getRolePrefix = (role: string) => {
        switch (role) {
            case 'ADMIN': return '/admin';
            case 'DEAN': return '/dean';
            case 'HEAD_OF_DEPARTMENT': return '/department';
            case 'MAIN_LECTURER':
            case 'TEACHER': return '/teacher';
            default: return ''; // Dành cho Sinh viên (nếu dùng gốc là /profile)
        }
    };

    const rolePrefix = getRolePrefix(userInfo.role);
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f9f5] font-sans pb-20 lg:pb-0">
            {/* SIDEBAR TỰ ĐỘNG THÍCH ỨNG THEO ROLE */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-emerald-100 flex-col shadow-sm z-20 sticky top-0 h-screen">
                <div className="h-20 flex items-center px-6 border-b border-emerald-50">
                    <div className="text-emerald-700 font-extrabold text-3xl mr-3 tracking-tighter">NLU Rubric</div>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">

                    <Link
                        to={`${rolePrefix}/profile`}
                        className="flex items-center gap-4 px-4 py-3.5 bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20"
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                    </Link>

                    {/* Nút Cài đặt tài khoản / Đổi mật khẩu */}
                    <Link
                        to={`${rolePrefix}/profile/forgot-password`}
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                    </Link>

                    {/* MENU ĐỘNG THEO ROLE */}
                    {isAdmin && (
                        <Link to="/admin/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Quản lý hệ thống</span>
                        </Link>
                    )}

                    {isTeacherOrAbove && (
                        <Link to="/teacher" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                            <Briefcase className="w-5 h-5" />
                            <span className="font-medium">Quản lý giảng dạy</span>
                        </Link>
                    )}

                    {isHeadOfDept && (
                        <Link to="/department" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                            <Library className="w-5 h-5" />
                            <span className="font-medium">Quản lý bộ môn</span>
                        </Link>
                    )}

                    {isDean && (
                        <Link to="/dean" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                            <Building className="w-5 h-5" />
                            <span className="font-medium">Quản lý Khoa</span>
                        </Link>
                    )}
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
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                            ) : (
                                getInitial(formData.fullName)
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">Hồ sơ Cán bộ / Giảng viên</h1>

                    <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-emerald-50 flex flex-col md:flex-row items-center md:items-start lg:items-center gap-4 lg:gap-8 relative overflow-hidden mb-6 lg:mb-8 text-center md:text-left">
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-50/40 skew-x-12 transform origin-bottom hidden sm:block"></div>
                        <MapPin className="absolute right-4 top-4 lg:right-12 lg:top-12 w-6 h-6 lg:w-8 lg:h-8 text-emerald-200 opacity-50"/>

                        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-[#f3f9f5] border-4 border-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-4xl lg:text-5xl font-light z-10 shadow-sm relative shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                                ) : (
                                    getInitial(formData.fullName)
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-gray-50 z-20 transition-all cursor-pointer"
                                title="Đổi ảnh đại diện"
                            >
                                <Edit className="w-4 h-4"/>
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="z-10 w-full">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 uppercase tracking-wide">
                                {formData.academicTitle ? `${formData.academicTitle}. ` : ''}{formData.fullName}
                            </h2>
                            <div className="text-gray-500 mt-1.5 lg:mt-2 text-sm lg:text-[15px] flex flex-col sm:flex-row items-center md:items-start gap-1 sm:gap-2">
                                <span>Mã CBGV: <strong>{userInfo.username}</strong></span>
                                <span className="hidden sm:block">•</span>
                                <span>{formData.department}</span>
                            </div>
                            <span className={`inline-block mt-3 px-4 py-1.5 text-xs lg:text-sm font-medium rounded-full shadow-sm ${getRoleBadgeColor(userInfo.role)}`}>
                                {getRoleName(userInfo.role)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                        {/* BOX THÔNG TIN CƠ BẢN */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-sm border border-emerald-50">
                            <div className="flex justify-between items-center mb-5 lg:mb-6">
                                <h3 className="text-base lg:text-lg font-bold text-gray-800">Thông tin cơ bản</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-3 lg:px-4 py-1.5 lg:py-2 bg-emerald-700 text-white text-xs lg:text-sm rounded-lg hover:bg-emerald-800 transition-colors shadow-sm font-medium"
                                    >
                                        Chỉnh sửa
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs lg:text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs lg:text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                        >
                                            {isLoading ? "Đang lưu..." : "Lưu lại"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 lg:space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Họ và Tên</label>
                                        <input
                                            type="text" name="fullName"
                                            readOnly={!isEditing}
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Học hàm/Học vị</label>
                                        <input
                                            type="text" name="academicTitle"
                                            readOnly={true} // Học hàm học vị thường không cho sửa tự do
                                            value={formData.academicTitle}
                                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base bg-gray-100 border border-gray-200 text-gray-500 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Ngày sinh</label>
                                        <input
                                            type="date" name="dateOfBirth"
                                            readOnly={!isEditing}
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Quốc tịch</label>
                                        <input
                                            type="text" name="nationality"
                                            readOnly={!isEditing}
                                            value={formData.nationality}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">CCCD/CMND</label>
                                        <input
                                            type="text" name="cccd"
                                            readOnly={!isEditing}
                                            value={formData.cccd}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Giới tính</label>
                                        <select
                                            name="gender"
                                            disabled={!isEditing}
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800 appearance-none'}`}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOX THÔNG TIN LIÊN HỆ */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-sm border border-emerald-50">
                            <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-5 lg:mb-6">Thông tin liên hệ & Công tác</h3>
                            <div className="space-y-4 lg:space-y-5">
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Đơn vị công tác</label>
                                    <input
                                        type="text" name="department"
                                        readOnly={true}
                                        value={formData.department}
                                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base bg-gray-100 border border-gray-200 text-gray-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Email trường</label>
                                    <input
                                        type="email" name="email"
                                        readOnly={true}
                                        value={formData.email}
                                        placeholder="email@hcmuaf.edu.vn"
                                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base bg-gray-100 border border-gray-200 text-gray-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Số điện thoại</label>
                                    <input
                                        type="tel" name="phoneNumber"
                                        readOnly={!isEditing}
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Địa chỉ hiện tại</label>
                                    <textarea
                                        name="address" rows={2}
                                        readOnly={!isEditing}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none resize-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* NAVBAR MOBILE TỰ ĐỘNG THÍCH ỨNG THEO ROLE */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                {/* Nút Hồ sơ luôn Active ở trang này */}
                <a href="/profile" className="flex flex-col items-center justify-center w-full h-full text-emerald-700">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Hồ sơ</span>
                </a>

                {/* Nút Workspace động theo chức vụ */}
                <Link to={mobileWorkspace.path} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <mobileWorkspace.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">{mobileWorkspace.label}</span>
                </Link>

                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <MessageSquare className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Tin nhắn</span>
                </a>
                <Link to="/profile/settings" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <Settings className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Cài đặt</span>
                </Link>
            </nav>
        </div>
    );
}