import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {useNavigate, useParams} from 'react-router-dom';
import {
    Search,
    Eye,
    Clock,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter,
    Send
} from 'lucide-react';

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
    const {id} =useParams();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<AssessmentPaper[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter/search states
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Pagination
    const [currentPage, setPage] = useState(1);

    // Gọi đúng tên API cũ của bạn
    const loadData = async () => {
        try {
            setLoading(true);
            const response = await assessmentPaperApi.getAllExams();

            const rows = Array.isArray(response) ? response :
                Array.isArray(response?.data) ? response.data :
                    Array.isArray(response?.content) ? response.content : [];

            setAssessments(rows);
        } catch (error) {
            toast.error('Không thể tải danh sách đề thi');
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Hàm xử lý giao đề (Publish)
    const handlePublish = async (id: string) => {
        try {
            await assessmentPaperApi.publishExam(id);
            toast.success('Đã giao đề thành công cho sinh viên!');
            loadData();
        } catch {
            toast.error('Lỗi khi giao đề');
        }
    };

    // Filter logic
    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();

        return [...assessments]
            .filter((a) => {
                const s = a.status || 'DRAFT';
                if (statusFilter !== 'ALL' && s !== statusFilter) return false;

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

    // Reset pagination when filter changes
    useEffect(() => {
        setPage(1);
    }, [keyword, statusFilter]);

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    const formatDateTime = (iso?: string | null) => {
        if (!iso) return '--';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '--';
        return d.toLocaleString('vi-VN', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
    };

    const getStatusBadge = (status?: string | null) => {
        const s = status || 'DRAFT';
        switch (s) {
            case 'PUBLISHED':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-none px-2.5 py-0.5">Đã giao</Badge>;
            case 'DRAFT':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-medium px-2.5 py-0.5">Bản nháp</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-500 px-2.5 py-0.5">{s}</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Thanh Tiêu Đề */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Quản lý Đề thi</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý, tạo lập cấu trúc và giao đề thi cho sinh viên</p>
                </div>
            </div>

            {/* Khung Bộ Lọc & Tìm Kiếm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên đề, mã đề, kho câu hỏi..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-9 border-slate-200 focus-visible:ring-blue-500 h-10 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden xs:block" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="border-slate-200 focus:ring-blue-500 h-10 text-sm bg-white">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="DRAFT">Bản nháp</SelectItem>
                            <SelectItem value="PUBLISHED">Đã giao</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bảng Dữ Liệu Đề Thi */}
            <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Danh sách đề thi đã tạo ({filtered.length})
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/70">
                                <TableRow className="border-b border-slate-200">
                                    <TableHead className="font-semibold text-slate-700 pl-6 w-[5%]">STT</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[25%]">Tên đề thi & Mã</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[12%] text-center">Thời lượng</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[10%] text-center">Số câu</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[18%]">Thời gian mở - đóng</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[12%] text-center">Trạng thái</TableHead>
                                    <TableHead className="font-semibold text-slate-700 pr-6 text-center w-[18%]">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Đang tải danh sách đề thi...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16 text-slate-400 bg-slate-50/30">
                                            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                            <p className="font-medium text-slate-500">Không tìm thấy dữ liệu phù hợp</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedItems.map((x, idx) => {
                                        const isDraft = (x.status || 'DRAFT') === 'DRAFT';

                                        return (
                                            <TableRow
                                                key={x.id}
                                                className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                                            >
                                                <TableCell className="pl-6 align-middle font-medium text-slate-500">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-800 align-middle">
                                                    <div className="line-clamp-2 leading-snug">{x.examTitle || 'Chưa đặt tiêu đề'}</div>
                                                    <div className="text-[11px] font-mono text-slate-400 mt-1">ID: {x.id}</div>
                                                    {x.sourceQuestionBankId && (
                                                        <div className="text-[11px] text-blue-500 mt-0.5">Kho: {x.sourceQuestionBankId}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center align-middle font-medium text-slate-600">
                                                    <div className="inline-flex items-center justify-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{x.durationMinutes ? `${x.durationMinutes} p` : '--'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center align-middle font-medium text-slate-600">
                                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                        {x.questionIds?.length || 0}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="align-middle text-xs text-slate-600 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-emerald-600 font-semibold w-6">Từ:</span>
                                                        <span className="text-slate-700 font-medium">{formatDateTime(x.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-rose-600 font-semibold w-6">Đến:</span>
                                                        <span className="text-slate-700 font-medium">{formatDateTime(x.endTime)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle text-center">
                                                    {getStatusBadge(x.status)}
                                                </TableCell>
                                                <TableCell className="text-center pr-6 align-middle">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {isDraft && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 font-medium shadow-sm transition-all"
                                                                onClick={() => handlePublish(x.id)}
                                                                title="Giao đề thi cho sinh viên"
                                                            >
                                                                <Send className="h-3.5 w-3.5" />
                                                                <span className="hidden xl:inline">Giao đề</span>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg gap-1.5 font-medium"
                                                            onClick={() => navigate(`/teacher/course/${id}/exams/view-exam-list/${x.id}`)}
                                                            title="Xem chi tiết cấu trúc đề"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="hidden xl:inline">Chi tiết</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Phân Trang (Pagination) Đồng Bộ */}
                    <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500 font-medium">
                            Hiển thị trang <span className="text-slate-800 font-semibold">{currentPage}</span> / <span className="text-slate-800 font-semibold">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                disabled={currentPage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}