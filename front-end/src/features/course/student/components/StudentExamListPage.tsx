import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentPaperApi } from '@/api/assessmentApi.ts';
import Sidebar from '@/features/course/student/components/Sidebar.tsx';
import Header from '@/components/home/Header.tsx';

export type StudentAssignedExamResponse = {
    assignmentId: string;
    assessmentPaperId: string;
    examTitle: string;
    durationMinutes: number;
    questionCount: number;
    startTime: string;
    endTime: string;
    status: string;
};

export default function StudentExamListPage() {
    const { id } = useParams();
    const [rows, setRows] = useState<StudentAssignedExamResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await assessmentPaperApi.getStudentAssignedExams(id);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách bài thi');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const filtered = useMemo(
        () => rows.filter(x => (x.examTitle || '').toLowerCase().includes(keyword.toLowerCase())),
        [rows, keyword]
    );

    const fmt = (iso?: string) =>
        iso ? new Date(iso).toLocaleString('vi-VN', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }) : '--';

    const canStart = (x: StudentAssignedExamResponse) => {
        const now = Date.now();
        const st = new Date(x.startTime).getTime();
        const et = new Date(x.endTime).getTime();
        return now >= st && now <= et && (x.status === 'NOT_STARTED' || x.status === 'IN_PROGRESS');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex">
                {/* Sidebar trái */}
                <aside className="w-64 shrink-0 border-r bg-white min-h-screen">
                    <Sidebar />
                </aside>

                {/* Main phải */}
                <main className="flex-1 min-w-0">
                    <Header />

                    <div className="p-4 md:p-6 space-y-4">
                        <h1 className="text-2xl font-bold">Bài thi được giao</h1>

                        <Card>
                            <CardHeader>
                                <CardTitle>Danh sách bài thi ({filtered.length})</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Tìm theo tên đề..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tên đề thi</TableHead>
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
                                                    <TableCell colSpan={7} className="text-center py-6">Đang tải...</TableCell>
                                                </TableRow>
                                            ) : filtered.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-6">Chưa có bài thi nào</TableCell>
                                                </TableRow>
                                            ) : (
                                                filtered.map((x) => (
                                                    <TableRow key={x.assignmentId}>
                                                        <TableCell className="font-medium">{x.examTitle}</TableCell>
                                                        <TableCell>{x.questionCount}</TableCell>
                                                        <TableCell>{x.durationMinutes} phút</TableCell>
                                                        <TableCell>{fmt(x.startTime)}</TableCell>
                                                        <TableCell>{fmt(x.endTime)}</TableCell>
                                                        <TableCell>{x.status}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                disabled={!canStart(x)}
                                                                onClick={() => navigate(`/student/exams/${x.assignmentId}`)}
                                                            >
                                                                Vào làm bài
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}