"use client"
import {getProfile, updateProfile} from '../api/authService';
import React, { useState, useEffect } from 'react';
import {
    User, Settings, BookOpen, MessageSquare, Calendar,
    LogOut, Search, Bell, MapPin, Edit, Menu
} from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function ProfilePage() {
    const router = useNavigate();
    const [userInfo, setUserInfo] = useState({
        studentId: '22130260',
        fullName: 'Nguyễn Văn Thạnh',
        role: 'STUDENT'
    });

    // 1. Thêm các State quản lý form cập nhật
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        nationality: 'Việt Nam',
        cccd: '',
        gender: 'Nam',
        phoneNumber: '',
        address: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUserInfo(parsed);

                try {

                    const fullData = await getProfile();


                    setFormData({
                        fullName: fullData.fullName || '',
                        dateOfBirth: fullData.dateOfBirth || '',
                        nationality: fullData.nationality || 'Việt Nam',
                        cccd: fullData.cccd || '',
                        gender: fullData.gender || 'Nam',
                        phoneNumber: fullData.phoneNumber || '',
                        address: fullData.address || ''
                    });
                } catch (error) {
                    console.error("Lỗi khi tải thông tin sinh viên:", error);
                }
            } else {
                router('/login');
            }
        };

        fetchUserProfile();
    }, [router]);

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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Hàm Xử lý Lưu dữ liệu
    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {

            await updateProfile(userInfo.studentId, formData);


            const updatedUser = { ...userInfo, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserInfo(updatedUser);

            setIsEditing(false); // Tắt chế độ Edit
            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f9f5] font-sans pb-20 lg:pb-0">
            {/* SIDEBAR */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-emerald-100 flex-col shadow-sm z-20 sticky top-0 h-screen">
                <div className="h-20 flex items-center px-6 border-b border-emerald-50">
                    <div className="text-emerald-700 font-extrabold text-3xl mr-3 tracking-tighter">NLU Rubric</div>
                    {/*<div className="h-8 w-px bg-emerald-200 mr-3"></div>*/}
                    {/*<span className="text-[11px] font-bold text-emerald-800 leading-tight tracking-wider">*/}
                    {/*    TRƯỜNG ĐẠI HỌC<br/>NÔNG LÂM TP.HCM*/}
                    {/*</span>*/}
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <a href="#" className="flex items-center gap-4 px-4 py-3.5 bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                    </a>
                    <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                    </a>
                    <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Kết quả học tập</span>
                    </a>
                    <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Lịch học</span>
                    </a>
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
                            <Search className="w-6 h-6" />
                        </button>
                        <button className="relative text-gray-500 hover:text-emerald-700">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 cursor-pointer">
                            {getInitial(formData.fullName)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">Hồ sơ Quản lý</h1>

                    <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-emerald-50 flex flex-col md:flex-row items-center md:items-start lg:items-center gap-4 lg:gap-8 relative overflow-hidden mb-6 lg:mb-8 text-center md:text-left">
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-50/40 skew-x-12 transform origin-bottom hidden sm:block"></div>
                        <MapPin className="absolute right-4 top-4 lg:right-12 lg:top-12 w-6 h-6 lg:w-8 lg:h-8 text-emerald-200 opacity-50" />
                        <div className="w-24 h-24 lg:w-28 lg:h-28 bg-[#f3f9f5] border-4 border-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-4xl lg:text-5xl font-light z-10 shadow-sm relative shrink-0">
                            {getInitial(formData.fullName)}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute bottom-0 right-0 w-7 h-7 lg:w-8 lg:h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-600"
                            >
                                <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            </button>
                        </div>
                        <div className="z-10 w-full">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 uppercase tracking-wide">
                                {formData.fullName}
                            </h2>
                            <div className="text-gray-500 mt-1.5 lg:mt-2 text-sm lg:text-[15px] flex flex-col sm:flex-row items-center md:items-start gap-1 sm:gap-2">
                                <span>Mã số: <strong>{userInfo.studentId}</strong></span>
                                <span className="hidden sm:block">•</span>
                                <span>Khoa Công nghệ Thông tin</span>
                            </div>
                            <span className="inline-block mt-3 px-4 py-1.5 bg-emerald-600 text-white text-xs lg:text-sm font-medium rounded-full shadow-sm">
                                Sinh viên chính quy
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
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Họ và Tên</label>
                                    <input
                                        type="text" name="fullName"
                                        readOnly={!isEditing}
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base outline-none transition-all ${isEditing ? 'border-2 border-emerald-400 bg-white text-gray-900' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}
                                    />
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
                            <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-5 lg:mb-6">Thông tin liên hệ</h3>
                            <div className="space-y-4 lg:space-y-5">
                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-500 mb-1 lg:mb-1.5">Email trường</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${userInfo.studentId}@st.hcmuaf.edu.vn`}
                                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm lg:text-base text-gray-500 outline-none cursor-not-allowed"
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

            {/* NAVBAR MOBILE */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-emerald-700">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Hồ sơ</span>
                </a>
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