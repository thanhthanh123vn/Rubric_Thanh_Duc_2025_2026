import React, { useEffect, useState } from "react";
import { Search, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";

export default function RubricPoint() {
    const navigate = useNavigate();
    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [filtered, setFiltered] = useState<CourseOfferingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await courseOfferingService.getOfferings();
                setOfferings(Array.isArray(data) ? data : []);
            } catch (e) {
                toast.error("Không thể tải danh sách khóa học");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const query = q.trim().toLowerCase();
        if (!query) return setFiltered(offerings);

        setFiltered(
            offerings.filter(
                (o) =>
                    o.offeringId?.toLowerCase().includes(query) ||
                    o.offeringName?.toLowerCase().includes(query) ||
                    o.course?.courseName?.toLowerCase().includes(query) ||
                    o.course?.courseCode?.toLowerCase().includes(query)
            )
        );
    }, [q, offerings]);

    useEffect(() => {
        setFiltered(offerings);
    }, [offerings]);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Quản lý bảng điểm</h2>
                <p className="text-slate-500 text-sm mt-1">Danh sách khóa học / lớp học phần</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 relative">
                <Search className="absolute left-7 top-7 w-4 h-4 text-slate-400" />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo mã lớp, tên lớp, mã môn, tên môn..."
                    className="w-full pl-9 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-emerald-500 outline-none"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Mã lớp HP</th>
                        <th className="px-6 py-4">Tên lớp HP</th>
                        <th className="px-6 py-4">Môn học</th>
                        <th className="px-6 py-4">Học kỳ</th>
                        <th className="px-6 py-4">Sĩ số tối đa</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                            </td>
                        </tr>
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400">
                                Không có khóa học phù hợp.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((o) => (
                            <tr key={o.offeringId} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-semibold">{o.offeringId}</td>
                                <td className="px-6 py-4">{o.offeringName}</td>
                                <td className="px-6 py-4">
                                    {o.course?.courseCode} - {o.course?.courseName}
                                </td>
                                <td className="px-6 py-4">{o.semester}</td>
                                <td className="px-6 py-4">{o.maxStudents}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        onClick={() => navigate(`/admin/grades/rubric-grading/${o.offeringId}`)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-xl text-xs"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Chấm Điểm Theo Rubric
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}