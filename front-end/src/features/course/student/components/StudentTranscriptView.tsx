import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Printer,
    Loader2,
    Award,
    BookOpen,
    User,
    Settings,
    Calendar,
    LogOut,
    Search,
    Bell,
    MessageSquare,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { enrollmentService } from "@/api/enrollmentApi.ts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProfile } from "@/user/api/authService.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";

interface EnrollmentGrading {
    enrollmentId: string;
    courseId: string;
    courseName: string;
    offeringId: string;
    attendanceScore: number;
    assignmentScore: number;
    midtermScore: number;
    finalScore: number;
    totalScore: number;
    letterGrade: string;
    credits?: number;
    semester?: string;
    academicYear?: string;
}

export default function StudentTranscriptView() {
    const { user: reduxUser } = useAppSelector((state) => state.auth);

    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const studentId = user?.studentId || user?.userId;
    const [transcriptData, setTranscriptData] = useState<EnrollmentGrading[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<any>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!studentId) return;

            setIsLoading(true);
            try {
                const [gradingData, profileData] = await Promise.all([
                    enrollmentService.getStudentGrading(studentId),
                    getProfile()
                ]);
                setTranscriptData(gradingData || []);
                setStudent(profileData);
            } catch (error) {
                console.error("Lỗi khi tải bảng điểm hoặc thông tin:", error);
                toast.error("Không thể tải kết quả học tập của sinh viên này.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const handlePrint = () => {
        window.print();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitial = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        return words[words.length - 1].charAt(0).toUpperCase();
    };

    const groupedData = transcriptData.reduce((acc, item) => {
        const academicYear = item.academicYear || "N/A";
        const semester = item.semester || "N/A";
        const key = `${academicYear}_${semester}`;

        if (!acc[key]) {
            acc[key] = {
                academicYear,
                semester,
                items: []
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {} as Record<string, { academicYear: string, semester: string, items: EnrollmentGrading[] }>);

    const sortedGroups = Object.values(groupedData).sort((a, b) => {
        if (a.academicYear !== b.academicYear) return a.academicYear.localeCompare(b.academicYear);
        return a.semester.localeCompare(b.semester);
    });

    let cumulativeCredits = 0;
    let cumulativeScore = 0;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f9f5] font-sans pb-20 lg:pb-0 animate-in fade-in duration-300">
            {/* SIDEBAR */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-emerald-100 flex-col shadow-sm z-20 sticky top-0 h-screen print:hidden">
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
                    <a href="/profile/settings" className="flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                    </a>
                    {/* TRẠNG THÁI ACTIVE ĐƯỢC CHUYỂN SANG ĐÂY */}
                    <Link
                        to={`/profile/result-grading`}
                        className="flex items-center gap-4 px-4 py-3.5 bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20"
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
                {/* HEADER */}
                <header className="h-16 lg:h-20 bg-white flex items-center justify-between px-4 lg:px-10 border-b border-emerald-50 sticky top-0 z-30 shadow-sm lg:shadow-none print:hidden">
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
                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 cursor-pointer overflow-hidden">
                            {student?.avatarUrl ? (
                                <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                getInitial(student?.fullName || "")
                            )}
                        </div>
                    </div>
                </header>

                {/* WRAPPER CUỘN ĐỘC LẬP CHO BẢNG ĐIỂM */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
                    <div className="space-y-6">
                        {/* Thanh công cụ điều hướng */}
                        <div className="flex justify-between items-center print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại danh sách
                            </Button>
                            <Button
                                onClick={handlePrint}
                                disabled={isLoading || transcriptData.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> In bảng điểm (A4)
                            </Button>
                        </div>

                        {/* KHUNG BẢN IN CHUẨN A4 */}
                        <div id="printable-transcript" className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto relative text-slate-800">
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center print:hidden">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <span className="ml-2 font-medium text-slate-600">Đang tải bảng điểm từ hệ thống...</span>
                                </div>
                            )}

                            {/* Quốc hiệu tiêu ngữ */}
                            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                                <div className="text-center">
                                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wider">Bộ Giáo dục và Đào tạo</p>
                                    <p className="text-sm md:text-base font-bold uppercase mt-1">Trường Đại học Nông Lâm TP.HCM</p>
                                    <div className="w-24 h-[1px] bg-slate-800 mx-auto mt-2"></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wider">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
                                    <p className="text-xs md:text-sm font-bold mt-1">Độc lập - Tự do - Hạnh phúc</p>
                                    <div className="w-32 h-[1px] bg-slate-800 mx-auto mt-2"></div>
                                </div>
                            </div>

                            {/* Tiêu đề văn bản */}
                            <div className="text-center mb-8">
                                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-900">Kết quả học tập sinh viên</h1>
                            </div>

                            {/* Thông tin cá nhân sinh viên */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                                <div className="flex"><span className="w-32 font-semibold text-slate-600">Họ và tên:</span>
                                    <span className="font-bold uppercase text-slate-900">{student?.fullName || '---'}</span></div>
                                <div className="flex"><span className="w-32 font-semibold text-slate-600">Mã sinh viên:</span>
                                    <span className="font-mono font-medium">{student?.studentId || '---'}</span></div>
                                <div className="flex"><span className="w-32 font-semibold text-slate-600">Lớp học:</span>
                                    <span>{student?.className || '---'}</span></div>
                                <div className="flex"><span className="w-32 font-semibold text-slate-600">Điện thoại:</span>
                                    <span>{student?.phoneNumber || '---'}</span></div>
                            </div>

                            {/* Bảng điểm chi tiết các học phần */}
                            <div className="overflow-x-auto mb-8">
                                <table className="w-full text-sm border-collapse border border-slate-800">
                                    <thead>
                                    <tr className="bg-slate-100 print:bg-slate-100 text-slate-900">
                                        <th className="border border-slate-800 py-2.5 px-3 text-center w-12">STT</th>
                                        <th className="border border-slate-800 py-2.5 px-3 text-left">Tên học phần</th>
                                        <th className="border border-slate-800 py-2.5 px-3 text-center w-20">Tín chỉ</th>
                                        <th className="border border-slate-800 py-2.5 px-3 text-center w-24">Điểm tổng kết</th>
                                        <th className="border border-slate-800 py-2.5 px-3 text-center w-24">Điểm chữ</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedGroups.length > 0 ? (
                                        sortedGroups.map((group, groupIndex) => {
                                            let termCredits = 0;
                                            let termScore = 0;

                                            return (
                                                <React.Fragment key={`group-${groupIndex}`}>
                                                    <tr className="bg-slate-200 font-bold print:bg-slate-200">
                                                        <td colSpan={5} className="border border-slate-800 py-2.5 px-3 text-left uppercase">
                                                            Học kỳ {group.semester} - Năm học {group.academicYear}
                                                        </td>
                                                    </tr>

                                                    {group.items.map((item, index) => {
                                                        const credits = item.credits || 3;
                                                        termCredits += credits;
                                                        termScore += (item.totalScore || 0) * credits;
                                                        cumulativeCredits += credits;
                                                        cumulativeScore += (item.totalScore || 0) * credits;

                                                        return (
                                                            <tr key={item.enrollmentId || index} className="hover:bg-slate-50">
                                                                <td className="border border-slate-800 py-2.5 px-3 text-center">{index + 1}</td>
                                                                <td className="border border-slate-800 py-2.5 px-3 font-medium text-slate-900">{item.courseName}</td>
                                                                <td className="border border-slate-800 py-2.5 px-3 text-center">{credits}</td>
                                                                <td className="border border-slate-800 py-2.5 px-3 text-center font-bold text-blue-700 print:text-black">
                                                                    {item.totalScore?.toFixed(1)}
                                                                </td>
                                                                <td className="border border-slate-800 py-2.5 px-3 text-center font-semibold">{item.letterGrade}</td>
                                                            </tr>
                                                        );
                                                    })}

                                                    <tr className="font-semibold bg-slate-50 italic print:bg-transparent">
                                                        <td colSpan={2} className="border border-slate-800 py-2.5 px-3 text-right">Trung bình học kỳ:</td>
                                                        <td className="border border-slate-800 py-2.5 px-3 text-center">{termCredits}</td>
                                                        <td className="border border-slate-800 py-2.5 px-3 text-center text-blue-700 print:text-black">
                                                            {termCredits > 0 ? (termScore / termCredits).toFixed(2) : "0.00"}
                                                        </td>
                                                        <td className="border border-slate-800 py-2.5 px-3 text-center"></td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="border border-slate-800 py-10 text-center text-slate-500 italic">
                                                Không tìm thấy dữ liệu học phần hoặc sinh viên chưa có điểm.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>

                                    {transcriptData.length > 0 && (
                                        <tfoot>
                                        <tr className="font-bold bg-slate-50 print:bg-transparent text-base">
                                            <td colSpan={2} className="border border-slate-800 py-4 px-3 text-right uppercase">Tổng tích lũy toàn khóa:</td>
                                            <td className="border border-slate-800 py-4 px-3 text-center">{cumulativeCredits} TC</td>
                                            <td colSpan={2} className="border border-slate-800 py-4 px-3 text-left pl-6">
                                                Điểm trung bình (GPA):
                                                <span className="text-emerald-700 print:text-black font-extrabold text-lg ml-2">
                                                        {cumulativeCredits > 0 ? (cumulativeScore / cumulativeCredits).toFixed(2) : "0.00"}
                                                    </span>
                                            </td>
                                        </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Phần chữ ký xác nhận */}
                            <div className="flex justify-between text-sm mt-12 px-4 md:px-8">
                                <div className="text-center">
                                    <p className="font-semibold text-slate-700 mb-20">Người lập bảng</p>
                                    <p className="text-slate-400 italic text-xs">(Ký và ghi rõ họ tên)</p>
                                </div>
                                <div className="text-center">
                                    <p className="italic text-slate-500 mb-1 text-xs">
                                        TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                                    </p>
                                    <p className="font-bold uppercase text-slate-700 mb-20">Phòng Đào Tạo</p>
                                    <p className="text-slate-400 italic text-xs">(Ký, đóng dấu)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* NAVBAR MOBILE */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] print:hidden">
                <Link to="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-emerald-700 transition-colors">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Hồ sơ</span>
                </Link>
                <a href="#" className="flex flex-col items-center justify-center w-full h-full text-emerald-700 transition-colors">
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