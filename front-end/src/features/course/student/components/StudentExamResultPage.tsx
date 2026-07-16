import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { assessmentPaperApi } from "@/api/assessmentApi.ts";

type QuestionResult = {
    id: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
    options?: { id: string; content: string; correct: boolean }[];

    studentAnswer?: string | number;
    correctAnswer?: string;
    correct: boolean;
    points: number;

    maxPoints?: number;
};

type ExamResultResponse = {
    examTitle: string;
    score: number;
    totalPoints: number;
    totalQuestions: number;
    correctQuestions: number;
    details: QuestionResult[];
};

export default function StudentExamResultPage() {
    const { id, examId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState<ExamResultResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (!examId) return;
                const data = await assessmentPaperApi.getExamResult(examId);
                setResult(data);
            } catch {
                toast.error('Không thể tải kết quả bài thi');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [examId]);

    const percentage = useMemo(() => {
        if (!result || result.totalPoints <= 0) return 0;
        return (result.score / result.totalPoints) * 100;
    }, [result]);

    if (loading) return <div className="text-center py-20">Đang tải kết quả...</div>;
    if (!result) return <div className="text-center py-20">Không tìm thấy kết quả.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Summary Card */}
                <Card className="shadow-md border-t-4 border-t-blue-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl font-bold">Kết quả: {result.examTitle}</CardTitle>
                        <Button variant="ghost" onClick={() => navigate(`/course/${id}/my-exams`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Danh sách bài thi
                        </Button>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500">Tổng điểm</p>
                            <p className="text-3xl font-bold text-blue-600">{result.score}/{result.totalPoints}</p>
                        </div>

                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500">Số câu đúng</p>
                            <p className="text-3xl font-bold text-emerald-600">
                                {result.correctQuestions}/{result.totalQuestions}
                            </p>
                        </div>

                        <div className="col-span-2 md:col-span-2 flex items-center justify-center">
                            <Badge className={`px-6 py-2 text-lg ${percentage >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                {percentage >= 50 ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Details List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Chi tiết đáp án
                    </h3>

                    {result.details.map((q, idx) => {
                        const studentAnswerText =
                            typeof q.studentAnswer === 'number'
                                ? `Lựa chọn ${String.fromCharCode(65 + q.studentAnswer)}`
                                : (q.studentAnswer ?? 'Chưa trả lời');

                        return (
                            <Card key={q.id} className={q.correct ? 'border-emerald-200' : 'border-red-200'}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <p className="font-medium text-slate-800">Câu {idx + 1}: {q.content}</p>
                                        {q.correct ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                <CheckCircle2 className="mr-1 h-3 w-3" /> Đúng
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                <XCircle className="mr-1 h-3 w-3" /> Sai
                                            </Badge>
                                        )}
                                    </div>

                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-2 text-sm">
                                            {q.options?.map((opt, oIdx) => {
                                                const isStudentPick =
                                                    (typeof q.studentAnswer === 'number' && q.studentAnswer === oIdx) ||
                                                    (typeof q.studentAnswer === 'string' && q.studentAnswer === opt.id);

                                                return (
                                                    <div
                                                        key={opt.id}
                                                        className={`p-3 rounded-md border ${
                                                            opt.correct
                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                : isStudentPick
                                                                    ? 'bg-red-50 border-red-200'
                                                                    : 'bg-white border-slate-200'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + oIdx)}. {opt.content}
                                                        {opt.correct && (
                                                            <span className="ml-2 font-bold text-emerald-700">(Đáp án đúng)</span>
                                                        )}
                                                        {isStudentPick && (
                                                            <span className="ml-2 font-semibold text-blue-700">(Bạn đã chọn)</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {(q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') && (
                                        <div className="space-y-2 text-sm">
                                            <div className="p-3 rounded-md border border-slate-200 bg-white">
                                                <p className="font-semibold text-slate-700 mb-1">Bài làm của bạn:</p>
                                                <p className="text-slate-700 whitespace-pre-line">
                                                    {String(q.studentAnswer ?? 'Chưa trả lời')}
                                                </p>
                                            </div>

                                            {q.correctAnswer && (
                                                <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50">
                                                    <p className="font-semibold text-emerald-800 mb-1">Đáp án tham khảo:</p>
                                                    <p className="text-emerald-900 whitespace-pre-line">{q.correctAnswer}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-sm text-slate-600 pt-2 border-t mt-2">
                                        <span className="font-semibold">Điểm:</span>{' '}
                                        {q.maxPoints !== undefined ? `${q.points}/${q.maxPoints}` : q.points}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}