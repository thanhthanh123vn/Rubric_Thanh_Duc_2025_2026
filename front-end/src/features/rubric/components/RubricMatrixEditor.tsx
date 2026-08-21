import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { rubricApi } from "@/api/RubricApi.ts";
import type { CourseOption } from "@/features/rubric/rubricApi.ts";
import RubricMatrixPreview, {
    type MatrixCriterionDraft,
    type MatrixLevelDraft,
} from "@/features/rubric/components/RubricMatrixPreview.tsx";
import RubricSamplePreview from "@/features/rubric/components/RubricSamplePreview.tsx";

export interface RubricMatrixLevel {
    levelId: string;
    levelName: string;
    description: string;
    score: number;
}

export interface RubricMatrixRow {
    cloId: string | null;
    criteriaId: string;
    criteriaName: string;
    weight: number;
    levels: RubricMatrixLevel[];
}

export interface RubricMatrixResponse {
    id: string;
    name: string;
    description: string;
    courses: number;
    cloCount: number;
    criteriaCount: number;
    totalWeight: number;
    status: string;
    approvalStatus?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
    courseId?: string | null;
    rubricType?: "FACULTY" | "LECTURER_VARIANT";
    rootRubricId?: string | null;
    parentRubricId?: string | null;
    versionNumber?: number;
    currentHead?: boolean;
    rows: RubricMatrixRow[];
}

export interface CloOption {
    cloId: string;
    cloCode: string;
    cloName: string;
    bloomLevel?: string;
    courseId?: string;
}

export interface RubricOption {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
}

interface MatrixEditorDraft {
    id: string;
    courseId: string;
    name: string;
    description: string;
    status: string;
    criteria: MatrixCriterionDraft[];
}

type Props = {
    open: boolean;
    selectedMatrix: RubricMatrixResponse | null;
    clos: CloOption[];
    courses: CourseOption[];
    onClose: () => void;
    onSaved?: () => Promise<void> | void;
};

const PERCENT_RATIO_EPSILON = 0.0001;

const normalizeWeight = (weight: number) => {
    if (weight <= 1 + PERCENT_RATIO_EPSILON) {
        return Math.round(weight * 100);
    }

    return weight;
};

const sortLevels = (levels: MatrixLevelDraft[]) => [...levels].sort((a, b) => a.orderIndex - b.orderIndex);

const createDefaultLevels = (): MatrixLevelDraft[] => {
    const seed = Date.now();

    return [
        { id: `level-${seed}-1`, name: "Chua dat", orderIndex: 1, score: 0, description: "" },
        { id: `level-${seed}-2`, name: "Dat", orderIndex: 2, score: 1, description: "" },
    ];
};

const createDefaultCriterion = (): MatrixCriterionDraft => ({
    id: `criterion-${Date.now()}`,
    name: "",
    weight: 0,
    cloId: "",
    levels: createDefaultLevels(),
});

const createDraftFromMatrix = (matrix: RubricMatrixResponse | null): MatrixEditorDraft => {
    if (!matrix) {
        return {
            id: `draft-${Date.now()}`,
            courseId: "",
            name: "",
            description: "",
            status: "Nhap",
            criteria: [createDefaultCriterion()],
        };
    }

    return {
        id: matrix.id,
        courseId: matrix.courseId ?? "",
        name: matrix.name,
        description: matrix.description,
        status: matrix.status,
        criteria: matrix.rows.map((row, index) => ({
            id: row.criteriaId || `criterion-${index}`,
            name: row.criteriaName,
            weight: normalizeWeight(row.weight),
            cloId: row.cloId ?? "",
            levels: sortLevels(
                row.levels.map((level, levelIndex) => ({
                    id: level.levelId,
                    name: level.levelName,
                    orderIndex: levelIndex + 1,
                    score: level.score,
                    description: level.description,
                })),
            ),
        })),
    };
};

