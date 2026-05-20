import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllRubrics, type RubricDTO } from '@/pages/mainlecturer/api/RubricAPI'; // Điều chỉnh import path nếu cần

export default function TeacherCourseRubric() {
    const [rubrics, setRubrics] = useState<RubricDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRubrics = async () => {
            try {
                const data = await getAllRubrics();
                setRubrics(data);
                console.log(data)
            } catch (error) {
                console.error("Lỗi khi tải danh sách Rubric:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRubrics();
    }, []);

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Rubric</p>
                    <h4 className="mt-1 text-2xl font-bold text-slate-900">Rubric của học phần</h4>
                </div>
                <FileText className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-6 space-y-3">
                {loading ? (
                    <div className="text-center text-slate-500 py-4">Đang tải...</div>
                ) : rubrics.length > 0 ? (
                    rubrics.map((rubric) => (
                        <div key={rubric.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                            <h5 className="font-semibold text-md text-slate-800">{rubric.name}</h5>
                            {rubric.description && (
                                <p className="text-sm text-slate-500 mt-1">{rubric.description}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-500 py-4">Chưa có Rubric nào được tạo.</div>
                )}
            </div>
        </div>
    );
}