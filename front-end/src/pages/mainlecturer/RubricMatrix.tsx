import { ChevronDown, ChevronRight, Edit2, Eye, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RubricMatrixEditor, {
    type CloOption,
    type RubricMatrixResponse,
} from "@/features/rubric/components/RubricMatrixEditor";
import RubricSamplePreview from "@/features/rubric/components/RubricSamplePreview.tsx";
import type {
    MatrixCriterionDraft,
    MatrixLevelDraft,
} from "@/features/rubric/components/RubricMatrixPreview.tsx";
import { getAllClo, getCourseOptions, getRubricMatrix, type CourseOption } from "@/features/rubric/rubricApi";

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
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [clos, setClos] = useState<CloOption[]>([]);
    const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMatrix, setSelectedMatrix] = useState<RubricMatrixResponse | null>(null);
    const [previewMatrix, setPreviewMatrix] = useState<RubricMatrixResponse | null>(null);
    const cloLabels = useMemo(
        () => new Map(clos.map((clo) => [clo.cloId, `${clo.cloCode} - ${clo.cloName}`])),
        [clos],
    );
    const getCloLabel = (cloId: string) => cloLabels.get(cloId) || cloId;
    const versionGroups = useMemo(() => {
        const groups = new Map<string, RubricMatrixResponse[]>();
        matrices.forEach((matrix) => {
            const rootId = matrix.rootRubricId || matrix.id;
            groups.set(rootId, [...(groups.get(rootId) || []), matrix]);
        });
        return [...groups.entries()].map(([rootId, versions]) => ({
            rootId,
            versions: versions.sort((a, b) => (b.versionNumber ?? 1) - (a.versionNumber ?? 1)),
        }));
    }, [matrices]);

    const fetchRubricMatrix = async () => {
        try {
            setLoading(true);
            const res = await getRubricMatrix();
            const nextMatrices = Array.isArray(res.data) ? res.data : [];
            setMatrices(nextMatrices);
            return nextMatrices;
        } catch (error) {
            console.error("Lỗi khi tải ma trận rubric:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [cloRes, courseOptions] = await Promise.all([getAllClo(), getCourseOptions()]);
            setClos(Array.isArray(cloRes.data) ? cloRes.data : []);
            setCourses(courseOptions);
        } catch (error) {
            console.error("Lỗi khi tải tùy chọn ma trận rubric:", error);
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchRubricMatrix();
            void fetchOptions();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

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

    const handleMatrixSaved = async () => {
        const nextMatrices = await fetchRubricMatrix();

        if (selectedMatrix) {
            const latestSelected = nextMatrices.find((item) => item.id === selectedMatrix.id) || null;
            setSelectedMatrix(latestSelected);
        }

        if (previewMatrix) {
            const latestPreview = nextMatrices.find((item) => item.id === previewMatrix.id) || null;
            setPreviewMatrix(latestPreview);
        }
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
                        Rubric
                    </h3>
                </div>

                <button
                    onClick={() => openEditor(null)}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                    <Plus className="h-5 w-5" />
                    Tạo Rubric
                </button>
            </div>

            <div className="space-y-4">
                {versionGroups.map(({ rootId, versions }) => {
                    const matrix = versions[0];
                    const expanded = expandedRoots.has(rootId);
                    return (
                    <div
                        key={rootId}
                        className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {matrix.name}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setExpandedRoots((current) => {
                                        const next = new Set(current);
                                        next.has(rootId) ? next.delete(rootId) : next.add(rootId);
                                        return next;
                                    })}
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700"
                                >
                                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    {versions.length} version · hiện tại v{matrix.versionNumber ?? 1}
                                </button>

                                {expanded ? (
                                    <div className="relative mt-3 max-w-2xl border-l-2 border-slate-200 pl-5">
                                        <div className="space-y-3">
                                            {versions.map((version, index) => (
                                                <button
                                                    key={version.id}
                                                    type="button"
                                                    onClick={() => openPreview(version)}
                                                    className="relative flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:border-indigo-300 hover:bg-indigo-50/40"
                                                >
                                                    <span className="absolute -left-[1.72rem] top-4 h-3 w-3 rounded-full border-2 border-white bg-slate-400 ring-1 ring-slate-300" />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold text-slate-800">
                                                            v{version.versionNumber ?? 1} · {version.name}
                                                        </span>
                                                        <span className="mt-1 block text-xs text-slate-500">
                                                            {index === 0 ? "Version mới nhất" : `Từ ${version.parentRubricId ?? "rubric gốc"}`}
                                                        </span>
                                                    </span>
                                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        version.approvalStatus === "APPROVED"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : version.approvalStatus === "PENDING"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : version.approvalStatus === "REJECTED"
                                                                    ? "bg-rose-100 text-rose-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                        {{ DRAFT: "Bản nháp", PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" }[version.approvalStatus ?? "DRAFT"]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

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
                                            matrix.approvalStatus === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : matrix.approvalStatus === "PENDING"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {{ DRAFT: "Bản nháp", PENDING: "Chờ trưởng khoa duyệt", APPROVED: "Đã duyệt", REJECTED: "Bị từ chối" }[matrix.approvalStatus ?? "DRAFT"]}
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
                                    disabled={matrix.approvalStatus === "PENDING"}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700"
                                >
                                    <Edit2 className="h-5 w-5" />
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
                                                {row.cloId ? getCloLabel(row.cloId) : "Chưa gán CLO"}
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
                    );
                })}
            </div>

            <RubricMatrixEditor
                open={showModal}
                selectedMatrix={selectedMatrix}
                clos={clos}
                courses={courses}
                onClose={closeEditor}
                onSaved={handleMatrixSaved}
            />

            <RubricSamplePreview
                open={previewMatrix !== null}
                name={previewMatrix?.name ?? ""}
                description={previewMatrix?.description ?? ""}
                criteria={matrixToPreviewCriteria(previewMatrix)}
                totalWeight={previewMatrix ? normalizeWeight(previewMatrix.totalWeight) : 0}
                getCloLabel={getCloLabel}
                sortLevels={sortLevels}
                onClose={closePreview}
            />
        </div>
    );
}
