import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Calendar,
    Clock,
    BookOpen,
    FileText,
    Check,
    HelpCircle,
    User,
    BarChart3,
    Edit3,
    Download
} from 'lucide-react';

import {assessmentPaperApi} from "@/api/assessmentApi.ts";


export type ExamQuestionDetail = {
    id: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
    options?: { id: string; content: string; correct: boolean }[];
    correctOptionIndex?: number;
    points: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    cloCode?: string[];
};

// Định nghĩa kiểu dữ liệu mẫu cho sinh viên làm bài
export type StudentSubmissionRow = {
    studentId: string;
    studentCode: string;
    studentName: string;
    classCode: string;
    submitTime: string;
    score: number;
    status: 'GRADED' | 'PENDING' | 'NOT_SUBMITTED';
};

// Kiểu dữ liệu tổng thể của đề thi
export type LecturerExamDetailResponse = {
    examId: string;
    examTitle: string;
    courseName: string;
    courseCode: string;
    durationMinutes: number;
    totalPoints: number;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    createdAt: string;
    questions: ExamQuestionDetail[];
    submissions: StudentSubmissionRow[];
};

export default function LecturerExamDetailPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [examData, setExamData] = useState<LecturerExamDetailResponse | null>(null);


    const loadExamDetail = async () => {
        try {
            setLoading(true);

             const data = await assessmentPaperApi.getLecturerExamDetail(examId);



            setExamData(data);
        } catch (error) {
            toast.error('Không thể tải chi tiết đề thi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExamDetail();
    }, [examId]);

    const fmtDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleString('vi-VN', { hour12: false }) : '--';

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'ACTIVE': return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Đang mở thi</Badge>;
            case 'DRAFT': return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Bản nháp</Badge>;
            case 'ARCHIVED': return <Badge variant="outline" className="text-slate-500">Đã lưu trữ</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDifficultyBadge = (level: string) => {
        switch(level) {
            case 'EASY': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50">Dễ</Badge>;
            case 'MEDIUM': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50">Trung bình</Badge>;
            case 'HARD': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50">Khó</Badge>;
            default: return null;
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-500 font-medium">Đang tải chi tiết đề thi...</div>;
    }

    if (!examData) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy thông tin đề thi này.</p>
                <Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Button>
            </div>
        );
    }
    const handleExportExam = () => {
        if (!examData) return;

        // Mở một cửa sổ trình duyệt ẩn tạm thời
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Vui lòng cho phép popup trên trình duyệt để xuất PDF');
            return;
        }

        // Tạo cấu trúc HTML chuẩn A4 cho đề thi
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Đề thi - ${examData.courseName}</title>
                <style>
                    /* CSS định dạng trang in chuẩn A4 */
                    @page { size: A4; margin: 20mm; }
                    body { 
                        font-family: 'Times New Roman', Times, serif; 
                        font-size: 12pt; 
                        line-height: 1.5; 
                        color: #000; 
                        margin: 0;
                        padding: 0;
                    }
                    .header-container {
                        display: flex;
                        justify-content: space-between;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .header-left, .header-right { width: 48%; }
                    .header-right { font-weight: bold; }
                    .title {
                        text-align: center;
                        font-size: 16pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 20px 0;
                    }
                    .exam-info {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        font-weight: bold;
                    }
                    .question {
                        margin-bottom: 15px;
                        page-break-inside: avoid; /* Tránh việc câu hỏi bị cắt nửa giữa 2 trang */
                    }
                    .question-content {
                        font-weight: bold;
                        margin-bottom: 5px;
                        text-align: justify;
                    }
                    .options {
                        margin-left: 20px;
                        display: grid;
                        grid-template-columns: 1fr 1fr; /* Chia 2 cột cho đáp án A B C D */
                        gap: 5px 15px;
                    }
                    .option { margin-bottom: 3px; }
                    .essay-space { height: 150px; } /* Khoảng trống cho câu tự luận */
                    .end-mark {
                        text-align: center;
                        font-weight: bold;
                        margin-top: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="header-left">
                        <div>TRƯỜNG ĐẠI HỌC NÔNG LÂM TP.HCM</div>
                        <div style="font-weight: bold; text-decoration: underline;">KHOA CÔNG NGHỆ THÔNG TIN</div>
                    </div>
                    <div class="header-right">
                        <div>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                        <div style="text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</div>
                    </div>
                </div>

                <div class="title">${examData.examTitle}</div>

                <div class="exam-info">
                    <div>Học phần: ${examData.courseName} </div>
                    <div>Thời gian làm bài: ${examData.durationMinutes} phút</div>
                </div>

                <div class="questions">
                    ${examData.questions.map((q, index) => `
                        <div class="question">
                            <div class="question-content">
                                Câu ${index + 1} (${q.points} điểm): ${q.content}
                            </div>
                            ${q.type === 'MULTIPLE_CHOICE' && q.options ? `
                                <div class="options">
                                ${q.options.map((opt, oIdx) => `
                                <div class="option" >
                                    <strong>${String.fromCharCode(65 + oIdx)}.</strong>
                                    ${opt.content}
                                
                                </div>
                            `).join('')}
                                </div>
                            ` : `
                                <div class="essay-space"></div>
                            `}
                        </div>
                    `).join('')}
                </div>

                <div class="end-mark">--- HẾT ---</div>

                <script>
                    // Tự động bật hộp thoại in khi load xong
                    window.onload = () => {
                        window.print();
                        // Tùy chọn: tự động đóng tab sau khi in xong
                        setTimeout(() => window.close(), 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };
    // Tính toán một số thống kê nhanh
    const totalStudents = examData.submissions.length;
    const gradedStudents = examData.submissions.filter(s => s.status === 'GRADED').length;
    const avgScore = gradedStudents > 0
        ? (examData.submissions.filter(s => s.status === 'GRADED').reduce((acc, curr) => acc + curr.score, 0) / gradedStudents).toFixed(2)
        : '--';

    return (
        <div id="exam-content" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar điều hướng */}
            {/*<aside className="hidden md:block w-64 shrink-0 border-r bg-white h-screen sticky top-0 overflow-y-auto">*/}
            {/*    <Sidebar />*/}
            {/*</aside>*/}

            {/* Khung nội dung chính */}
            <main className="flex-1 min-w-0 flex flex-col w-full">
                {/*<Header />*/}

                <div className="p-4 md:p-6 space-y-6 flex-1">
                    {/* Nút quay lại & Tiêu đề chính */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b pb-5 border-slate-200">
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-800 -ml-2"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                            </Button>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{examData.examTitle}</h1>
                                {getStatusBadge(examData.status)}
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400" /> Học phần: <span className="font-semibold text-slate-700">{examData.courseCode} - {examData.courseName}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <Button size="sm" variant="outline" onClick={handleExportExam}>
                                <Download className="mr-2 h-4 w-4" /> Xuất đề thi
                            </Button>
                            {examData.status === 'DRAFT' && (
                                <Button size="sm" onClick={() => navigate(`/teacher/exams/${examData.examId}/edit`)}>
                                    <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Khối thống kê nhanh dạng Grid Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><HelpCircle className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Số câu hỏi</p>
                                    <p className="text-xl font-bold text-slate-800">{examData.questions.length} câu</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Thời lượng</p>
                                    <p className="text-xl font-bold text-slate-800">{examData.durationMinutes} phút</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><User className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Đã nộp / Tổng số</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {examData.submissions.filter(s => s.status !== 'NOT_SUBMITTED').length} / {totalStudents} SV
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><BarChart3 className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase">Điểm trung bình</p>
                                    <p className="text-xl font-bold text-slate-800">{avgScore} <span className="text-xs text-slate-400">/{examData.totalPoints}</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Phân vùng Tabs xem chi tiết */}
                    <Tabs defaultValue="questions" className="w-full space-y-4">
                        <TabsList className="bg-slate-200/60 p-1 rounded-lg flex gap-2">
                            <TabsTrigger
                                value="questions"
                                className="
            flex items-center gap-2 rounded-md
            data-[state=active]:bg-emerald-50
            data-[state=active]:text-emerald-700
            data-[state=active]:shadow-sm
        "
                            >
                                <FileText className="h-4 w-4" />
                                Cấu trúc & Nội dung câu hỏi
                            </TabsTrigger>

                            <TabsTrigger
                                value="students"
                                className="
                                        flex items-center gap-2 rounded-md
                                        data-[state=active]:bg-emerald-50
                                        data-[state=active]:text-emerald-700
                                        data-[state=active]:shadow-sm
                                    "
                            >
                                <User className="h-4 w-4" />
                                Kết quả & Điểm số sinh viên
                            </TabsTrigger>
                        </TabsList>

                        {/* CONTENT TAB 1: DANH SÁCH CÂU HỎI */}
                        <TabsContent value="questions" className="space-y-4 outline-none">
                            {examData.questions.map((q, idx) => (
                                <Card key={q.id} className="shadow-sm border-slate-200 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 py-3 flex flex-row flex-wrap items-center justify-between gap-2 border-b">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm text-slate-700 bg-slate-200 px-2.5 py-1 rounded-md">Câu {idx + 1}</span>
                                            <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                                                {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : q.type === 'ESSAY' ? 'Tự luận' : 'Điền khuyết'}
                                            </span>
                                            {q.cloCode?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {q.cloCode.map((clo, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="bg-indigo-50 text-indigo-700 border-indigo-200"
                                                            variant="outline"
                                                        >
                                                            {clo}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getDifficultyBadge(q.difficulty)}
                                            <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{q.points} điểm</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-6 space-y-4">
                                        {/* Nội dung câu hỏi */}
                                        <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{q.content}</p>

                                        {/* Hiển thị các phương án nếu là trắc nghiệm */}
                                        {q.type === "MULTIPLE_CHOICE" && q.options && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                {q.options.map((opt, oIdx) => {
                                                    const isCorrect = opt.correct;

                                                    return (
                                                        <div
                                                            key={oIdx}
                                                            className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors ${
                                                                isCorrect
                                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                                                                    : "bg-white border-slate-200 text-slate-600"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${
                                                                    isCorrect
                                                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                                                        : "bg-slate-100 border-slate-300 text-slate-600"
                                                                }`}
                                                            >
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </span>

                                                            <div className="flex-1 pt-0.5">
                                                                {opt.content}
                                                            </div>

                                                            {isCorrect && (
                                                                <Check className="h-4 w-4 text-emerald-600 shrink-0 self-center" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Gợi ý đáp án nếu là Tự luận */}
                                        {q.type === 'ESSAY' && (
                                            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                                                <span className="font-semibold text-slate-700 block mb-1">💡 Tiêu chí chấm điểm / Hướng dẫn:</span>
                                                Sinh viên cần trình bày rõ ràng lý thuyết cốt lõi, lấy ví dụ thực tế liên quan (Tham khảo ma trận Rubric đi kèm môn học).
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        {/* CONTENT TAB 2: KẾT QUẢ LÀM BÀI CỦA SINH VIÊN */}
                        <TabsContent value="students" className="outline-none">
                            <Card className="shadow-sm border-slate-200 overflow-hidden">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>Bảng điểm sinh viên</span>
                                        <span className="text-sm font-normal text-slate-400">Tổng số: {totalStudents} sinh viên</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="w-[15%]">MSSV</TableHead>
                                                    <TableHead className="w-[25%]">Họ và Tên</TableHead>
                                                    <TableHead className="w-[15%]">Lớp danh nghĩa</TableHead>
                                                    <TableHead className="w-[20%]">Thời gian nộp</TableHead>
                                                    <TableHead className="w-[12%]">Trạng thái</TableHead>
                                                    <TableHead className="text-right w-[13%]">Điểm số</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {examData.submissions.map((student) => (
                                                    <TableRow key={student.studentId} className="hover:bg-slate-50/80">
                                                        <TableCell className="font-semibold text-slate-700">{student.studentCode}</TableCell>
                                                        <TableCell className="font-medium text-slate-800">{student.studentName}</TableCell>
                                                        <TableCell>{student.classCode}</TableCell>
                                                        <TableCell className="text-slate-500 text-xs">{fmtDate(student.submitTime)}</TableCell>
                                                        <TableCell>
                                                            {student.status === 'GRADED' && (
                                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Đã chấm</Badge>
                                                            )}
                                                            {student.status === 'PENDING' && (
                                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none animate-pulse">Chờ chấm</Badge>
                                                            )}
                                                            {student.status === 'NOT_SUBMITTED' && (
                                                                <Badge variant="secondary" className="text-slate-400 bg-slate-100">Chưa làm bài</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-base">
                                                            {student.status === 'GRADED' ? (
                                                                <span className="text-slate-800">{student.score}</span>
                                                            ) : (
                                                                <span className="text-slate-300">--</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}