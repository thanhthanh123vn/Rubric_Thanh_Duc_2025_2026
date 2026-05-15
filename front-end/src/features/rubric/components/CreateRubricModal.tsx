import { useEffect, useMemo, useState } from "react";
import { Trash2, X, Plus } from "lucide-react";

type CloType = {
    cloId: string;
    cloCode: string;
};

type CriteriaType = {
    id?: string;
    name: string;
    weight: number;
    cloId: string | null;
};

type RubricResponse = {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
    criteria: CriteriaType[];
};

type Props = {
    open: boolean;
    onClose: () => void;
    rubric?: RubricResponse | null;
};

export default function CreateRubricModal({
                                              open,
                                              onClose,
                                              rubric,
                                          }: Props) {

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    /**
     * mock clos
     * sau này fetch api
     */
    const [clos] = useState<CloType[]>([
        {
            cloId: "CLO1",
            cloCode: "CLO1",
        },
        {
            cloId: "CLO2",
            cloCode: "CLO2",
        },
        {
            cloId: "CLO3",
            cloCode: "CLO3",
        },
    ]);

    const [criteria, setCriteria] = useState<CriteriaType[]>([
        {
            name: "",
            weight: 0,
            cloId: null,
        },
    ]);

    /**
     * mapping response -> state
     */
    useEffect(() => {

        if (!rubric) return;

        setName(rubric.name);

        setDescription(rubric.description);

        setCriteria(
            rubric.criteria.map((item) => ({
                id: item.id,
                name: item.name,
                cloId: item.cloId,
                /**
                 * BE: 0.2
                 * FE: 20
                 */
                weight: Number(item.weight) * 100,
            }))
        );

    }, [rubric]);

    const totalWeight = useMemo(() => {

        return criteria.reduce((sum, item) => {
            return sum + Number(item.weight || 0);
        }, 0);

    }, [criteria]);

    const handleAddCriteria = () => {

        setCriteria((prev) => [
            ...prev,
            {
                name: "",
                weight: 0,
                cloId: null,
            },
        ]);

    };

    const handleRemoveCriteria = (index: number) => {

        setCriteria((prev) =>
            prev.filter((_, i) => i !== index)
        );

    };

    const handleChangeCriteria = (
        index: number,
        field: keyof CriteriaType,
        value: string | number | null
    ) => {

        setCriteria((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );

    };

    const handleSubmit = () => {

        const payload = {
            name,
            description,
            criteria: criteria.map((item) => ({
                id: item.id,
                name: item.name,
                cloId: item.cloId,
                /**
                 * FE: 20
                 * BE: 0.2
                 */
                weight: Number(item.weight) / 100,
            })),
        };

        console.log(payload);

        // call api

    };

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">

                    <div>

                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                            Rubric
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            {rubric
                                ? "Chỉnh sửa Rubric"
                                : "Tạo Rubric mới"}
                        </h2>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                {/* Body */}
                <div className="max-h-[75vh] space-y-6 overflow-y-auto px-8 py-6">

                    {/* Name */}
                    <div>

                        <label className="block text-sm font-semibold text-slate-700">
                            Tên Rubric
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Rubric đánh giá đồ án"
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        />

                    </div>

                    {/* Description */}
                    <div>

                        <label className="block text-sm font-semibold text-slate-700">
                            Mô tả
                        </label>

                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả rubric..."
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        />

                    </div>

                    {/* Criteria */}
                    <div>

                        <div className="mb-4 flex items-center justify-between">

                            <div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    Tiêu chí đánh giá
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Thêm tiêu chí, CLO và trọng số
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleAddCriteria}
                                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm tiêu chí
                            </button>

                        </div>

                        <div className="space-y-4">

                            {criteria.map((criterion, index) => (

                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 p-4"
                                >

                                    <div className="grid gap-4 md:grid-cols-12">

                                        {/* Name */}
                                        <div className="md:col-span-5">

                                            <label className="block text-sm font-medium text-slate-700">
                                                Tên tiêu chí
                                            </label>

                                            <input
                                                type="text"
                                                value={criterion.name}
                                                onChange={(e) =>
                                                    handleChangeCriteria(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="VD: Làm việc nhóm"
                                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                                            />

                                        </div>

                                        {/* CLO */}
                                        <div className="md:col-span-3">

                                            <label className="block text-sm font-medium text-slate-700">
                                                CLO
                                            </label>

                                            <select
                                                value={criterion.cloId || ""}
                                                onChange={(e) =>
                                                    handleChangeCriteria(
                                                        index,
                                                        "cloId",
                                                        e.target.value || null
                                                    )
                                                }
                                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                                            >

                                                <option value="">
                                                    Chưa gắn CLO
                                                </option>

                                                {clos.map((clo) => (

                                                    <option
                                                        key={clo.cloId}
                                                        value={clo.cloId}
                                                    >
                                                        {clo.cloCode}
                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                        {/* Weight */}
                                        <div className="md:col-span-3">

                                            <label className="block text-sm font-medium text-slate-700">
                                                Trọng số (%)
                                            </label>

                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={criterion.weight}
                                                onChange={(e) =>
                                                    handleChangeCriteria(
                                                        index,
                                                        "weight",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                placeholder="20"
                                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                                            />

                                        </div>

                                        {/* Delete */}
                                        <div className="flex items-end md:col-span-1">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveCriteria(index)
                                                }
                                                className="w-full rounded-xl border border-red-200 p-3 text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="mx-auto h-5 w-5" />
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* Total */}
                    <div className="rounded-2xl bg-slate-50 p-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-600">
                                    Tổng trọng số
                                </p>

                                <p className="mt-1 text-2xl font-bold text-indigo-700">
                                    {totalWeight}%
                                </p>

                            </div>

                            <div
                                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                                    totalWeight === 100
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {totalWeight === 100
                                    ? "Hợp lệ"
                                    : "Tổng phải bằng 100%"}
                            </div>

                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-200 px-8 py-6">

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={totalWeight !== 100}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {rubric
                            ? "Cập nhật Rubric"
                            : "Tạo Rubric"}
                    </button>

                </div>

            </div>

        </div>

    );
}