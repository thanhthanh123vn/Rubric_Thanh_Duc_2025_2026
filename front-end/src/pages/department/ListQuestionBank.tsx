import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getAllClo } from '@/features/rubric/rubricApi.ts';
import { questionApi } from "@/api/questionApi.ts";
import { useParams } from "react-router-dom";

export default function ListQuestionBank() {
    const { id } = useParams();
    const [sharedQuestions, setSharedQuestions] = useState<any[]>([]);
    const [cloItems, setCloItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterClo, setFilterClo] = useState('all');

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const resQuestions = await questionApi.getPublicDepartmentQuestions(id);
                setSharedQuestions(resQuestions || []);

                const resClos = await getAllClo();
                setCloItems(resClos.data || []);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
                toast.error("Không thể tải kho câu hỏi chung.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchInitialData();
        }
    }, [id]);


    const filteredQuestions = sharedQuestions.filter(q => {
        const contentText = q.content || "";
        const matchSearch = contentText.toLowerCase().includes(searchTerm.toLowerCase());

        const matchDifficulty = filterDifficulty !== 'all' ? q.difficulty === filterDifficulty : true;

        const matchClo = filterClo !== 'all'
            ? q.clos?.some((c: any) => {
            const code = typeof c === 'string' ? c : c.cloCode;
            return code === filterClo;
        }) || q.cloIds?.some((c: any) => c === filterClo)
            : true;

        return matchSearch && matchDifficulty && matchClo;
    });

    return (
        <div className="space-y-6 mt-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
                {/* Header đồng bộ chuẩn với style dự án */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Kho câu hỏi dùng chung</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Tất cả câu hỏi được chia sẻ công khai bởi các giảng viên trong môn học này.
                    </p>
                </div>

                <div className="p-4 sm:p-6">
                    {/* THANH TÌM KIẾM VÀ BỘ LỌC - UPDATE GIỐNG TIÊU CHUẨN TEACHER QUESTION BANK */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                            <Input
                                placeholder="Tìm kiếm nội dung câu hỏi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-500 bg-white"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                className="h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-slate-700 sm:min-w-[160px]"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="">Tất cả độ khó</option>
                                <option value="EASY">Dễ</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HARD">Khó</option>
                            </select>

                            <select
                                className="h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-slate-700 sm:min-w-[160px]"
                                value={filterClo}
                                onChange={(e) => setFilterClo(e.target.value)}
                            >
                                <option value="">Tất cả CĐR</option>
                                {cloItems.map((clo) => (
                                    <option key={clo.cloCode} value={clo.cloCode}>
                                        {clo.cloCode}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* DANH SÁCH BẢNG HIỂN THỊ */}
                    <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-inner">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                                    <TableHead className="w-[55%] font-semibold text-slate-700 pl-6 h-11">Nội dung câu
                                        hỏi</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-11">Loại</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-11">Độ khó</TableHead>
                                    <TableHead className="font-semibold text-slate-700 h-11 pr-6">CĐR (CLO)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Đang tải dữ liệu kho câu hỏi...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredQuestions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic">
                                            Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredQuestions.map((q) => (
                                        <TableRow key={q.id} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors group">
                                            <TableCell className="pl-6 py-4">
                                                <div
                                                    className="font-medium text-slate-700 line-clamp-2 text-sm leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: q.content || '' }}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium whitespace-nowrap">
                                                    {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge
                                                    variant={q.difficulty === 'EASY' ? 'secondary' : q.difficulty === 'HARD' ? 'destructive' : 'default'}
                                                    className="whitespace-nowrap font-medium"
                                                >
                                                    {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {q.cloIds && q.cloIds.length > 0 ? (
                                                        q.cloIds.map((cloItem: any, index: number) => (
                                                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 font-medium shadow-none">
                                                                {cloItem}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">--</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>
        </div>
    );
}