import { Scale, Target, X } from "lucide-react";
import type { MatrixCriterionDraft, MatrixLevelDraft } from "@/features/rubric/components/RubricMatrixPreview.tsx";
import RubricSampleDownloadButton from "@/features/rubric/components/RubricSampleDownloadButton.tsx";

type Props = {
    open: boolean;
    name: string;
    description: string;
    criteria: MatrixCriterionDraft[];
    totalWeight: number;
    sortLevels: (levels: MatrixLevelDraft[]) => MatrixLevelDraft[];
    onClose: () => void;
};

export default function RubricSamplePreview({
                                                open,
                                                name,
                                                description,
                                                criteria,
                                                totalWeight,
                                                sortLevels,
                                                onClose,
                                            }: Props) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
            <div className="max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5 md:px-8">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Mẫu Rubric
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                {name || "Rubric chưa đặt tên"}
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                {description || "Rubric này chưa có mô tả tổng quan."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <RubricSampleDownloadButton
                                name={name}
                                description={description}
                                criteria={criteria}
                                totalWeight={totalWeight}
                                sortLevels={sortLevels}
                            />

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 bg-white px-6 py-6 md:px-8">
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Tiêu chí</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{criteria.length}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Tổng trọng số</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{totalWeight}%</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Tiêu chí đã gắn CLO</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {criteria.filter((criterion) => criterion.cloId.trim() !== "").length}/{criteria.length}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Xem trước Rubric
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                                        <Target className="h-4 w-4" />
                                        {criteria.length} Tiêu chí
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                                        <Scale className="h-4 w-4" />
                                        {totalWeight}% tổng
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-6">
                            {criteria.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                                    Chưa có tiêu chí nào.
                                </div>
                            ) : (
                                <div className="min-w-[980px] overflow-hidden rounded-2xl border border-slate-200">
                                    <div className="grid grid-cols-[220px_1fr] border-b border-slate-200 bg-slate-50">
                                        <div className="border-r border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700">
                                            Tiêu chí
                                        </div>
                                        <div className="px-4 py-4 text-sm font-semibold text-slate-700">
                                            Mức đánh giá theo từng tiêu chí
                                        </div>
                                    </div>

                                    {criteria.map((criterion) => {
                                        const levels = sortLevels(criterion.levels);

                                        return (
                                            <div
                                                key={criterion.id}
                                                className="grid grid-cols-[220px_1fr] border-b border-slate-200 last:border-b-0"
                                            >
                                                <div className="border-r border-slate-200 bg-slate-50 px-4 py-5">
                                                    <h4 className="text-base font-semibold text-slate-900">
                                                        {criterion.name || "Tiêu chí chưa đặt tên"}
                                                    </h4>
                                                    <p className="mt-2 text-sm text-slate-500">
                                                        Tên CLO: {criterion.cloId || "Chưa gắn CLO"}
                                                    </p>
                                                    <p className="mt-3 text-sm font-medium text-emerald-700">
                                                        Trọng số: {criterion.weight}%
                                                    </p>
                                                </div>

                                                <div
                                                    className="grid"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${Math.max(levels.length, 1)}, minmax(180px, 1fr))`,
                                                    }}
                                                >
                                                    {levels.length === 0 ? (
                                                        <div className="flex items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
                                                            Tiêu chí này chưa có mức đánh giá.
                                                        </div>
                                                    ) : (
                                                        levels.map((level, index) => (
                                                            <div
                                                                key={level.id}
                                                                className={`px-4 py-5 ${index < levels.length - 1 ? "border-r border-slate-200" : ""}`}
                                                            >
                                                                <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                        {level.name || `Mức ${index + 1}`}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-slate-600">
                                                                        {level.score} điểm
                                                                    </p>
                                                                </div>

                                                                <div className="mt-4 text-sm leading-6 text-slate-600">
                                                                    {level.description || "Chưa có mô tả cho mức này."}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}