import React, {useEffect, useRef, useState} from 'react';
import {Menu, Plus, Grid3x3, Circle, Search, UserIcon, LogOut, UserPlus} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {getProfile} from "../../user/api/authService";

interface UserInfo {
    studentId: string;
    role: string;
    fullName?: string;
}

interface HeaderProps {
    onMenuClick?: () => void;
}

interface HeaderProps {
    onMenuClick?: () => void
}

const Header = ({onMenuClick}: HeaderProps) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const router = useNavigate();
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
        const fetchUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                try {

                    const fullData = await getProfile(parsed.studentId);


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
        return <div className="flex h-screen items-center justify-center">Đang tải thông tin...</div>;
    }
    const getInitial = (name?: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        const lastName = words[words.length - 1];
        return lastName.charAt(0).toUpperCase();
    };


    return (
        <header
            className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm lg:shadow-none">

            {/* Cụm Logo & Menu Button */}
            <div className="flex items-center gap-3">
                {/* Nút Menu Hamburger - Chỉ hiện trên Mobile */}
                <button
                    onClick={onMenuClick}
                    className="p-1.5 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24}/>
                </button>
                <div className="font-bold text-emerald-700 text-lg sm:text-xl hidden lg:block">
                    Hệ thống Đánh giá OBE
                </div>
            </div>


            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base lg:text-lg hover:ring-4 hover:ring-gray-100 transition-all focus:outline-none"
                >
                    {getInitial(formData.fullName)}
                </button>

                {showProfileMenu && (

                    <div
                        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-[#f8fafd] rounded-2xl sm:rounded-[28px] shadow-xl border border-gray-200 z-50 p-2 transform origin-top-right transition-all">

                        <div className="bg-white rounded-xl sm:rounded-[24px] p-5 flex flex-col items-center shadow-sm">
                <span className="text-xs sm:text-sm font-medium text-gray-800 break-all text-center">
                {`${user.studentId}@st.hcmuaf.edu.vn`}
                </span>

                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600 text-white flex items-center justify-center font-normal text-3xl sm:text-4xl mt-4 mb-2">
                                {getInitial(formData.fullName)}
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