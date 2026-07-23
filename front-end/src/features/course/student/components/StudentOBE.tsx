import React, { useState, useEffect } from 'react';
import LMSLayout from "@/app/lms-layout";
import { Button } from "@/components/ui/button";
import { Printer, Target, Award, CheckCircle2, BookOpen, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { toast } from "sonner";

interface OBEEvaluationItem {
    id: string;
    code: string;
    name: string;
    attainment: number; // Tỉ lệ đạt được (%)
    bloomLevel: string;
    status: string;
}

export default function StudentOBE() {
    const navigate = useNavigate();
    const { user: reduxUser } = useAppSelector((state) => state.auth);

    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [obeData, setObeData] = useState<OBEEvaluationItem[]>([
        { id: '1', code: 'CLO 1', name: 'Nắm vững kiến thức nền tảng và chuyên ngành CNTT', attainment: 85.0, bloomLevel: 'Applying', status: 'Đạt' },
        { id: '2', code: 'CLO 2', name: 'Kỹ năng lập trình Full-stack & Xây dựng hệ thống', attainment: 78.5, bloomLevel: 'Analyzing', status: 'Đạt' },
        { id: '3', code: 'CLO 3', name: 'Khả năng phân tích dữ liệu và áp dụng giải thuật', attainment: 82.0, bloomLevel: 'Evaluating', status: 'Đạt' },
        { id: '4', code: 'CLO 4', name: 'Kỹ năng làm việc nhóm, quản lý dự án & tài liệu hóa', attainment: 90.0, bloomLevel: 'Creating', status: 'Xuất sắc' },
    ]);

    const handlePrint = () => {
        window.print();
    };

    // Tính trung bình mức độ đạt chuẩn CLO toàn khóa
    const overallAttainment = obeData.length > 0
        ? (obeData.reduce((sum, item) => sum + item.attainment, 0) / obeData.length).toFixed(1)
        : "0.0";

    return (
        <LMSLayout>
            <div className="flex flex-col p-3 md:p-5 bg-gray-50/30 min-h-screen w-full overflow-x-hidden">

                {/* TIÊU ĐỀ & NÚT IN */}
                <div className="border-b-2 border-emerald-700 pb-2 mb-4 md:mb-5 flex flex-wrap gap-3 justify-between items-end print:hidden">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">OBE Report Module</p>
                        <h1 className="text-lg md:text-xl font-bold text-emerald-800 uppercase tracking-tight mt-0.5">
                            Báo cáo chuẩn đầu ra (OBE) cá nhân
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-2 text-xs h-8 px-3 shadow-sm bg-white"
                    >
                        <Printer size={14}/> <span className="hidden sm:inline font-medium">In báo cáo OBE</span>
                    </Button>
                </div>

                {/* KHUNG BẢN IN CHÍNH */}
                <div id="printable-transcript" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 w-full space-y-6">

                    {/* Header chuẩn khi in văn bản */}
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

                    <div className="text-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-900">Báo cáo kết quả học tập theo định hướng OBE</h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">Năm học: 2025 - 2026</p>
                    </div>

                    {/* Thông tin sinh viên */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mb-6 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                        <div className="flex"><span className="w-32 font-semibold text-slate-600">Họ và tên:</span> <span className="font-bold uppercase text-slate-900">{user?.fullName || "Nguyễn Văn Thạnh"}</span></div>
                        <div className="flex"><span className="w-32 font-semibold text-slate-600">Mã sinh viên:</span> <span className="font-mono font-medium">{user?.studentId || "22130260"}</span></div>
                        <div className="flex"><span className="w-32 font-semibold text-slate-600">Ngành học:</span> <span>Công nghệ Thông tin</span></div>
                        <div className="flex"><span className="w-32 font-semibold text-slate-600">Đánh giá chung:</span> <span className="font-bold text-emerald-700">{overallAttainment}% (Đạt chuẩn OBE)</span></div>
                    </div>

                    {/* Bảng chi tiết mức độ đạt chuẩn đầu ra */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm border-collapse border border-slate-800">
                            <thead>
                            <tr className="bg-slate-100 print:bg-slate-100 text-slate-900">
                                <th className="border border-slate-800 py-2.5 px-3 text-center w-20">Mã CLO</th>
                                <th className="border border-slate-800 py-2.5 px-3 text-left">Tiêu chí chuẩn đầu ra học phần</th>
                                <th className="border border-slate-800 py-2.5 px-3 text-center w-32">Thang đo Bloom</th>
                                <th className="border border-slate-800 py-2.5 px-3 text-center w-28">Mức độ đạt</th>
                                <th className="border border-slate-800 py-2.5 px-3 text-center w-24">Trạng thái</th>
                            </tr>
                            </thead>
                            <tbody>
                            {obeData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="border border-slate-800 py-2.5 px-3 text-center font-bold text-slate-800">{item.code}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center text-slate-600">{item.bloomLevel}</td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center font-bold text-blue-700 print:text-black">
                                        {item.attainment}%
                                    </td>
                                    <td className="border border-slate-800 py-2.5 px-3 text-center font-semibold text-emerald-600">{item.status}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr className="font-bold bg-slate-50 print:bg-transparent text-base">
                                <td colSpan={3} className="border border-slate-800 py-3 px-3 text-right uppercase">Mức độ đạt chuẩn chung (Overall Attainment):</td>
                                <td colSpan={2} className="border border-slate-800 py-3 px-3 text-center text-emerald-700 print:text-black font-extrabold text-lg">
                                    {overallAttainment}%
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Phần đánh giá năng lực & Kế hoạch phát triển */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-200">
                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Điểm mạnh năng lực
                            </h3>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                Năng lực thực hành lập trình tốt, chủ động ứng dụng công nghệ hiện đại (Java Spring Boot, React, Tailwind CSS) vào các dự án thực tế. Hoàn thành xuất sắc các mục tiêu làm việc nhóm và nghiên cứu khoa học.
                            </p>
                        </div>
                        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-600" /> Kế hoạch cải thiện
                            </h3>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                Tiếp tục trau dồi chuyên sâu các giải thuật khai phá dữ liệu (Data Mining) và tối ưu hóa hệ thống lớn, chuẩn bị sẵn sàng cho giai đoạn thực tập tốt nghiệp và mục tiêu nghề nghiệp sắp tới.
                            </p>
                        </div>
                    </div>

                    {/* Chữ ký */}
                    <div className="flex justify-between text-sm mt-10 px-4 md:px-8">
                        <div className="text-center">
                            <p className="font-semibold text-slate-700 mb-16">Sinh viên xác nhận</p>
                            <p className="text-slate-400 italic text-xs">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div className="text-center">
                            <p className="italic text-slate-500 mb-1 text-xs">TP. Hồ Chí Minh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                            <p className="font-bold uppercase text-slate-700 mb-16">Phòng Đào Tạo / Cố vấn học tập</p>
                            <p className="text-slate-400 italic text-xs">(Ký, đóng dấu)</p>
                        </div>
                    </div>

                </div>
            </div>
        </LMSLayout>
    );
}