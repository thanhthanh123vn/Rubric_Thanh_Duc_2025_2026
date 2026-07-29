import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, FileText } from 'lucide-react';
import { assessmentPaperApi } from "@/api/assessmentApi.ts";

type QuestionResult = {
    id: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
    options?: { id: string; content: string; correct?: boolean }[];

    studentAnswer?: string | number;
    points: number;
    maxPoints?: number;
};

type ExamResultResponse = {
    examTitle: string;
    score: number;
    totalPoints: number;
    totalQuestions: number;
    details: QuestionResult[];
};

export default function StudentExamSubmittedPage() {
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

    if (loading) return <div className="text-center py-20">Đang tải kết quả...</div>;
    if (!result) return <div className="text-center py-20">Không tìm thấy kết quả.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Summary Card */}
                <Card className="shadow-md border-t-4 border-t-blue-600">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl font-bold">Đã nộp bài: {result.examTitle}</CardTitle>
                        <Button variant="ghost" onClick={() => navigate(`/course/${id}/my-exams`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Danh sách bài thi
                        </Button>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500">Tổng điểm tạm tính</p>
                            <p className="text-3xl font-bold text-blue-600">{result.score}/{result.totalPoints}</p>
                        </div>

                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500">Tổng số câu hỏi</p>
                            <p className="text-3xl font-bold text-slate-700">{result.totalQuestions}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Details List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Chi tiết bài làm của bạn
                    </h3>

                    {result.details.map((q, idx) => {
                        return (
                            <Card key={q.id} className="border-slate-200">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <p className="font-medium text-slate-800">Câu {idx + 1}: {q.content}</p>
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
                                                        className={`p-3 rounded-md border flex items-center justify-between ${
                                                            isStudentPick
                                                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                                                                : 'bg-white border-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        <div>
                                                            <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                                                            {opt.content}
                                                        </div>
                                                        {isStudentPick && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                                                Lựa chọn của bạn
                                                            </span>
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
                                        </div>
                                    )}

                                    {/*<div className="text-sm text-slate-600 pt-2 border-t mt-2 flex justify-between items-center">*/}
                                    {/*    <span>Điểm đạt được:</span>*/}
                                    {/*    <span className="font-semibold">*/}
                                    {/*        {q.maxPoints !== undefined ? `${q.points}/${q.maxPoints}` : q.points} điểm*/}
                                    {/*    </span>*/}
                                    {/*</div>*/}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}