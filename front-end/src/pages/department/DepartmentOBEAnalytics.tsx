import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, TrendingUp, BookOpen,
    ChevronDown, CheckCircle2, AlertTriangle, PieChart, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { toast } from 'sonner';


interface CourseStat {
    id: string;
    courseCode: string;
    courseName: string;
    mainLecturer: string;
    passRate: number;
    obeAchievement: number;
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
}

export default function DepartmentOBEAnalytics() {
    // 1. Lấy thông tin Trưởng bộ môn
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const userDept = user?.department || "Hệ Thống Thông Tin";

    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('HK1-2025-2026');
    const [courseStats, setCourseStats] = useState<CourseStat[]>([]);

    useEffect(() => {
        // Giả lập gọi API lấy dữ liệu thống kê của các môn thuộc Bộ môn
        const fetchStats = () => {
            setLoading(true);
            setTimeout(() => {
                setCourseStats([
                    { id: 'C1', courseCode: 'IT202', courseName: 'Hệ quản trị CSDL', mainLecturer: 'Trần Lê Như Quỳnh', passRate: 94.5, obeAchievement: 89, status: 'EXCELLENT' },
                    { id: 'C2', courseCode: 'IT301', courseName: 'Phát triển Web', mainLecturer: 'Lê Thị Cẩm Tú', passRate: 88.0, obeAchievement: 82, status: 'GOOD' },
                    { id: 'C3', courseCode: 'IT402', courseName: 'Phân tích thiết kế HT', mainLecturer: 'Phan Văn Đức', passRate: 91.5, obeAchievement: 86, status: 'EXCELLENT' },
                    { id: 'C4', courseCode: 'IT105', courseName: 'Tin học cơ sở', mainLecturer: 'Nguyễn Văn A', passRate: 72.0, obeAchievement: 68, status: 'NEEDS_IMPROVEMENT' },
                    { id: 'C5', courseCode: 'IT305', courseName: 'Hệ chuyên gia', mainLecturer: 'Hoàng Minh Tâm', passRate: 85.0, obeAchievement: 78, status: 'GOOD' },
                ]);
                setLoading(false);
            }, 800);
        };
        fetchStats();
    }, [semester]);

    const handleExportReport = () => {
        toast.success(`Đang xuất báo cáo OBE bộ môn ${userDept}...`);
        // Logic gọi API xuất file Excel/PDF
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'EXCELLENT':
                return <span className="flex items-center justify-end gap-1.5 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-4 h-4"/> Xuất sắc</span>;
            case 'GOOD':
                return <span className="flex items-center justify-end gap-1.5 text-blue-700 text-xs font-bold"><Target className="w-4 h-4"/> Khá / Tốt</span>;
            case 'NEEDS_IMPROVEMENT':
                return <span className="flex items-center justify-end gap-1.5 text-amber-700 text-xs font-bold"><AlertTriangle className="w-4 h-4"/> Cần cải thiện</span>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-semibold mb-2">
                        <PieChart className="w-3.5 h-3.5" /> Thống kê Bộ môn {userDept}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Phân tích Chuẩn đầu ra (OBE)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Theo dõi mức độ đạt chuẩn CLO/PLO của các môn học do bộ môn quản lý.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full md:w-48 appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all cursor-pointer"
                        >
                            <option value="HK1-2025-2026">Học kỳ 1 (2025-2026)</option>
                            <option value="HK2-2024-2025">Học kỳ 2 (2024-2025)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <Button onClick={handleExportReport} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm">
                        <Download className="w-4 h-4 mr-2" /> Tải báo cáo
                    </Button>
                </div>
            </div>

            {/* --- TOP STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Môn học đang giảng dạy</p>
                        <h4 className="text-2xl font-bold text-slate-800">12 Môn</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">TB Mức độ đạt OBE</p>
                        <h4 className="text-2xl font-bold text-slate-800">83.6%</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Môn cần cải thiện</p>
                        <h4 className="text-2xl font-bold text-slate-800">1 Môn</h4>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Chất lượng theo Môn học</h3>
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50">Xem tất cả</Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Môn học</th>
                                <th className="px-5 py-4">GV Chính / Chịu trách nhiệm</th>
                                <th className="px-5 py-4 text-center">Tỷ lệ qua môn</th>
                                <th className="px-5 py-4 text-center">Đạt chuẩn OBE</th>
                                <th className="px-5 py-4 text-right">Đánh giá</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400">Đang tải dữ liệu phân tích...</td>
                                </tr>
                            ) : (
                                courseStats.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800">{course.courseName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{course.courseCode}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 font-medium">
                                            {course.mainLecturer}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <span className="font-semibold text-slate-700">{course.passRate}%</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.passRate}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className={`font-semibold ${course.obeAchievement >= 80 ? 'text-teal-600' : 'text-amber-600'}`}>
                                                        {course.obeAchievement}%
                                                    </span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${course.obeAchievement >= 80 ? 'bg-teal-500' : 'bg-amber-500'}`} style={{ width: `${course.obeAchievement}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {renderStatus(course.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CỘT PHẢI: Trạng thái Chuẩn Đầu Ra (PLO/CLO) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Bản đồ Đạt chuẩn PLO</h3>
                        <p className="text-xs text-slate-500 mt-1">Mức độ đóng góp của Bộ môn vào chuẩn đầu ra Khoa</p>
                    </div>

                    <div className="flex-1 space-y-5">
                        {/* Mock PLO Progress */}
                        {[
                            { name: 'PLO1: Kiến thức nền tảng', value: 94, color: 'bg-emerald-500' },
                            { name: 'PLO2: Phân tích yêu cầu', value: 87, color: 'bg-blue-500' },
                            { name: 'PLO3: Thiết kế giải pháp', value: 82, color: 'bg-teal-500' },
                            { name: 'PLO6: Tự học & Nghiên cứu', value: 76, color: 'bg-amber-500' },
                        ].map((plo, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                                    <span>{plo.name}</span>
                                    <span>{plo.value}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className={`${plo.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${plo.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                Đề xuất: Môn <strong className="font-bold">Tin học cơ sở (IT105)</strong> đang có tỷ lệ đạt chuẩn thấp. Cần rà soát lại phương pháp giảng dạy và Rubric đánh giá kỳ tới.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}