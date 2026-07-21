import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Loader2, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {enrollmentService} from "@/api/enrollmentApi.ts";
import {useNavigate, useParams} from "react-router-dom";
import {getProfile} from "@/user/api/authService.ts";


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
}

interface StudentInfo {
    studentId: string;
    fullName: string;
    className?: string;
    phoneNumber?: string;
}



export default function StudentTranscriptView() {
    const {studentId} = useParams();
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
console.log(student);
    const handlePrint = () => {
        window.print();
    };

    // Tính tổng số tín chỉ và điểm trung bình tích lũy
    const totalCredits = transcriptData.reduce((sum, item) => sum + (item.credits || 3), 0);
    const weightedScoreSum = transcriptData.reduce((sum, item) => sum + (item.totalScore * (item.credits || 3)), 0);
    const cumulativeGPA = totalCredits > 0 ? (weightedScoreSum / totalCredits).toFixed(2) : "0.00";

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Thanh công cụ điều hướng - Sẽ ẩn đi khi in nhờ class print:hidden */}
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

            {/* KHUNG BẢN IN CHUẨN A4 (Chỉ vùng này được in ra nhờ cấu hình CSS Media Print) */}
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
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Học kỳ / Năm học: 2025 - 2026</p>
                </div>

                {/* Thông tin cá nhân sinh viên */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                    <div className="flex"><span className="w-32 font-semibold text-slate-600">Họ và tên:</span> <span className="font-bold uppercase text-slate-900">{student.fullName}</span></div>
                    <div className="flex"><span className="w-32 font-semibold text-slate-600">Mã sinh viên:</span> <span className="font-mono font-medium">{student.studentId}</span></div>
                    <div className="flex"><span className="w-32 font-semibold text-slate-600">Lớp học:</span> <span>{student.className || '---'}</span></div>
                    <div className="flex"><span className="w-32 font-semibold text-slate-600">Điện thoại:</span> <span>{student.phoneNumber || '---'}</span></div>
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
                        {transcriptData.length > 0 ? (
                            transcriptData.map((item, index) => (
                                <tr key={item.enrollmentId || index} className="hover:bg-slate-50">
                                    <td className="border border-slate-800 py-2.5 px-3 text-center">{index + 1}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 font-medium text-slate-900">{item.courseName}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center">{item.credits || 3}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center font-bold text-blue-700 print:text-black">
                                        {item.totalScore?.toFixed(1)}
                                    </td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center font-semibold">{item.letterGrade}</td>
                                </tr>
                            ))
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
                            <tr className="font-bold bg-slate-50 print:bg-transparent">
                                <td colSpan={2} className="border border-slate-800 py-3 px-3 text-right">Tổng tích lũy:</td>
                                <td className="border border-slate-800 py-3 px-3 text-center">{totalCredits} TC</td>
                                <td colSpan={2} className="border border-slate-800 py-3 px-3 text-left pl-6">
                                    Điểm trung bình (GPA): <span className="text-emerald-700 print:text-black font-extrabold text-base ml-2">{cumulativeGPA}</span>
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
                        <p className="italic text-slate-500 mb-1 text-xs">TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                        <p className="font-bold uppercase text-slate-700 mb-20">Phòng Đào Tạo</p>
                        <p className="text-slate-400 italic text-xs">(Ký, đóng dấu)</p>
                    </div>
                </div>

            </div>
        </div>
    );
}