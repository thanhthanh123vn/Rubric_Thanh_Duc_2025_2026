import {useContext, useEffect, useRef, useState} from 'react';
import {BarChart3, CalendarDays, LogOut, Menu, Plus, UserPlus, UserRound} from 'lucide-react';
import {useLocation, useNavigate, useParams} from "react-router-dom";

import {enrollCourse} from "@/features/course/courseApi.ts";
import {toast} from "sonner";
import sinhVienService from "@/pages/admin/api/sinhVienService.ts";
import {NotificationBell} from "@/components/home/NotificationBell.tsx";
import authService from "@/user/api/authService.ts";
import {courseService} from "@/features/course/courseApi.ts";
import {StudentCourseLayoutContext} from "@/features/course/student/components/StudentCourseLayoutContext.ts";
import { calculateStudentObeProgress } from '@/utils/obeUtils.ts';

interface UserInfo {
    studentId: string;
    role: string;
    fullName?: string;
}

interface HeaderProps {
    onMenuClick?: () => void;
    onEnrollSuccess?: () => void;
    layoutRoot?: boolean;
}

const Header = ({ onMenuClick, onEnrollSuccess, layoutRoot = false }: HeaderProps) => {
    const insideCourseLayout = useContext(StudentCourseLayoutContext);
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
    const {id: courseId} = useParams();
    const inCourse = location.pathname.startsWith('/course/') && Boolean(courseId);
    const [courseName, setCourseName] = useState('Học phần');
    const [courseCode, setCourseCode] = useState('');
    const [courseLecturer, setCourseLecturer] = useState('Chưa cập nhật');
    const [courseTerm, setCourseTerm] = useState('Chưa cập nhật');
    const [courseProgress, setCourseProgress] = useState(0);
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

    useEffect(() => {
        let active = true;
        if (!inCourse || !courseId) return undefined;

        courseService.getCourseById(courseId).then((data) => {
            if (!active) return;
            setCourseName(data?.course?.courseName || data?.courseName || 'Học phần');
            setCourseCode(data?.course?.courseCode || data?.courseCode || courseId);
            setCourseLecturer(data?.lecturers?.map((lecturer: any) => lecturer.lecturerName).filter(Boolean).join(', ') || data?.lecturerName || 'Chưa cập nhật');
            setCourseTerm([data?.semester, data?.year].filter(Boolean).join(' · ') || 'Chưa cập nhật');
        }).catch(() => {
            if (active) setCourseCode(courseId);
        });

        courseService.getOBEProgressByStudent(courseId).then((items) => {
            if (!active) return;
            setCourseProgress(calculateStudentObeProgress(items));
        }).catch(() => {
            if (active) setCourseProgress(0);
        });

        return () => { active = false; };
    }, [courseId, inCourse]);


    if (insideCourseLayout && !layoutRoot) {
        return <span data-student-course-legacy-header className="hidden" />;
    }

    const handleLogout = async () => {
        try {
            await authService.logout();

            // Chỉ khi API trả về 200 OK mới xóa và chuyển trang
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Lỗi khi đăng xuất backend:", error);
            // Xem chi tiết lỗi API báo về là gì
        }
    };

    if (!user) {

            return (
                <>
                    <header className={`${layoutRoot ? "sticky top-0 h-24 w-full" : inCourse ? "fixed left-0 right-0 top-0 h-24 lg:left-72 lg:right-auto lg:w-[calc(100vw-18rem)] lg:max-w-[1312px]" : "sticky top-0 min-h-[72px]"} z-30 flex items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl lg:px-8`}>
                        <div className="h-5 w-44 animate-pulse rounded-full bg-slate-200" />
                    </header>
                    {inCourse && !layoutRoot && <div aria-hidden="true" className="h-24 shrink-0" />}
                </>
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
            await enrollCourse(offeringId);
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
        <>
        <header
            className={`${layoutRoot ? "sticky top-0 h-24 w-full" : inCourse ? "fixed left-0 right-0 top-0 h-24 lg:left-72 lg:right-auto lg:w-[calc(100vw-18rem)] lg:max-w-[1312px]" : "sticky top-0 min-h-[72px]"} z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6 md:py-5 xl:px-8`}>

            <div className="flex min-w-0 items-center gap-3">
                <button
                    onClick={() => {
                        if (onMenuClick) onMenuClick();
                        else window.dispatchEvent(new Event('student-course-sidebar:open'));
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
                    aria-label="Mở menu lớp học"
                >
                    <Menu size={21}/>
                </button>
                {inCourse ? (
                    <>
                        <div className="min-w-0">
                            <div className="mt-0.5 flex min-w-0 items-center gap-2">
                                <h1 className="truncate text-lg font-bold text-slate-900 md:text-2xl">{courseName}</h1>
                                {courseCode && <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 lg:inline-flex">{courseCode}</span>}
                            </div>
                        </div>
                    </>
                ) : (
                    <button onClick={() => navigate("/dashboard")} className="text-left text-lg font-bold text-emerald-700 transition hover:text-emerald-800 sm:text-xl">
                        Hệ thống Đánh giá OBE
                    </button>
                )}
            </div>

            <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-3" ref={menuRef}>

                {inCourse && (
                    <div className="hidden items-center gap-3 xl:flex">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <UserRound className="h-5 w-5"/>
                            </div>
                            <div className="max-w-44">
                                <p className="text-xs text-slate-500">Giảng viên phụ trách</p>
                                <p className="truncate font-semibold text-slate-900">{courseLecturer}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                                <CalendarDays className="h-5 w-5"/>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Học kỳ</p>
                                <p className="font-semibold text-slate-900">{courseTerm}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                <BarChart3 className="h-5 w-5"/>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tiến độ OBE</p>
                                <p className="font-semibold text-slate-900">{courseProgress}%</p>
                            </div>
                        </div>
                    </div>
                )}

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

                <NotificationBell />

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
                    className="flex items-center gap-2 rounded-full p-0.5 pr-0 text-left transition hover:bg-slate-50 focus:outline-none sm:pr-2"
                    aria-label="Mở menu tài khoản"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-base font-bold text-white ring-2 ring-emerald-50 lg:h-10 lg:w-10">
                        {formData.avatarUrl && formData.avatarUrl.trim() !== "" && !imageError ? (
                            <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" onError={() => setImageError(true)}/>
                        ) : getInitial(formData.fullName)}
                    </span>
                    <span className="hidden max-w-36 sm:block">
                        <span className="block truncate text-sm font-semibold text-slate-800">{formData.fullName || user.studentId}</span>
                        <span className="block text-[11px] text-slate-500">Sinh viên</span>
                    </span>
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
                                onClick={() => window.open("/profile", "_blank")}
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
        {inCourse && !layoutRoot && <div aria-hidden="true" className="h-24 shrink-0" />}
        </>
    );
};

export default Header;
