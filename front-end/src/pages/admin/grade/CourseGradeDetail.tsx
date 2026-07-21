import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import {courseService} from "@/features/course/courseApi.ts";

type GradebookStudent = {
    studentId: string;
    studentName: string;
    attendanceScore: number | null;
    assignmentScore: number | null;
    componentScore: number | null;
    examScore: number | null;
    finalScore: number | null;
    letterGrade?: string;
};

type CourseGradebook = {
    offeringId: string;
    attendanceWeight: number;
    assignmentWeight: number;
    componentWeight: number;
    examWeight: number;
    students: GradebookStudent[];
};

export default function CourseGradeDetail() {
    const { offeringId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [gradebook, setGradebook] = useState<CourseGradebook | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!offeringId) return;
            try {
                setLoading(true);


                const data = await courseService.getGradebook(offeringId);
                setGradebook(data);
            } catch (e) {
                toast.error("Không thể tải bảng điểm");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [offeringId]);

    const students = gradebook?.students || [];
    const parseScore = (value?: number | null) => {
        if (value === null || value === undefined) return null;
        const score = Number(value);
        return Number.isFinite(score) ? Math.round(score * 10) / 10 : null;
    };

    const calcTotalLikeTeacherEntry = (
        student: {
            attendanceScore?: number | null;
            assignmentScore?: number | null;
            examScore?: number | null;
        },
        gradebook: {
            attendanceWeight?: number | null;
            assignmentWeight?: number | null;
            examWeight?: number | null;
        } | null
    ) => {
        if (!gradebook) return "--";

        const attendance = parseScore(student.attendanceScore);
        const assignment = parseScore(student.assignmentScore);
        const exam = parseScore(student.examScore);

        // giống TeacherGradeEntry: thiếu 1 cột là không tính
        if (attendance === null || assignment === null || exam === null) return "--";

        const attendanceWeight = Number(gradebook.attendanceWeight ?? 0);
        const assignmentWeight = Number(gradebook.assignmentWeight ?? 0);
        const examWeight = Number(gradebook.examWeight ?? 0);

        return (
            (attendance * attendanceWeight +
                assignment * assignmentWeight +
                exam * examWeight) /
            100
        ).toFixed(1);
    };
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Bảng điểm khóa học</h2>
                    <p className="text-slate-500 text-sm mt-1">Mã lớp HP: {offeringId}</p>
                    {gradebook && (
                        <p className="text-xs text-slate-500 mt-1">
                            Trọng số: CC {gradebook.attendanceWeight}% • BT {gradebook.assignmentWeight}% • TP {gradebook.componentWeight}% • CK {gradebook.examWeight}%
                        </p>
                    )}
                </div>
                <Button variant="outline" onClick={() => navigate("/admin/grades")} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">MSSV</th>
                        <th className="px-6 py-4">Họ tên</th>
                        <th className="px-6 py-4">Chuyên cần</th>
                        <th className="px-6 py-4">Bài tập</th>
                        <th className="px-6 py-4">Điểm Thành phần</th>
                        <th className="px-6 py-4">Cuối kỳ</th>
                        <th className="px-6 py-4">Tổng kết</th>
                        <th className="px-6 py-4">Điểm chữ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                            </td>
                        </tr>
                    ) : students.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-10 text-slate-400">
                                Chưa có dữ liệu điểm.
                            </td>
                        </tr>
                    ) : (
                        students.map((s) => (
                            <tr key={s.studentId} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{s.studentId}</td>
                                <td className="px-6 py-4">{s.fullName}</td>
                                <td className="px-6 py-4">{s.attendanceScore ?? "-"}</td>
                                <td className="px-6 py-4">{s.assignmentScore ?? "-"}</td>
                                <td className="px-6 py-4">{s.componentScore ?? "-"}</td>
                                <td className="px-6 py-4">{s.examScore ?? "-"}</td>
                                <td className="px-6 py-4 font-semibold">
                                    {calcTotalLikeTeacherEntry(s, gradebook) ?? "-"}
                                </td>
                                <td className="px-6 py-4">{s.letterGrade ?? "-"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}