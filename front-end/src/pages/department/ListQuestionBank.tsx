import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, CheckCircle2, Circle, Edit, Globe, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { questionApi, type Question } from '@/api/questionApi.ts';
import {DepquestionBankApi, questionBankApi, type QuestionBankResponse} from '@/api/QuestionBankApi.ts';
import { getAllClo } from '@/features/rubric/rubricApi.ts';
import DepartmentHeadLayout from "@/pages/department/DepartmentHeadLayout.tsx";
import {Switch} from "@radix-ui/react-switch";

interface AnswerOption {
    content: string;
    isCorrect: boolean;
}

interface Clo {
    cloId: string;
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
}

function getPermissionLabel(permission: string) {
    if (permission === 'VIEW') return 'Xem';
    if (permission === 'EDIT') return 'Chỉnh sửa';
    if (permission === 'IMPORT') return 'Import';
    return permission;
}

export default function ListQuestionBank() {
    const { id } = useParams();
// State cho Tab và dữ liệu Kho chung
    const [activeTab, setActiveTab] = useState<'my-banks' | 'shared-questions'>('my-banks');
    const [sharedQuestions, setSharedQuestions] = useState<Question[]>([]);
    const [isLoadingShared, setIsLoadingShared] = useState(false);

    // Effect gọi API khi chuyển sang Tab Kho chung
    useEffect(() => {
        if (activeTab === 'shared-questions' && id) {
            fetchSharedQuestions();
        }
    }, [activeTab, id]);

    const fetchSharedQuestions = async () => {
        setIsLoadingShared(true);
        try {
            const res = await DepquestionBankApi.getQuestionBanksByCourse(id!);
            setSharedQuestions(res);

        } catch (error) {
            toast.error("Không thể tải kho câu hỏi chung của môn học.");
            console.error(error);
        } finally {
            setIsLoadingShared(false);
        }
    };


    return (

            <div className="flex flex-col space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Ngân hàng câu hỏi</h1>
                        <p className="text-sm text-slate-500">Quản lý và chia sẻ câu hỏi trong môn học</p>
                    </div>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex border-b border-slate-200">
                    <button
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'my-banks'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                        onClick={() => setActiveTab('my-banks')}
                    >
                        <BookOpen className="inline-block w-4 h-4 mr-2" />
                        Ngân hàng của tôi
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                            activeTab === 'shared-questions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                        onClick={() => setActiveTab('shared-questions')}
                    >
                        <Globe className="inline-block w-4 h-4 mr-2" />
                        Kho câu hỏi môn học
                    </button>
                </div>

                {/* NỘI DUNG TAB */}
                {activeTab === 'my-banks' ? (
                    // ----------------------------------------------------
                    // TOÀN BỘ GIAO DIỆN CŨ CỦA BẠN (Danh sách Bank) ĐỂ Ở ĐÂY
                    // ----------------------------------------------------
                    <div className="space-y-4">
                        {/* Đoạn Card chứa danh sách question banks cũ của bạn */}
                    </div>
                ) : (
                    // ----------------------------------------------------
                    // GIAO DIỆN MỚI HIỂN THỊ KHO CÂU HỎI CHUNG (Dạng Bảng)
                    // ----------------------------------------------------
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Tất cả câu hỏi được chia sẻ</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input placeholder="Tìm kiếm câu hỏi..." className="pl-9 h-9" />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">Nội dung câu hỏi</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Độ khó</TableHead>
                                        <TableHead>CĐR (CLO)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingShared ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                                Đang tải dữ liệu...
                                            </TableCell>
                                        </TableRow>
                                    ) : sharedQuestions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                                Chưa có câu hỏi nào được chia sẻ trong môn học này.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sharedQuestions.map((q, index) => (
                                            <TableRow key={q.id || index}>
                                                <TableCell className="font-medium text-slate-700">
                                                    <div dangerouslySetInnerHTML={{ __html: q.content }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={q.difficulty === 'EASY' ? 'secondary' : q.difficulty === 'HARD' ? 'destructive' : 'default'}>
                                                        {q.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Map CLO Ids ra đây tương tự như cách bạn làm ở bảng TeacherQuestionBank */}
                                                    <div className="flex flex-wrap gap-1">
                                                        {q.cloIds && q.cloIds.length > 0 ? (
                                                            q.cloIds.map(clo => <Badge key={clo} variant="secondary">{clo}</Badge>)
                                                        ) : (
                                                            <span className="text-slate-400 italic text-xs">--</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}



            </div>

    )
}
