import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Users, ChevronLeft } from 'lucide-react';
import {gradingApi} from "@/api/GradingApi.ts";


type StudentGrade = {
    studentId: string;
    studentCode: string;
    studentName: string;
    score: number | '';
    feedback: string;
};

export default function TeacherGradingFinal() {

    const { id,  assessmentId } = useParams();


    const navigate = useNavigate();

    const [students, setStudents] = useState<StudentGrade[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSubmitting] = useState(false);

    const loadStudents = async () => {

        if (!id || !assessmentId) {
            toast.error("Thiếu thông tin lớp học hoặc bài thi!");
            return;
        }

        try {
            setLoading(true);

            const res = await gradingApi.getStudentsToGrade(id, assessmentId);


            const formattedStudents = res.map((student: any) => ({
                studentId: student.studentId,
                studentCode: student.studentCode || '--',
                studentName: student.studentName || 'Chưa cập nhật tên',
                score: student.score !== null && student.score !== undefined ? student.score : '',
                feedback: student.feedback || ''
            }));

            setStudents(formattedStudents);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            toast.error('Không thể tải danh sách sinh viên');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, [id, assessmentId]);

    // Xử lý khi Giảng viên gõ điểm
    const handleScoreChange = (studentId: string, value: string) => {
        setStudents(prev => prev.map(s => {
            if (s.studentId === studentId) {
                const scoreNum = parseFloat(value);
                return { ...s, score: (value === '' || isNaN(scoreNum)) ? '' : scoreNum };
            }
            return s;
        }));
    };

    // Xử lý khi Giảng viên gõ nhận xét
    const handleFeedbackChange = (studentId: string, value: string) => {
        setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, feedback: value } : s));
    };

    // Xử lý Lưu Bảng Điểm
    const handleSaveGrades = async () => {
        // Validate cơ bản (Điểm phải từ 0 -> 10)
        const invalidScore = students.find(s => s.score !== '' && (Number(s.score) < 0 || Number(s.score) > 10));
        if (invalidScore) {
            toast.error(`Điểm của sinh viên ${invalidScore.studentName} không hợp lệ (phải từ 0 - 10)`);
            return;
        }

        try {
            setSubmitting(true);
            // Chỉ lấy những sinh viên đã được nhập điểm
            const payload = students
                .filter(s => s.score !== '')
                .map(s => ({
                    studentId: s.studentId,
                    score: s.score,
                    feedback: s.feedback
                }));

            // Nếu không có ai được chấm điểm thì thông báo
            if (payload.length === 0) {
                toast.warning('Chưa có điểm nào được nhập!');
                return;
            }

            // Bỏ comment để gọi API lưu xuống DB
            await gradingApi.saveGrades({ examId: examId!, grades: payload });

            console.log("Dữ liệu gửi lên server:", payload);
            toast.success('Lưu bảng điểm thành công!');

            // Tải lại dữ liệu sau khi lưu thành công để đảm bảo đồng bộ
            await loadStudents();
        } catch (error) {
            console.error("Lỗi lưu điểm:", error);
            toast.error('Lỗi khi lưu bảng điểm');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Các phần giao diện (JSX) giữ nguyên như cũ... */}
            {/* Thanh Tiêu Đề */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-200">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                            Nhập Điểm Cuối Kỳ
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Cập nhật điểm và phản hồi trực tiếp cho sinh viên
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSaveGrades}
                    disabled={saving || loading}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Đang lưu...' : 'Lưu Bảng Điểm'}
                </Button>
            </div>

            {/* Bảng Nhập Điểm */}
            <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                    <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Danh sách Sinh viên ({students.length})
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/70">
                                <TableRow className="border-b border-slate-200">
                                    <TableHead className="font-semibold text-slate-700 pl-6 w-[5%]">STT</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[15%]">MSSV</TableHead>
                                    <TableHead className="font-semibold text-slate-700 w-[30%]">Họ và Tên</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-center w-[15%]">Điểm (Hệ 10)</TableHead>
                                    <TableHead className="font-semibold text-slate-700 pr-6 w-[35%]">Nhận xét (Feedback)</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Đang tải danh sách...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                            Không có sinh viên nào trong danh sách.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student, idx) => (
                                        <TableRow key={student.studentId} className="hover:bg-slate-50/80 border-b border-slate-100">
                                            <TableCell className="pl-6 align-middle text-slate-500 font-medium">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-600">
                                                {student.studentCode}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-800">
                                                {student.studentName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input
                                                    type="number"
                                                    min={0} max={10} step={0.5}
                                                    value={student.score}
                                                    onChange={(e) => handleScoreChange(student.studentId, e.target.value)}
                                                    className="w-24 mx-auto text-center font-semibold text-blue-700 border-slate-300 focus-visible:ring-blue-500"
                                                    placeholder="--"
                                                />
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <Input
                                                    type="text"
                                                    value={student.feedback}
                                                    onChange={(e) => handleFeedbackChange(student.studentId, e.target.value)}
                                                    placeholder="Ghi chú, nhận xét bài làm..."
                                                    className="w-full border-slate-200 focus-visible:ring-blue-500"
                                                />
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
    );
}