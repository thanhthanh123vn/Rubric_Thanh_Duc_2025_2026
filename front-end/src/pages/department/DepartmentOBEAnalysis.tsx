import { BarChart3 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import {courseService} from "@/features/course/courseApi.ts";

export default function TeacherCourseOBE() {



    const navigate = useNavigate();
    const { id } = useParams();

    const [clos, setClos] = useState<any[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);


    useEffect(() => {
        if (!id) return;

        const fetchOBE = async () => {
            try {
                const data = await courseService.getOBEProgress(id);

                setClos(data.clos || []);
                setTotalStudents(data.totalStudents || 0);
                setOverallProgress(data.overallProgress || 0);

            } catch (err) {
                console.error("Lỗi fetch OBE:", err);
            }
        };

        fetchOBE();
    }, [id]);




    const getColor = (p: number) => {
        if (p >= 70) return "bg-green-500";
        if (p >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">OBE Dashboard</h2>
                <BarChart3
                    className="cursor-pointer"
                    onClick={() => navigate(`/teacher/course/${id}/obe/analytics`)}
                />
            </div>

            {/* Overall */}
            <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between mb-2">
                    <span>Tổng tiến độ</span>
                    <span>{Math.round(overallProgress || 0)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded">
                    <div
                        className={`h-3 rounded ${getColor(overallProgress || 0)}`}
                        style={{ width: `${overallProgress || 0}%` }}
                    />
                </div>
            </div>

            {/* CLO list */}
            {clos?.map((c) => {
                const passed = c.passedStudents ?? 0;
                const failed = c.failedStudents ?? 0;
                const isWeak = (c.progressPercent ?? 0) < 40;

                return (
                    <div
                        key={c.cloId}
                        onClick={() =>
                            navigate(`/teacher/course/${id}/obe/${c.cloId}`)
                        }
                        className={`cursor-pointer p-4 rounded-xl shadow ${
                            isWeak
                                ? "bg-red-50 border border-red-300"
                                : "bg-white"
                        }`}
                    >
                        <div className="flex justify-between">
                            <div>
                                <p className="font-bold">{c.cloCode}</p>
                                <p className="text-sm text-gray-500">
                                    {c.cloDescription}
                                </p>
                            </div>
                            <span>{Math.round(c.progressPercent || 0)}%</span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded mt-2">
                            <div
                                className={`h-2 rounded ${getColor(c.progressPercent || 0)}`}
                                style={{ width: `${c.progressPercent || 0}%` }}
                            />
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                            Đạt: {passed}/{totalStudents || 0} • Fail: {failed}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}