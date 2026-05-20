import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRubricMatrix } from "@/features/rubric/rubricApi";

interface RubricLevel {
    levelId: string;
    levelName: string;
    description: string;
    score: number;
}

interface RubricMatrixRow {
    cloId: string | null;
    criteriaId: string;
    criteriaName: string;
    weight: number;
    levels: RubricLevel[];
}

interface RubricMatrixResponse {
    id: string;
    name: string;
    description: string;
    courses: number;
    cloCount: number;
    criteriaCount: number;
    totalWeight: number;
    status: string;
    rows: RubricMatrixRow[];
}

export default function RubricMatrix() {
    const [matrices, setMatrices] = useState<RubricMatrixResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMatrix, setSelectedMatrix] =
        useState<RubricMatrixResponse | null>(null);

    useEffect(() => {
        fetchRubricMatrix();
    }, []);

    const fetchRubricMatrix = async () => {
        try {
            setLoading(true);
            const res = await getRubricMatrix();
            setMatrices(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi load rubric matrix:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatWeight = (weight: number) => {
        if (weight <= 1) {
            return `${Math.round(weight * 100)}%`;
        }

        return `${weight}%`;
    };

    if (loading) {
        return <div className="p-6 text-slate-600">Đang tải ma trận rubric...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                        Ánh xạ tiêu chí
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        Ma trận Rubric
                    </h3>
                </div>

                <button
                    onClick={() => {
                        setSelectedMatrix(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5" />
                    Ma trận mới
                </button>
            </div>

            {/* Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">
                    💡 Ma trận Rubric giúp ánh xạ CLO với tiêu chí chấm điểm và các mức đánh giá.
                </p>
            </div>

            {/* Matrix List */}
            <div className="space-y-4">
                {matrices.map((matrix) => (
                    <div
                        key={matrix.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {matrix.name}
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    {matrix.description}
                                </p>

                                {/* Stats */}
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    <div className="rounded-lg bg-indigo-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">
                                            Học phần
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-indigo-600">
                                            {matrix.courses}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-purple-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">CLO</p>
                                        <p className="mt-1 text-xl font-bold text-purple-600">
                                            {matrix.cloCount}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">
                                            Tiêu chí
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-blue-600">
                                            {matrix.criteriaCount}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">
                                            Tổng trọng số
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-green-600">
                                            {formatWeight(matrix.totalWeight)}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mt-4">
                  <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          matrix.status === "Hoàn tất"
                              ? "bg-green-100 text-green-700"
                              : matrix.status === "Chờ duyệt"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {matrix.status}
                  </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                                    <Eye className="h-5 w-5" />
                                </button>

                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                                    <Edit2 className="h-5 w-5" />
                                </button>

                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Matrix Preview */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                                        CLO
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                                        Tiêu chí
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                                        Trọng số
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-slate-700">
                                        Mức đánh giá
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {matrix.rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-4 text-center text-slate-500"
                                        >
                                            Chưa có tiêu chí nào
                                        </td>
                                    </tr>
                                ) : (
                                    matrix.rows.map((row) => (
                                        <tr
                                            key={row.criteriaId}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-2 text-slate-900 font-medium">
                                                {row.cloId ?? "Chưa gắn CLO"}
                                            </td>

                                            <td className="px-4 py-2 text-slate-600">
                                                {row.criteriaName}
                                            </td>

                                            <td className="px-4 py-2 text-slate-900 font-medium">
                                                {formatWeight(row.weight)}
                                            </td>

                                            <td className="px-4 py-2 text-slate-600">
                                                {row.levels.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {row.levels.map((level) => (
                                                            <span
                                                                key={level.levelId}
                                                                title={level.description}
                                                                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                                            >
                                  {level.levelName} - {level.score}
                                </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">
                              Chưa có mức đánh giá
                            </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {selectedMatrix ? "Chỉnh sửa Ma trận" : "Tạo Ma trận Rubric mới"}
                        </h2>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}