import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { assessmentPaperApi } from '@/api/assessmentApi';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

type AssessmentPaper = {
    id: string;
    assessmentId?: string | null;
    sourceQuestionBankId?: string | null;
    questionIds?: string[];
    status?: 'DRAFT' | 'PUBLISHED' | string | null;
    examTitle?: string | null;
    durationMinutes?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    createdAt?: string | null;
};

const PAGE_SIZE = 8;

export default function TeacherExamList() {
    const [assessments, setAssessments] = useState<AssessmentPaper[]>([]);
    const [loading, setLoading] = useState(false);

    // filter/search
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

    // pagination
    const [page, setPage] = useState(1);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            const response = await assessmentPaperApi.getAllExams();

            const rows =
                Array.isArray(response) ? response :
                    Array.isArray(response?.data) ? response.data :
                        Array.isArray(response?.content) ? response.content :
                            [];

            setAssessments(rows);
        } catch {
            toast.error('Không thể tải danh sách bài thi');
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssessments();
    }, []);

    const handlePublish = async (id: string) => {
        try {
            await assessmentPaperApi.publishExam(id);
            toast.success('Đã giao đề thành công cho sinh viên!');
            loadAssessments();
        } catch {
            toast.error('Lỗi khi giao đề');
        }
    };

    const formatDateTime = (iso?: string | null) => {
        if (!iso) return '--';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '--';
        return d.toLocaleString('vi-VN', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
    };

    const statusBadge = (status?: string | null) => {
        const s = status ?? 'DRAFT';
        if (s === 'PUBLISHED') {
            return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">Đã giao</span>;
        }
        if (s === 'DRAFT') {
            return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">Nháp</span>;
        }
        return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{s}</span>;
    };

    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();

        return [...assessments]
            .filter((a) => {
                if (statusFilter !== 'ALL' && (a.status ?? 'DRAFT') !== statusFilter) return false;

                if (!kw) return true;
                return (
                    (a.examTitle ?? '').toLowerCase().includes(kw) ||
                    (a.id ?? '').toLowerCase().includes(kw) ||
                    (a.sourceQuestionBankId ?? '').toLowerCase().includes(kw)
                );
            })
            .sort((a, b) => {
                const ta = new Date(a.createdAt ?? 0).getTime();
                const tb = new Date(b.createdAt ?? 0).getTime();
                return tb - ta;
            });
    }, [assessments, keyword, statusFilter]);

    // reset về trang 1 khi filter đổi
    useEffect(() => {
        setPage(1);
    }, [keyword, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageData = filtered.slice(start, start + PAGE_SIZE);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Danh sách đề thi của bạn</h1>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle>Đề thi đã tạo ({filtered.length})</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Toolbar giống style ảnh */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-9"
                                placeholder="Tìm theo tên đề, mã đề, kho câu hỏi..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>

                        <div className="w-full md:w-52">
                            <Select
                                value={statusFilter}
                                onValueChange={(v: 'ALL' | 'DRAFT' | 'PUBLISHED') => setStatusFilter(v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border shadow-lg z-50">
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="DRAFT">Nháp</SelectItem>
                                    <SelectItem value="PUBLISHED">Đã giao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-md ">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead>Tên đề thi</TableHead>
                                    <TableHead>Mã đề</TableHead>
                                    <TableHead>Kho câu hỏi</TableHead>
                                    <TableHead>Số câu</TableHead>
                                    <TableHead>Thời lượng</TableHead>
                                    <TableHead>Bắt đầu</TableHead>
                                    <TableHead>Kết thúc</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                            Đang tải dữ liệu...
                                        </TableCell>
                                    </TableRow>
                                ) : pageData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                            Không có dữ liệu phù hợp
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageData.map((a, idx) => {
                                        const isDraft = (a.status ?? 'DRAFT') === 'DRAFT';
                                        return (
                                            <TableRow key={a.id}>
                                                <TableCell>{start + idx + 1}</TableCell>
                                                <TableCell className="font-medium">{a.examTitle || 'Chưa đặt tên'}</TableCell>
                                                <TableCell>{a.id}</TableCell>
                                                <TableCell>{a.sourceQuestionBankId || '--'}</TableCell>
                                                <TableCell>{a.questionIds?.length ?? 0}</TableCell>
                                                <TableCell>{a.durationMinutes ?? '--'} phút</TableCell>
                                                <TableCell>{formatDateTime(a.startTime)}</TableCell>
                                                <TableCell>{formatDateTime(a.endTime)}</TableCell>
                                                <TableCell>{statusBadge(a.status)}</TableCell>
                                                <TableCell>
                                                    {isDraft ? (
                                                        <Button size="sm" onClick={() => handlePublish(a.id)}>
                                                            Giao đề
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" disabled>
                                                            Đã giao
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Trang {currentPage}/{totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}