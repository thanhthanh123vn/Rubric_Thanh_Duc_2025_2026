import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, Filter, TrendingUp,
    BookOpen, Users, GraduationCap, ChevronDown, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


interface DepartmentReport {
    id: string;
    departmentName: string;
    totalCourses: number;
    totalStudents: number;
    passRate: number;
    obeAchievement: number;
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
}

export default function FacultyReport() {
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('HK1-2025-2026');
    const [reports, setReports] = useState<DepartmentReport[]>([]);

    useEffect(() => {
        // Giả lập gọi API lấy dữ liệu báo cáo
        const fetchReports = () => {
            setLoading(true);
            setTimeout(() => {
                setReports([
                    { id: 'HTTT', departmentName: 'Hệ Thống Thông Tin', totalCourses: 24, totalStudents: 1250, passRate: 92.5, obeAchievement: 88, status: 'EXCELLENT' },
                    { id: 'CNPM', departmentName: 'Công Nghệ Phần Mềm', totalCourses: 30, totalStudents: 1540, passRate: 89.0, obeAchievement: 85, status: 'GOOD' },
                    { id: 'KHMT', departmentName: 'Khoa Học Máy Tính', totalCourses: 18, totalStudents: 980, passRate: 85.5, obeAchievement: 80, status: 'GOOD' },
                    { id: 'ATTT', departmentName: 'An Toàn Thông Tin', totalCourses: 14, totalStudents: 650, passRate: 78.0, obeAchievement: 72, status: 'NEEDS_IMPROVEMENT' },
                ]);
                setLoading(false);
            }, 800);
        };
        fetchReports();
    }, [semester]);

    const handleExportReport = () => {
        toast.success("Đang xuất báo cáo ra file Excel...");
        // Logic gọi API xuất file Export
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'EXCELLENT':
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Xuất sắc</span>;
            case 'GOOD':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Khá / Tốt</span>;
            case 'NEEDS_IMPROVEMENT':
                return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">Cần cải thiện</span>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-600" /> Báo cáo Chất lượng Đào tạo
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Thống kê tỷ lệ đạt chuẩn đầu ra (OBE) và tỷ lệ qua môn toàn Khoa.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full md:w-48 appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="HK1-2025-2026">Học kỳ 1 (2025-2026)</option>
                            <option value="HK2-2024-2025">Học kỳ 2 (2024-2025)</option>
                            <option value="HK1-2024-2025">Học kỳ 1 (2024-2025)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <Button onClick={handleExportReport} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm">
                        <Download className="w-4 h-4 mr-2" /> Xuất Excel
                    </Button>
                </div>
            </div>

            {/* --- TOP STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tổng Lớp học phần</p>
                        <h4 className="text-2xl font-bold text-slate-800">86</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Sinh viên đăng ký</p>
                        <h4 className="text-2xl font-bold text-slate-800">4,420</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tỷ lệ qua môn chung</p>
                        <h4 className="text-2xl font-bold text-slate-800">86.2%</h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Mức độ đạt OBE</p>
                        <h4 className="text-2xl font-bold text-slate-800">81.2%</h4>
                    </div>
                </div>
            </div>

            {/* --- MAIN DASHBOARD AREA --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CỘT TRÁI: Bảng chi tiết từng bộ môn (Chiếm 2/3) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">Hiệu suất theo Bộ môn</h3>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">Xem biểu đồ</Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4">Tên Bộ Môn</th>
                                <th className="px-5 py-4 text-center">Số Lớp HP</th>
                                <th className="px-5 py-4 text-center">Tỷ lệ qua môn</th>
                                <th className="px-5 py-4 text-center">Đạt chuẩn OBE</th>
                                <th className="px-5 py-4 text-right">Đánh giá</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400">Đang tải dữ liệu báo cáo...</td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 font-bold text-slate-800">{report.departmentName}</td>
                                        <td className="px-5 py-4 text-center text-slate-600 font-medium">{report.totalCourses}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <span className="font-semibold text-slate-700">{report.passRate}%</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${report.passRate}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className={`font-semibold ${report.obeAchievement >= 80 ? 'text-indigo-600' : 'text-amber-600'}`}>
                                                        {report.obeAchievement}%
                                                    </span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${report.obeAchievement >= 80 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${report.obeAchievement}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {renderStatus(report.status)}
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
                        <h3 className="text-lg font-bold text-slate-800">Trạng thái CĐR Khoa (PLO)</h3>
                        <p className="text-xs text-slate-500 mt-1">Mức độ đáp ứng Program Learning Outcomes</p>
                    </div>

                    <div className="flex-1 space-y-5">
                        {/* Mock PLO Progress */}
                        {[
                            { name: 'PLO1: Kiến thức cốt lõi', value: 92, color: 'bg-emerald-500' },
                            { name: 'PLO2: Tư duy phân tích', value: 85, color: 'bg-blue-500' },
                            { name: 'PLO3: Kỹ năng thiết kế', value: 78, color: 'bg-amber-500' },
                            { name: 'PLO4: Làm việc nhóm', value: 95, color: 'bg-purple-500' },
                            { name: 'PLO5: Trách nhiệm nghề nghiệp', value: 88, color: 'bg-indigo-500' },
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
                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                                Đánh giá chung: Mức độ đáp ứng chuẩn đầu ra của sinh viên Khoa đạt mức <strong className="font-bold">Tốt</strong>. Cần chú trọng cải thiện năng lực thiết kế thực hành (PLO3).
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}