export default function RubricMatrixEditor({
    open,
    selectedMatrix,
    clos,
    courses,
    onClose,
    onSaved,
}: Props) {
    const [draft, setDraft] = useState<MatrixEditorDraft>(createDraftFromMatrix(selectedMatrix));
    const [showRubricSample, setShowRubricSample] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");

    useEffect(() => {
        if (!open) return;
        let active = true;

        queueMicrotask(() => {
            if (!active) return;
            setDraft(createDraftFromMatrix(selectedMatrix));
            setIsSaving(false);
            setSaveMessage("");
            setSaveState("idle");
        });

        return () => { active = false; };
    }, [open, selectedMatrix]);

    const totalWeight = useMemo(
        () => draft.criteria.reduce((sum, item) => sum + Number(item.weight || 0), 0),
        [draft.criteria],
    );

    const mappedCriteriaCount = useMemo(
        () => draft.criteria.filter((item) => item.cloId.trim() !== "").length,
        [draft.criteria],
    );

    const criteriaWithLevelsCount = useMemo(
        () => draft.criteria.filter((item) => item.levels.length > 0).length,
        [draft.criteria],
    );

    const cloLabels = useMemo(
        () => new Map(clos.map((clo) => [clo.cloId, `${clo.cloCode} - ${clo.cloName}`])),
        [clos],
    );
    const availableClos = useMemo(
        () => clos.filter((clo) => !draft.courseId || !clo.courseId || clo.courseId === draft.courseId),
        [clos, draft.courseId],
    );
    const getCloLabel = (cloId: string) => cloLabels.get(cloId) || cloId;

    const updateDraft = <K extends keyof MatrixEditorDraft>(field: K, value: MatrixEditorDraft[K]) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    const updateCriterion = (criterionId: string, field: keyof MatrixCriterionDraft, value: string | number) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
                criterion.id === criterionId ? { ...criterion, [field]: value } : criterion,
            ),
        }));
    };

    const addCriterion = () => {
        setDraft((current) => ({
            ...current,
            criteria: [...current.criteria, createDefaultCriterion()],
        }));
    };

    const deleteCriterion = (criterionId: string) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.filter((criterion) => criterion.id !== criterionId),
        }));
    };

    const updateCriterionLevel = (
        criterionId: string,
        levelId: string,
        field: keyof MatrixLevelDraft,
        value: string | number,
    ) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        levels: sortLevels(
                            criterion.levels.map((level) =>
                                level.id === levelId ? { ...level, [field]: value } : level,
                            ),
                        ),
                    }
                    : criterion,
            ),
        }));
    };

    const updateCriterionLevelDescription = (criterionId: string, levelId: string, description: string) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        levels: criterion.levels.map((level) =>
                            level.id === levelId ? { ...level, description } : level,
                        ),
                    }
                    : criterion,
            ),
        }));
    };

    const addCriterionLevel = (criterionId: string) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        levels: sortLevels([
                            ...criterion.levels,
                            {
                                id: `level-${Date.now()}`,
                                name: `Muc ${criterion.levels.length + 1}`,
                                orderIndex: criterion.levels.length + 1,
                                score: 0,
                                description: "",
                            },
                        ]),
                    }
                    : criterion,
            ),
        }));
    };

    const deleteCriterionLevel = (criterionId: string, levelId: string) => {
        setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
                criterion.id === criterionId
                    ? {
                        ...criterion,
                        levels: criterion.levels.filter((level) => level.id !== levelId),
                    }
                    : criterion,
            ),
        }));
    };

    const validationItems = [
        {
            label: "Tổng trọng số",
            ok: totalWeight === 100,
            note: `${totalWeight}% / 100%`,
        },
        {
            label: "Tiêu chí đã gắn CLO",
            ok: mappedCriteriaCount === draft.criteria.length && draft.criteria.length > 0,
            note: `${mappedCriteriaCount}/${draft.criteria.length}`,
        },
        {
            label: "Tiêu chí có cấp độ",
            ok: criteriaWithLevelsCount === draft.criteria.length && draft.criteria.length > 0,
            note: `${criteriaWithLevelsCount}/${draft.criteria.length}`,
        },
    ];

    if (!open) {
        return null;
    }

    const handleSave = async () => {
        const isValid = draft.name.trim() !== ""
            && draft.courseId !== ""
            && Math.abs(totalWeight - 100) < PERCENT_RATIO_EPSILON
            && draft.criteria.length > 0
            && draft.criteria.every((criterion) =>
                criterion.name.trim() !== "" && criterion.cloId !== "" && criterion.levels.length > 0,
            );

        if (!isValid) {
            toast.error("Vui lòng nhập đủ tên, học phần, CLO, cấp độ và tổng trọng số 100%.");
            return;
        }

        const loadingMessage = selectedMatrix
            ? "Dang chinh sua ma tran rubric..."
            : "Dang tao ma tran rubric...";
        const successMessage = selectedMatrix
            ? "Chinh sua ma tran rubric thanh cong."
            : "Tao ma tran rubric thanh cong.";
        const errorMessage = selectedMatrix
            ? "Chinh sua ma tran rubric that bai."
            : "Tao ma tran rubric that bai.";
        const loadingToastId = toast.loading(loadingMessage);

        try {
            setIsSaving(true);
            setSaveState("saving");
            setSaveMessage(loadingMessage);

            const payload = {
                rubricName: draft.name.trim(),
                courseId: draft.courseId,
                description: draft.description,
                submitForApproval: true,
                criteria: draft.criteria.map((criterion) => ({
                    id: criterion.id,
                    name: criterion.name,
                    weight: Number(criterion.weight) / 100,
                    cloId: criterion.cloId,
                    levels: sortLevels(criterion.levels).map((level) => ({
                        id: level.id,
                        name: level.name,
                        orderIndex: level.orderIndex,
                        score: Number(level.score) || 0,
                        description: level.description,
                    })),
                })),
            };

            const res = selectedMatrix
                ? await rubricApi.createVersion(selectedMatrix.id, payload)
                : await rubricApi.createRubric(payload);

            console.log("Luu thanh cong:", res.data);
            await onSaved?.();
            setSaveState("success");
            setSaveMessage(successMessage);
            toast.success(successMessage, { id: loadingToastId });
            onClose();
        } catch (error) {
            console.error("Loi luu rubric matrix:", error);
            setSaveState("error");
            setSaveMessage(errorMessage);
            toast.error(errorMessage, { id: loadingToastId });
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white p-8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                            Rubric Matrix Editor
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            {selectedMatrix ? `Tạo version v${(selectedMatrix.versionNumber ?? 1) + 1}` : "Tạo rubric mới"}
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Tên rubric</label>
                        <input
                            value={draft.name}
                            onChange={(event) => updateDraft("name", event.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                            placeholder="Ví dụ: Rubric đồ án cuối kỳ"
                        />
                        <label className="mt-4 block text-sm font-medium text-slate-700">Mô tả</label>
                        <textarea
                            value={draft.description}
                            onChange={(event) => updateDraft("description", event.target.value)}
                            className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                        />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="text-sm font-medium text-slate-700">Học phần</label>
                        <select
                            value={draft.courseId}
                            onChange={(event) => updateDraft("courseId", event.target.value)}
                            disabled={Boolean(selectedMatrix?.courseId)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                        >
                            <option value="">Chọn học phần</option>
                            {courses.map((course) => (
                                    <option key={course.courseId} value={course.courseId}>
                                        {course.courseCode ? `${course.courseCode} - ` : ""}{course.courseName}
                                    </option>
                                ))}
                        </select>
                        {selectedMatrix ? (
                            <p className="mt-3 text-xs font-medium text-amber-700">
                                Bản hiện tại được giữ nguyên; version mới phải chờ trưởng khoa duyệt.
                            </p>
                        ) : null}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Tổng trọng số</p>
                        <p className={`mt-2 text-2xl font-bold ${totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                            {totalWeight}%
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-700">Tiêu chí đã gắn CLO</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">
                            {mappedCriteriaCount}/{draft.criteria.length}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Tiêu chí + CLO
                                </p>
                                <h3 className="mt-2 text-xl font-bold text-slate-900">Gắn tiêu chí vào CLO</h3>
                            </div>

                            <button
                                type="button"
                                onClick={addCriterion}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm tiêu chí
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {draft.criteria.map((criterion, index) => (
                                <article key={criterion.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                            Criterion {index + 1}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => deleteCriterion(criterion.id)}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Ten tieu chi</label>
                                            <input
                                                type="text"
                                                value={criterion.name}
                                                onChange={(event) => updateCriterion(criterion.id, "name", event.target.value)}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                placeholder="Vi du: Chat luong ma nguon"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Trong so (%)</label>
                                            <input
                                                type="number"
                                                value={criterion.weight}
                                                onChange={(event) => updateCriterion(criterion.id, "weight", Number(event.target.value))}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">CLO ap dung</label>
                                            <select
                                                value={criterion.cloId}
                                                onChange={(event) => updateCriterion(criterion.id, "cloId", event.target.value)}
                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                            >
                                                <option value="">Chon CLO</option>
                                                {availableClos.map((clo) => (
                                                    <option key={clo.cloId} value={clo.cloId}>
                                                        {clo.cloCode} - {clo.cloName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <RubricMatrixPreview
                    criteria={draft.criteria}
                    getCloLabel={getCloLabel}
                    validationItems={validationItems}
                    sortLevels={sortLevels}
                    onAddLevel={addCriterionLevel}
                    onDeleteLevel={deleteCriterionLevel}
                    onUpdateLevel={updateCriterionLevel}
                    onUpdateLevelDescription={updateCriterionLevelDescription}
                />

                <div className="mt-6 flex items-center justify-end gap-3">
                    {saveState !== "idle" ? (
                        <div
                            className={`mr-auto rounded-lg px-4 py-2 text-sm font-medium ${
                                saveState === "saving"
                                    ? "bg-amber-50 text-amber-700"
                                    : saveState === "success"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                            }`}
                        >
                            {saveMessage}
                        </div>
                    ) : null}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Đóng
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowRubricSample(true)}
                        disabled={isSaving}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Xem trước
                    </button>

                    <button
                        type="button"
                        disabled={isSaving}
                        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={handleSave}
                    >
                        {selectedMatrix ? "Tạo version & gửi duyệt" : "Tạo rubric & gửi duyệt"}
                    </button>
                </div>
            </div>

            <RubricSamplePreview
                open={showRubricSample}
                name={draft.name}
                description={draft.description}
                criteria={draft.criteria}
                totalWeight={totalWeight}
                getCloLabel={getCloLabel}
                sortLevels={sortLevels}
                onClose={() => setShowRubricSample(false)}
            />
        </div>
    );
}
