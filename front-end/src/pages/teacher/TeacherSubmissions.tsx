import { CalendarDays, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';
import { fetchSubmissionsPending, submitStudentGrade } from "@/api/GradingApi.ts";
import { useEffect, useState } from "react";
import { getRubricById } from "@/api/RubricApi.ts";
import type { SubmissionDTO } from "@/api/type.ts";

// Added Interfaces
export interface CriteriaDTO {
    id: string;
    name: string;
    description?: string;
    weight?: number;
    maxPoints?: number;
}

export interface RubricDTO {
    id: string;
    name: string;
    description: string;
    defaultType: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}

export default function TeacherSubmissions() {
    const { id } = useParams<{ id: string }>();
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [rubric, setRubric] = useState<RubricDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
    const [activeStudent, setActiveStudent] = useState<string | null>(null);

    useEffect(() => {
        if (assessmentId) {
            loadSubmissions();
        }
    }, [assessmentId]);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const data = await fetchSubmissionsPending(assessmentId);
            setSubmissions(data);
        } catch (error) {
            console.error("Lỗi load bài nộp:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRubric = async (rubricId: string, studentId: string) => {
        try {
            const fetchedRubricId = rubricId || "default-rubric-id";
            const rubricData = await getRubricById(fetchedRubricId);

            setRubric(rubricData.data);
            setActiveStudent(studentId);
            setCriteriaScores({});
            setIsModalOpen(true);
        } catch (error) {
            console.error("Lỗi load rubric:", error);
        }
    };

    const handleScoreChange = (criteriaId: string, score: number) => {
        setCriteriaScores(prev => ({ ...prev, [criteriaId]: score }));
    };

    const handleSaveGrade = async () => {
        try {
            const gradeData = {
                studentId: activeStudent,
                assessmentId,
                rubricId: rubric.id,
                scores: criteriaScores,
                totalScore: Object.values(criteriaScores).reduce((a, b) => a + b, 0)
            };

            await submitStudentGrade(gradeData);
            alert("Chấm điểm thành công!");
            setIsModalOpen(false);
            loadSubmissions(); // Tải lại danh sách sau khi chấm
        } catch (error) {
            alert("Lỗi khi lưu điểm");
        }
    };
    console.log(submissions);
    const course = teacherCourses.find((item) => item.id === id);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Grading & feedback</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    Chấm bài và phản hồi theo rubric {course ? `- ${course.courseTitle}` : ''}
                </h3>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                {/* Quy trình & Nhận xét mẫu */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Nhận xét mẫu</p>
                            <div className="mt-3 space-y-2">
                                {['Cần bổ sung trích dẫn', 'Lập luận chưa chặt', 'Trình bày rõ ràng', 'Phân tích tốt'].map((comment) => (
                                    <div key={comment} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                                        {comment}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Quy trình chấm</p>
                            <div className="mt-3 space-y-3">
                                {['Mở bài nộp và rubric', 'Chọn mức độ từng tiêu chí', 'Thêm phản hồi nhanh', 'Lưu và đồng bộ điểm'].map((step, index) => (
                                    <div key={step} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm text-slate-600">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách bài nộp thật từ Backend */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Danh sách chờ chấm</p>
                            <h4 className="mt-1 text-xl font-bold text-slate-900">Bài nộp gần đây</h4>
                        </div>
                        <CalendarDays className="h-5 w-5 text-slate-400" />
                    </div>

                    <div className="mt-6 space-y-3">
                        {loading ? (
                            <p className="text-sm text-slate-500 text-center py-4">Đang tải danh sách bài nộp...</p>
                        ) : submissions.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Không có bài nộp nào cần chấm.</p>
                        ) : (
                            submissions.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 bg-white hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Mã SV: {item.studentId}</h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.fileUrl ? (
                                                    <a
                                                        href={item.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-amber-600 hover:underline font-medium"
                                                    >
                                                        Xem tệp bài nộp
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic">Không có tệp đính kèm</span>
                                                )}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase">
                            {item.status}
                          </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                        <span>Ngày nộp: {item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : '---'}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-slate-900">Điểm: Chưa chấm</span>
                                            <button
                                                onClick={() => handleOpenRubric(item.rubricId, item.studentId)}
                                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                                            >
                                                Chấm Rubric
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Rubric Grading Modal */}
            {isModalOpen && rubric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem] bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Chấm bài: {activeStudent}</h3>
                                <p className="text-sm text-slate-500 mt-1">{rubric.name}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                                {rubric.description}
                            </p>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900">Tiêu chí đánh giá</h4>
                                {rubric.criteria.map((criterion) => (
                                    <div key={criterion.id} className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{criterion.name}</p>
                                                {criterion.description && (
                                                    <p className="mt-1 text-sm text-slate-500">{criterion.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={criterion.maxPoints || 100}
                                                    value={criteriaScores[criterion.id] || ''}
                                                    onChange={(e) => handleScoreChange(criterion.id, Number(e.target.value))}
                                                    className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Điểm"
                                                />
                                                <span className="text-sm text-slate-500">
                                / {criterion.maxPoints || criterion.weight}
                              </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-100 p-6 flex items-center justify-between bg-slate-50">
                            <div className="text-sm">
                                <span className="text-slate-500">Tổng điểm: </span>
                                <span className="font-bold text-emerald-600 text-lg">
                      {Object.values(criteriaScores).reduce((a, b) => a + b, 0)}
                    </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveGrade}
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Lưu điểm
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
