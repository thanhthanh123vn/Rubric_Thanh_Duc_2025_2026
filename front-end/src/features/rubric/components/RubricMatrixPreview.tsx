import { Plus, Trash2 } from "lucide-react";

export interface MatrixLevelDraft {
    id: string;
    name: string;
    orderIndex: number;
    score: number;
    description: string;
}

export interface MatrixCriterionDraft {
    id: string;
    name: string;
    weight: number;
    cloId: string;
    levels: MatrixLevelDraft[];
}

export interface MatrixValidationItem {
    label: string;
    ok: boolean;
    note: string;
}

type Props = {
    criteria: MatrixCriterionDraft[];
    validationItems: MatrixValidationItem[];
    sortLevels: (levels: MatrixLevelDraft[]) => MatrixLevelDraft[];
    onAddLevel: (criterionId: string) => void;
    onDeleteLevel: (criterionId: string, levelId: string) => void;
    onUpdateLevel: (
        criterionId: string,
        levelId: string,
        field: keyof MatrixLevelDraft,
        value: string | number,
    ) => void;
    onUpdateLevelDescription: (criterionId: string, levelId: string, description: string) => void;
};

export default function RubricMatrixPreview({
                                                criteria,
                                                validationItems,
                                                sortLevels,
                                                onAddLevel,
                                                onDeleteLevel,
                                                onUpdateLevel,
                                                onUpdateLevelDescription,
                                            }: Props) {
    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Mô tả ma trận
                    </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                    {validationItems.map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-xl px-4 py-3 text-sm ${
                                item.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            <p className="font-semibold">{item.label}</p>
                            <p className="mt-1">{item.note}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead>
                    <tr>
                        <th className="sticky left-0 z-10 min-w-[260px] rounded-tl-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                            Tiêu chí
                        </th>
                        <th className="min-w-[720px] rounded-tr-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                            Mức đánh giá của từng tiêu chí
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {criteria.map((criterion) => (
                        <tr key={criterion.id}>
                            <td className="sticky left-0 z-10 min-w-[260px] border border-slate-200 bg-white px-4 py-4 align-top">
                                <p className="font-semibold text-slate-900">{criterion.name || "Tiêu chí chưa đặt tên"}</p>
                                <p className="mt-1 text-xs text-slate-500">Trọng số {criterion.weight}%</p>
                                <p className="mt-2 text-xs text-indigo-600">
                                    {criterion.cloId || "Chưa gắn CLO"}
                                </p>
                            </td>

                            <td className="border border-slate-200 bg-white px-4 py-4 align-top">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => onAddLevel(criterion.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Thêm mức đánh giá
                                        </button>
                                    </div>

                                    {criterion.levels.length === 0 ? (
                                        <p className="text-sm text-slate-500">Tiêu chí này chưa có mức đánh giá nào.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {sortLevels(criterion.levels).map((level) => (
                                                <article key={level.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="grid gap-4 lg:grid-cols-[1fr_110px_110px_48px]">
                                                        <div>
                                                            <label className="text-sm font-medium text-slate-700">Tên mức</label>
                                                            <input
                                                                type="text"
                                                                value={level.name}
                                                                onChange={(event) =>
                                                                    onUpdateLevel(criterion.id, level.id, "name", event.target.value)
                                                                }
                                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium text-slate-700">Điểm số</label>
                                                            <input
                                                                type="number"
                                                                value={level.score}
                                                                onChange={(event) =>
                                                                    onUpdateLevel(criterion.id, level.id, "score", Number(event.target.value))
                                                                }
                                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-sm font-medium text-slate-700">Thứ tự</label>
                                                            <input
                                                                type="number"
                                                                value={level.orderIndex}
                                                                onChange={(event) =>
                                                                    onUpdateLevel(criterion.id, level.id, "orderIndex", Number(event.target.value))
                                                                }
                                                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                                            />
                                                        </div>

                                                        <div className="flex items-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => onDeleteLevel(criterion.id, level.id)}
                                                                className="w-full rounded-xl border border-red-200 bg-white p-3 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="mx-auto h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                                            Mô tả tiêu chí đạt được
                                                        </label>
                                                        <textarea
                                                            rows={4}
                                                            value={level.description}
                                                            onChange={(event) =>
                                                                onUpdateLevelDescription(criterion.id, level.id, event.target.value)
                                                            }
                                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                                                            placeholder="Mô tả kỳ vọng đầu ra chi tiết cho mức đánh giá này..."
                                                        />
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}