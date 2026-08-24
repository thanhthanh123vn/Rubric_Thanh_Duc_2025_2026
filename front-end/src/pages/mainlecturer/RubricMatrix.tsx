import {
    CheckCircle2, ChevronDown, ChevronRight, Clock3, Edit2, Eye, FileText,
    Plus, RotateCcw, Search, ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import RubricMatrixEditor, {
    type CloOption,
    type RubricMatrixResponse,
} from "@/features/rubric/components/RubricMatrixEditor";
import RubricSamplePreview from "@/features/rubric/components/RubricSamplePreview.tsx";
import RestoreRubricVersionDialog from "@/features/rubric/components/RestoreRubricVersionDialog.tsx";
import type {
    MatrixCriterionDraft,
    MatrixLevelDraft,
} from "@/features/rubric/components/RubricMatrixPreview.tsx";
import { getAllClo, getCourseOptions, getRubricMatrix, revertRubricHead, type CourseOption } from "@/features/rubric/rubricApi";

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

const sortLevels = (levels: MatrixLevelDraft[]) => [...levels].sort((a, b) => b.maxScore - a.maxScore || a.orderIndex - b.orderIndex);

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
                minScore: level.minScore ?? level.score,
                maxScore: level.maxScore ?? level.score,
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
    const [movingHeadId, setMovingHeadId] = useState<string | null>(null);
    const [restoreCandidate, setRestoreCandidate] = useState<RubricMatrixResponse | null>(null);
    const [localHeads, setLocalHeads] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
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
    const rubricHeads = useMemo(() => versionGroups.map(({ rootId, versions }) => {
        const headId = localHeads[rootId]
            || versions.find((version) => version.currentHead)?.id
            || versions[0].id;
        return versions.find((version) => version.id === headId) || versions[0];
    }), [localHeads, versionGroups]);
    const summary = useMemo(() => ({
        total: rubricHeads.length,
        approved: rubricHeads.filter((matrix) => matrix.approvalStatus === "APPROVED").length,
        pending: rubricHeads.filter((matrix) => matrix.approvalStatus === "PENDING").length,
        draft: rubricHeads.filter((matrix) => !matrix.approvalStatus || matrix.approvalStatus === "DRAFT" || matrix.approvalStatus === "REJECTED").length,
    }), [rubricHeads]);
    const filteredVersionGroups = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase("vi");
        return versionGroups.filter(({ rootId, versions }) => {
            const headId = localHeads[rootId]
                || versions.find((version) => version.currentHead)?.id
                || versions[0].id;
            const head = versions.find((version) => version.id === headId) || versions[0];
            const matchesStatus = statusFilter === "ALL" || (head.approvalStatus || "DRAFT") === statusFilter;
            const matchesKeyword = !keyword || `${head.name} ${head.description || ""}`.toLocaleLowerCase("vi").includes(keyword);
            return matchesStatus && matchesKeyword;
        });
    }, [localHeads, search, statusFilter, versionGroups]);

    const fetchRubricMatrix = async () => {
        try {
            setLoading(true);
            const res = await getRubricMatrix();
            const nextMatrices = Array.isArray(res.data) ? res.data : [];
            setMatrices(nextMatrices);
            const rootsConfirmedByServer = new Set(
                nextMatrices
                    .filter((matrix: RubricMatrixResponse) => matrix.currentHead)
                    .map((matrix: RubricMatrixResponse) => matrix.rootRubricId || matrix.id),
            );
            if (rootsConfirmedByServer.size > 0) {
                setLocalHeads((current) => Object.fromEntries(
                    Object.entries(current).filter(([rootId]) => !rootsConfirmedByServer.has(rootId)),
                ));
            }
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

    const nextRestoreVersion = restoreCandidate ? Math.max(
        ...matrices
            .filter((item) => (item.rootRubricId || item.id) === (restoreCandidate.rootRubricId || restoreCandidate.id))
            .map((item) => item.versionNumber ?? 1),
    ) + 1 : 1;

    const restoreVersion = async () => {
        if (!restoreCandidate) return;
        const version = restoreCandidate;
        const rootId = version.rootRubricId || version.id;
        const versions = matrices.filter((item) => (item.rootRubricId || item.id) === rootId);
        const nextVersion = Math.max(...versions.map((item) => item.versionNumber ?? 1)) + 1;
        try {
            setMovingHeadId(version.id);
            const response = await revertRubricHead(version.id);
            await fetchRubricMatrix();
            const restoredVersion = response.data?.data?.versionNumber ?? nextVersion;
            setRestoreCandidate(null);
            toast.success(`Đã tạo v${restoredVersion} và gửi Lãnh đạo khoa duyệt`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể khôi phục version");
        } finally {
            setMovingHeadId(null);
        }
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
        <div className="mx-auto w-full max-w-[1440px] space-y-5">
            <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Đánh giá chuẩn đầu ra</p>
                        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Quản lý Rubric</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Xây dựng tiêu chí đánh giá, liên kết CLO và theo dõi lịch sử phiên bản Rubric.</p>
                    </div>
                    <button onClick={() => openEditor(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800">
                        <Plus className="h-5 w-5" /> Tạo Rubric
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Tổng Rubric</span><FileText className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-slate-900">{summary.total}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Cần hoàn thiện</span><Edit2 className="h-5 w-5 text-slate-500" /></div><p className="mt-3 text-2xl font-black text-slate-900">{summary.draft}</p></div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-amber-800">Chờ duyệt</span><Clock3 className="h-5 w-5 text-amber-600" /></div><p className="mt-3 text-2xl font-black text-amber-900">{summary.pending}</p></div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-emerald-800">Đã duyệt</span><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-emerald-900">{summary.approved}</p></div>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc mô tả Rubric..." className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-11 pr-4 text-sm outline-none focus:border-emerald-400 focus:bg-white" />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400">
                    <option value="ALL">Tất cả trạng thái</option><option value="DRAFT">Bản nháp</option><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Bị từ chối</option>
                </select>
            </section>

            <div className="space-y-4">
                {filteredVersionGroups.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><FileText className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold text-slate-800">Không tìm thấy Rubric</h2><p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc bộ lọc trạng thái.</p></div> : null}
                {filteredVersionGroups.map(({ rootId, versions }) => {
                    const headId = localHeads[rootId]
                        || versions.find((version) => version.currentHead)?.id
                        || versions[0].id;
                    const matrix = versions.find((version) => version.id === headId) || versions[0];
                    const expanded = expandedRoots.has(rootId);
                    return (
                    <div
                        key={rootId}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                                            {versions.map((version) => {
                                                const isCurrentHead = version.id === headId;
                                                return (
                                                <div
                                                    key={version.id}
                                                    onClick={() => openPreview(version)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter" || event.key === " ") openPreview(version);
                                                    }}
                                                    role="button"
                                                    tabIndex={0}
                                                    className="relative flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:border-indigo-300 hover:bg-indigo-50/40"
                                                >
                                                    <span className={`absolute -left-[1.72rem] top-4 h-3 w-3 rounded-full border-2 border-white ring-1 ${isCurrentHead ? "bg-green-600 ring-green-300" : "bg-slate-400 ring-slate-300"}`} />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold text-slate-800">
                                                            v{version.versionNumber ?? 1} · {version.name}
                                                        </span>
                                                        <span className="mt-1 block text-xs text-slate-500">
                                                            {isCurrentHead ? "HEAD hiện tại" : `Từ ${version.parentRubricId ?? "rubric gốc"}`}
                                                        </span>
                                                    </span>
                                                    <span className="ml-auto flex shrink-0 items-center gap-2">
                                                    {isCurrentHead ? (
                                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">HEAD</span>
                                                    ) : version.approvalStatus !== "PENDING" ? (
                                                        <button
                                                            type="button"
                                                            disabled={movingHeadId === version.id}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setRestoreCandidate(version);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            Khôi phục
                                                        </button>
                                                    ) : null}
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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
                                                    </span>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}

                                <p className="mt-1 text-sm text-slate-500">
                                    {matrix.description}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
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
                                        {{ DRAFT: "Bản nháp", PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Bị từ chối" }[matrix.approvalStatus ?? "DRAFT"]}
                                    </span>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-2 self-end sm:self-start">
                                <button
                                    onClick={() => openPreview(matrix)}
                                    aria-label={`Xem ${matrix.name}`}
                                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={() => openEditor(matrix)}
                                    disabled={matrix.approvalStatus === "PENDING"}
                                    aria-label={`Chỉnh sửa ${matrix.name}`}
                                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                                                                    {level.levelName} - {level.minScore === 0 && level.maxScore < 4
                                                                        ? "<4"
                                                                        : level.minScore === level.maxScore
                                                                        ? level.maxScore
                                                                        : `${level.minScore}-${level.maxScore}`}
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

            <RestoreRubricVersionDialog
                open={Boolean(restoreCandidate)}
                rubricName={restoreCandidate?.name}
                sourceVersion={restoreCandidate?.versionNumber ?? 1}
                nextVersion={nextRestoreVersion}
                submitting={Boolean(movingHeadId)}
                onOpenChange={(open) => !open && setRestoreCandidate(null)}
                onConfirm={() => void restoreVersion()}
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
