import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import {assessmentPaperApi} from "@/api/assessmentApi.ts";
import {assessmentPaperServiceApi} from "@/api/assementPaperApi.ts";

// TODO: đổi sang API thật của bạn

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
    selectedOptionIndex?: number; // trắc nghiệm
    textAnswer?: string; // tự luận/điền khuyết
};

export default function StudentTakeExamPage() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [examData, setExamData] = useState<StudentExamDetailResponse | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

    const currentQuestion = examData?.questions[currentIndex];


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
            toast.warning('Đã hết thời gian làm bài. Hệ thống đang nộp tự động...');
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

    const handleSubmitExam = async (autoSubmit = false) => {
        if (!examData || submitting) return;
        try {
            setSubmitting(true);

            const payload = {
                examId: examData.examId,
                answers: Object.values(answers),
                submittedAt: new Date().toISOString(),
                autoSubmit,
            };

            // TODO: API thật: submitStudentExam(payload)
            await assessmentPaperServiceApi.submitStudentExam(payload);

            toast.success(autoSubmit ? 'Đã tự động nộp bài.' : 'Nộp bài thành công!');
            navigate(`/student/exams/${examData.examId}/result`);
        } catch (e) {
            toast.error('Nộp bài thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-500 font-medium">Đang tải đề thi...</div>;
    }

    if (!examData) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy đề thi hoặc chưa đến thời gian làm bài.</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="border-b pb-5 border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-800 -ml-2"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Button>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{examData.examTitle}</h1>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Đang làm bài</Badge>
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            Học phần: <span className="font-semibold text-slate-700">{examData.courseCode} - {examData.courseName}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="py-3 px-4 flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-amber-600" />
                                <span className="font-semibold text-amber-700">{formatTime(remainingSeconds)}</span>
                            </CardContent>
                        </Card>

                        <Button
                            onClick={() => handleSubmitExam(false)}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {submitting ? 'Đang nộp...' : 'Nộp bài'}
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <Card>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Tiến độ làm bài</span>
                            <span className="font-semibold text-slate-800">
                {answeredCount}/{examData.questions.length} câu
              </span>
                        </div>
                        <Progress value={progress} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Danh sách số câu */}
                    <Card className="lg:col-span-3 h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Danh sách câu hỏi</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                            {examData.questions.map((q, idx) => {
                                const isAnswered =
                                    q.type === 'MULTIPLE_CHOICE'
                                        ? answers[q.id]?.selectedOptionIndex !== undefined
                                        : !!answers[q.id]?.textAnswer?.trim();

                                return (
                                    <Button
                                        key={q.id}
                                        variant={idx === currentIndex ? 'default' : 'outline'}
                                        className={`h-10 px-0 ${isAnswered ? 'ring-2 ring-emerald-200' : ''}`}
                                        onClick={() => setCurrentIndex(idx)}
                                    >
                                        {idx + 1}
                                    </Button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Nội dung câu hỏi */}
                    <Card className="lg:col-span-9">
                        <CardHeader className="border-b bg-slate-50/60">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-500" />
                                Câu {currentIndex + 1}
                                <Badge variant="outline" className="ml-2">{currentQuestion?.points} điểm</Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-4 md:p-6 space-y-5">
                            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                                {currentQuestion?.content}
                            </p>

                            {/* Trắc nghiệm */}
                            {currentQuestion?.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {currentQuestion.options.map((opt, idx) => {
                                        const selected = answers[currentQuestion.id]?.selectedOptionIndex === idx;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setMcqAnswer(currentQuestion.id, idx)}
                                                className={`text-left rounded-lg border p-3 transition ${
                                                    selected
                                                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                                {opt.content}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tự luận / điền khuyết */}
                            {(currentQuestion?.type === 'ESSAY' || currentQuestion?.type === 'SHORT_ANSWER') && (
                                <textarea
                                    className="w-full min-h-[220px] rounded-lg border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Nhập câu trả lời của bạn..."
                                    value={answers[currentQuestion.id]?.textAnswer || ''}
                                    onChange={(e) => setTextAnswer(currentQuestion.id, e.target.value)}
                                />
                            )}

                            <div className="pt-2 flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex((p) => p - 1)}
                                >
                                    Câu trước
                                </Button>

                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Nhớ kiểm tra lại trước khi nộp bài
                                </div>

                                <Button
                                    disabled={currentIndex === examData.questions.length - 1}
                                    onClick={() => setCurrentIndex((p) => p + 1)}
                                >
                                    Câu tiếp
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}