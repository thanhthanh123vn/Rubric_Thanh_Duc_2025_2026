import React, {useEffect, useRef, useState} from 'react';
import {Menu, Plus, Bell, LogOut, UserPlus} from 'lucide-react'; // Đã thêm import Bell
import {useLocation, useNavigate} from "react-router-dom";

import {enrollCourse} from "@/features/course/courseApi.ts";
import {toast} from "sonner";
import sinhVienService from "@/pages/admin/api/sinhVienService.ts";

interface UserInfo {
    studentId: string;
    role: string;
    fullName?: string;
}

interface HeaderProps {
    onMenuClick?: () => void;
    onEnrollSuccess?: () => void;
}

const Header = ({ onMenuClick, onEnrollSuccess }: HeaderProps) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [showJoinClass, setShowJoinClass] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [offeringId, setOfferingId] = useState("");
    const router = useNavigate();
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        avatarUrl:'',
        dateOfBirth: '',
        nationality: 'Việt Nam',
        cccd: '',
        gender: 'Nam',
        phoneNumber: '',
        address: ''
    });
    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                try {
                    const fullData = await sinhVienService.getProfile();

                    setFormData({
                        fullName: fullData.fullName || '',
                        dateOfBirth: fullData.dateOfBirth || '',
                        nationality: fullData.nationality || 'Việt Nam',
                        avatarUrl: fullData.avatarUrl || "T",
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

        fetchUser();
    }, [router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router('/login');
    };

    if (!user) {

            return (
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </div>
            );

    }
    const getInitial = (name?: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        const lastName = words[words.length - 1];
        return lastName.charAt(0).toUpperCase();
    };

    const handleEnrollClick = async () => {
        setIsEnrolling(true);
        try {
            const response = await enrollCourse(offeringId);
            toast.success("Ghi danh thành công!");

            setShowJoinClass(false);
            setOfferingId("");
            if (onEnrollSuccess) {
                onEnrollSuccess();
            }

        } catch (error: any) {
            console.error("Lỗi khi ghi danh:", error);
            const errorMessage = error.response?.data || "Đã xảy ra lỗi khi ghi danh. Vui lòng thử lại!";
            toast.error(errorMessage);
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <header
            className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm lg:shadow-none">

            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-1.5 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24}/>
                </button>
                <div onClick={() => navigate("/dashboard")} className="font-bold text-emerald-700 text-lg sm:text-xl hidden lg:block hover:cursor-pointer">
                    Hệ thống Đánh giá OBE
                </div>
            </div>

            <div className="flex items-center gap-3 relative" ref={menuRef}>

                {/* Nút Tham gia lớp học */}
                {location.pathname === '/dashboard' && (
                    <button
                        onClick={() => setShowJoinClass(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200 border border-emerald-100"
                    >
                        <Plus size={20}/>
                        <span className="hidden sm:block font-medium text-sm">Tham gia lớp học</span>
                    </button>
                )}

                {/* Nút Thông báo (Chuông) */}
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors mr-1">
                    <Bell size={22}/>
                    {/* Dấu chấm đỏ báo có thông báo mới */}
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* Modal Tham gia lớp học (Không làm mờ) */}
                {showJoinClass && (
                    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-fadeIn">
                        <div
                            className="bg-white w-[92%] max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-5">
                                Tham gia lớp học
                            </h2>
                            <div className="mb-5">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Mã lớp
                                </label>
                                <input
                                    value={offeringId}
                                    onChange={(e) => setOfferingId(e.target.value)}
                                    type="text"
                                    placeholder="VD: ABC123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Giáo viên sẽ cung cấp mã lớp cho bạn.
                                </p>
                            </div>
                            <div className="mb-6 bg-gray-50 rounded-lg p-3">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">
                                    Hướng dẫn
                                </h3>
                                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                    <li>Dùng tài khoản được cấp</li>
                                    <li>Mã gồm 5–8 ký tự, không dấu cách</li>
                                </ul>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowJoinClass(false)}
                                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={handleEnrollClick}
                                    disabled={isEnrolling}
                                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 active:scale-95 transition-all"
                                >
                                    Tham gia
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nút Avatar */}
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-emerald-600 text-white flex items-center justify-center font-bold text-base lg:text-lg hover:ring-4 hover:ring-gray-100 transition-all focus:outline-none"
                >

                    {formData.avatarUrl && formData.avatarUrl.trim() !== "" && !imageError ? (
                        <img
                            src={formData.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-full"
                            onError={() => {
                                setImageError(true);
                            }}
                        />
                    ) : (
                        getInitial(formData.fullName)
                    )}
                </button>

                {/* Profile Menu Popup */}
                {showProfileMenu && (
                    <div
                        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-[#f8fafd] rounded-2xl sm:rounded-[28px] shadow-xl border border-gray-200 z-50 p-2 transform origin-top-right transition-all">

                        <div className="bg-white rounded-xl sm:rounded-[24px] p-5 flex flex-col items-center shadow-sm">
                            <span className="text-xs sm:text-sm font-medium text-gray-800 break-all text-center">
                            {`${user.studentId}@st.hcmuaf.edu.vn`}
                            </span>

                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mt-4 mb-2 flex items-center justify-center shrink-0">
                                {formData.avatarUrl && formData.avatarUrl.trim() !== "" && !imageError ? (
                                    <img
                                        src={formData.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover rounded-full"
                                        onError={() => {
                                            setImageError(true);
                                        }}
                                    />
                                ) : (

                                    <div
                                        className="w-full h-full bg-emerald-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-semibold">
                                        {getInitial(formData.fullName)}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-lg sm:text-xl text-gray-900 font-normal text-center break-words w-full">
                                Hi, {formData.fullName || user.studentId}!
                            </h2>

                            <button
                                onClick={() => router('/profile')}
                                className="mt-4 px-4 sm:px-6 py-2 border border-gray-400 rounded-full text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                                Quản lý Tài khoản
                            </button>
                        </div>

                        <div className="mt-2 flex flex-col gap-1">
                            <button
                                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 text-sm text-gray-700 hover:bg-white rounded-full transition-colors font-medium">
                                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5"/>
                                Thêm một tài khoản khác
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 text-sm text-gray-700 hover:bg-white rounded-full transition-colors font-medium"
                            >
                                <LogOut className="w-4 h-4 sm:w-5 sm:h-5"/>
                                Đăng xuất
                            </button>
                        </div>

                        <div className="flex justify-center gap-2 text-[10px] sm:text-xs text-gray-600 mt-2 mb-1">
                            <a href="#" className="hover:bg-gray-200 px-2 py-1.5 rounded-md transition-colors">Chính
                                sách quyền riêng tư</a>
                            <span className="py-1.5">•</span>
                            <a href="#" className="hover:bg-gray-200 px-2 py-1.5 rounded-md transition-colors">Điều
                                khoản</a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;