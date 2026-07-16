import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    FileText,
    Circle,
    CheckCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { assessmentPaperApi } from "@/api/assessmentApi.ts";
import { assessmentPaperServiceApi } from "@/api/assementPaperApi.ts";

type ExamQuestionDetail = {
    id: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
    options?: { id?: string; content: string }[];
    points: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
};

type StudentExamDetailResponse = {
    examId: string;
    examTitle: string;
    courseName: string;
    courseCode: string;
    durationMinutes: number;
    totalPoints: number;
    startedAt?: string;
    questions: ExamQuestionDetail[];
};

type AnswerState = {
    questionId: string;
    type: ExamQuestionDetail['type'];
    selectedOptionIndex?: number;
    textAnswer?: string;
};

export default function StudentTakeExamPage() {
    const { id,examId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [examData, setExamData] = useState<StudentExamDetailResponse | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

    const currentQuestion = examData?.questions[currentIndex];

    // Kiểm tra thời gian sắp hết (< 5 phút)
    const isTimeRunningOut = remainingSeconds > 0 && remainingSeconds <= 300;

    const loadExam = async () => {
        try {
            setLoading(true);
            const data = await assessmentPaperApi.getLecturerExamDetail(examId);
            setExamData(data);
            const total = data.durationMinutes * 60;
            setRemainingSeconds(total);
        } catch (e) {
            toast.error('Không thể tải đề thi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExam();
    }, [examId]);

    useEffect(() => {
        if (!examData) return;
        if (remainingSeconds <= 0) return;

        const timer = setInterval(() => {
            setRemainingSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [examData, remainingSeconds]);

    useEffect(() => {
        if (!examData) return;
        if (remainingSeconds === 0) {
            toast.warning('Đã hết thời gian làm bài. Hệ thống đang tự động nộp...');
            handleSubmitExam(true);
        }
    }, [remainingSeconds, examData]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const answeredCount = useMemo(() => {
        if (!examData) return 0;
        return examData.questions.filter((q) => {
            const a = answers[q.id];
            if (!a) return false;
            if (q.type === 'MULTIPLE_CHOICE') return a.selectedOptionIndex !== undefined;
            return !!a.textAnswer?.trim();
        }).length;
    }, [answers, examData]);

    const progress = examData ? (answeredCount / examData.questions.length) * 100 : 0;

    const setMcqAnswer = (questionId: string, index: number) => {
        const q = examData?.questions.find((x) => x.id === questionId);
        if (!q) return;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                questionId,
                type: q.type,
                selectedOptionIndex: index,
            },
        }));
    };

    const setTextAnswer = (questionId: string, value: string) => {
        const q = examData?.questions.find((x) => x.id === questionId);
        if (!q) return;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                questionId,
                type: q.type,
                textAnswer: value,
            },
        }));
    };

    // Trong file StudentTakeExamPage.tsx

    const handleSubmitExam = async (autoSubmit = false) => {
        if (!examData || submitting) return;

        // Nếu sinh viên tự bấm nộp mà chưa làm hết
        if (!autoSubmit && answeredCount < examData.questions.length) {
            const confirm = window.confirm(`Bạn mới trả lời ${answeredCount}/${examData.questions.length} câu. Bạn có chắc chắn muốn nộp bài?`);
            if (!confirm) return;
        }

        try {
            setSubmitting(true);
            const payload = {
                examId: examData.examId,
                answers: Object.values(answers),

                submittedAt: new Date().toISOString(),
                autoSubmit,
            };


            await assessmentPaperServiceApi.submitStudentExam(payload);

            toast.success(autoSubmit ? 'Đã tự động nộp bài.' : 'Nộp bài thành công!');


            navigate(`/course/${id}/my-exams/${examData.examId}/result`);

        } catch (e) {
            toast.error('Nộp bài thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Đang chuẩn bị đề thi...</p>
                </div>
            </div>
        );
    }

    if (!examData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md w-full shadow-lg">
                    <CardContent className="text-center py-10 space-y-4">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-slate-800">Không tìm thấy đề thi</h2>
                        <p className="text-slate-500">Đề thi này không tồn tại hoặc chưa đến thời gian làm bài.</p>
                        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang trước
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Navbar / Header Cố định (Sticky) */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{examData.examTitle}</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <BookOpen className="h-3 w-3" />
                                {examData.courseCode} - {examData.courseName}
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            Đang làm bài
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Timer Card */}
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md border font-mono text-lg transition-colors ${
                            isTimeRunningOut
                                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                            <Clock3 className={`h-4 w-4 ${isTimeRunningOut ? 'text-red-500' : 'text-slate-500'}`} />
                            {formatTime(remainingSeconds)}
                        </div>

                        <Button
                            onClick={() => handleSubmitExam(false)}
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                        >
                            {submitting ? (
                                <span className="flex items-center"><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang nộp...</span>
                            ) : (
                                <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Nộp bài</span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* BẢNG ĐIỀU HƯỚNG CÂU HỎI (Bên trái) */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
                        {/* Progress Card */}
                        <Card className="shadow-sm border-slate-200">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Tiến độ làm bài</span>
                                    <span className="font-bold text-blue-600">
                                        {answeredCount} / {examData.questions.length}
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2 bg-slate-100" />
                            </CardContent>
                        </Card>

                        {/* Question Grid Card */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <FileText className="h-4 w-4" /> Danh sách câu hỏi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2.5">
                                    {examData.questions.map((q, idx) => {
                                        const isAnswered =
                                            q.type === 'MULTIPLE_CHOICE'
                                                ? answers[q.id]?.selectedOptionIndex !== undefined
                                                : !!answers[q.id]?.textAnswer?.trim();

                                        const isCurrent = idx === currentIndex;

                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`
                                                    h-9 w-full rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center
                                                    ${isCurrent ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                                    : isAnswered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'}
                                                `}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Đang xem</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200"></div> Đã trả lời</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div> Chưa trả lời</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* KHUNG NỘI DUNG CÂU HỎI (Bên phải) */}
                    <Card className="lg:col-span-9 shadow-md border-slate-200 overflow-hidden">
                        <CardHeader className="border-b bg-white px-6 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                Câu hỏi {currentIndex + 1}
                            </CardTitle>
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium px-3 py-1">
                                {currentQuestion?.points} điểm
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8 space-y-8 bg-white min-h-[400px]">
                            {/* Nội dung đề */}
                            <div className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium">
                                {currentQuestion?.content}
                            </div>

                            {/* Khu vực trả lời Trắc nghiệm */}
                            {currentQuestion?.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                                <div className="space-y-3">
                                    {currentQuestion.options.map((opt, idx) => {
                                        const selected = answers[currentQuestion.id]?.selectedOptionIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setMcqAnswer(currentQuestion.id, idx)}
                                                className={`
                                                    group relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200
                                                    ${selected
                                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}
                                                `}
                                            >
                                                {/* Giả lập Radio button */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {selected ? (
                                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                    )}
                                                </div>

                                                <div className="flex-1 text-slate-700">
                                                    <span className="font-bold text-slate-900 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                                    <span className={`${selected ? 'text-blue-900 font-medium' : ''}`}>{opt.content}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Khu vực trả lời Tự luận / Điền khuyết */}
                            {(currentQuestion?.type === 'ESSAY' || currentQuestion?.type === 'SHORT_ANSWER') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Bài làm của bạn:</label>
                                    <textarea
                                        className="w-full min-h-[250px] rounded-xl border border-slate-300 p-4 text-base text-slate-800 outline-none transition-shadow focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-y shadow-inner"
                                        placeholder="Nhập câu trả lời chi tiết vào đây..."
                                        value={answers[currentQuestion.id]?.textAnswer || ''}
                                        onChange={(e) => setTextAnswer(currentQuestion.id, e.target.value)}
                                    />
                                </div>
                            )}
                        </CardContent>

                        {/* Footer - Navigation Buttons */}
                        <CardFooter className="bg-slate-50/80 border-t px-6 py-4 flex items-center justify-between">
                            <Button
                                variant="outline"
                                className="font-medium text-slate-600 hover:text-slate-900"
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex((p) => p - 1)}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại
                            </Button>

                            <Button
                                className="font-medium bg-slate-800 hover:bg-slate-900 text-white"
                                disabled={currentIndex === examData.questions.length - 1}
                                onClick={() => setCurrentIndex((p) => p + 1)}
                            >
                                Câu tiếp theo <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}