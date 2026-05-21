import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { ChevronRight, ClipboardList, Clock3 } from "lucide-react";

export default function TeacherAssessmentList() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<any[]>([]);

    useEffect(() => {
        assessmentService.getAssessmentsByOffering(id!).then((data) => setAssessments(data));
    }, [id]);

    return (
        <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
            <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">Danh sách bài tập</h3>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Quản lý và chấm điểm bài tập của sinh viên.</p>
            </div>


            <div className="grid gap-4">
                {assessments.map((a: any) => (
                    <div
                        key={a.assessmentId}
                        className="group rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
                    >
                        {/* Phần thông tin bài tập */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base md:text-lg leading-tight">
                                    {a.assessmentName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] md:text-sm text-slate-500">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>{new Date(a.endTime).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Phần thống kê và hành động */}
                        <div className="flex items-center justify-between gap-4 border-t pt-4 md:border-t-0 md:pt-0">
                            <div className="flex gap-4 md:gap-8 text-center">
                                <div>
                                    <p className="text-base md:text-xl font-bold text-slate-900">{a.submittedCount || 0}</p>
                                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Đã nộp</p>
                                </div>
                                <div>
                                    <p className="text-base md:text-xl font-bold text-amber-600">{a.pendingCount || 0}</p>
                                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chờ chấm</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/teacher/course/${id}/assessment/${a.assessmentId}/submissions`)}
                                className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                            >
                                <span className="hidden md:inline">Chấm bài</span>
                                <ChevronRight className="h-5 w-5 md:hidden" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}