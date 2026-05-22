import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import RubricMatrixEditor, {
    type CloOption,
    type RubricMatrixResponse,
    type RubricOption,
} from "@/features/rubric/components/RubricMatrixEditor";
import RubricSamplePreview from "@/features/rubric/components/RubricSamplePreview.tsx";
import type {
    MatrixCriterionDraft,
    MatrixLevelDraft,
} from "@/features/rubric/components/RubricMatrixPreview.tsx";
import { getAllClo, getAllRubric, getRubricMatrix } from "@/features/rubric/rubricApi";

const PERCENT_RATIO_EPSILON = 0.0001;

const formatWeight = (weight: number) => {
    if (weight <= 1 + PERCENT_RATIO_EPSILON) {
        return `${Math.round(weight * 100)}%`;
    }

    return `${weight}%`;
};

const normalizeWeight = (weight: number) => {
    if (weight <= 1 + PERCENT_RATIO_EPSILON) {
        return Math.round(weight * 100);
    }

    return weight;
};

const sortLevels = (levels: MatrixLevelDraft[]) => [...levels].sort((a, b) => b.score - a.score || a.orderIndex - b.orderIndex);

const matrixToPreviewCriteria = (matrix: RubricMatrixResponse | null): MatrixCriterionDraft[] => {
    if (!matrix) {
        return [];
    }

    return matrix.rows.map((row) => ({
        id: row.criteriaId,
        name: row.criteriaName,
        weight: normalizeWeight(row.weight),
        cloId: row.cloId ?? "",
        levels: sortLevels(
            row.levels.map((level, index) => ({
                id: level.levelId,
                name: level.levelName,
                orderIndex: index + 1,
                score: level.score,
                description: level.description,
            })),
        ),
    }));
};

export default function RubricMatrix() {
    const [matrices, setMatrices] = useState<RubricMatrixResponse[]>([]);
    const [rubrics, setRubrics] = useState<RubricOption[]>([]);
    const [clos, setClos] = useState<CloOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMatrix, setSelectedMatrix] = useState<RubricMatrixResponse | null>(null);
    const [previewMatrix, setPreviewMatrix] = useState<RubricMatrixResponse | null>(null);

    useEffect(() => {
        void fetchRubricMatrix();
        void fetchOptions();
    }, []);

    const fetchRubricMatrix = async () => {
        try {
            setLoading(true);
            const res = await getRubricMatrix();
            setMatrices(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi khi tải ma trận rubric:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [cloRes, rubricRes] = await Promise.all([getAllClo(), getAllRubric()]);
            setClos(Array.isArray(cloRes.data) ? cloRes.data : []);
            setRubrics(
                (Array.isArray(rubricRes.data) ? rubricRes.data : []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    totalWeight: item.totalWeight,
                })),
            );
        } catch (error) {
            console.error("Lỗi khi tải tùy chọn ma trận rubric:", error);
        }
    };

    const openEditor = (matrix: RubricMatrixResponse | null) => {
        setSelectedMatrix(matrix);
        setShowModal(true);
    };

    const closeEditor = () => {
        setShowModal(false);
        setSelectedMatrix(null);
    };

    const openPreview = (matrix: RubricMatrixResponse) => {
        setPreviewMatrix(matrix);
    };

    const closePreview = () => {
        setPreviewMatrix(null);
    };

    if (loading) {
        return <div className="p-6 text-slate-600">Đang tải ma trận rubric...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                        Ánh xạ tiêu chí
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        Ma trận Rubric
                    </h3>
                </div>

                <button
                    onClick={() => openEditor(null)}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                    <Plus className="h-5 w-5" />
                    Ma trận mới
                </button>
            </div>

            <div className="space-y-4">
                {matrices.map((matrix) => (
                    <div
                        key={matrix.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {matrix.name}
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    {matrix.description}
                                </p>

                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    <div className="rounded-lg bg-green-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">
                                            Học phần
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-green-700">
                                            {matrix.courses}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">CLO</p>
                                        <p className="mt-1 text-xl font-bold text-green-700">
                                            {matrix.cloCount}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3">
                                        <p className="text-xs font-medium text-slate-600">
                                            Tiêu chí
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-green-700">
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

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openPreview(matrix)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => openEditor(matrix)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>

                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

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
                                            <td className="px-4 py-2 font-medium text-slate-900">
                                                {row.cloId ?? "Chưa gán CLO"}
                                            </td>

                                            <td className="px-4 py-2 text-slate-600">
                                                {row.criteriaName}
                                            </td>

                                            <td className="px-4 py-2 font-medium text-slate-900">
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

            <RubricMatrixEditor
                open={showModal}
                selectedMatrix={selectedMatrix}
                clos={clos}
                rubrics={rubrics}
                onClose={closeEditor}
            />

            <RubricSamplePreview
                open={previewMatrix !== null}
                name={previewMatrix?.name ?? ""}
                description={previewMatrix?.description ?? ""}
                criteria={matrixToPreviewCriteria(previewMatrix)}
                totalWeight={previewMatrix ? normalizeWeight(previewMatrix.totalWeight) : 0}
                sortLevels={sortLevels}
                onClose={closePreview}
            />
        </div>
    );
}