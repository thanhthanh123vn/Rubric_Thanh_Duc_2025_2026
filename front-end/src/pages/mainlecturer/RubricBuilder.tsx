import { Plus, Copy, Trash2, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllRubric } from "@/features/rubric/rubricApi.ts";

type CriteriaType = {
    id: string;
    name: string;
    weight: number;
};

type RubricType = {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
    criteria: CriteriaType[];
};

export default function RubricBuilder() {

    const [rubrics, setRubrics] = useState<RubricType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRubric, setSelectedRubric] = useState<RubricType | null>(null);

    useEffect(() => {

        const handleGetAllRubric = async () => {

            try {

                const res = await getAllRubric();


                setRubrics(res.data);

            } catch (error) {

                console.log(error);

            }
        };

        handleGetAllRubric();

    }, []);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                        Xây dựng tiêu chí
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        Tạo và Quản lý Rubric
                    </h3>
                </div>

                <button
                    onClick={() => {
                        setSelectedRubric(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5" />
                    Rubric mới
                </button>

            </div>

            {/* Rubric Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {rubrics.map((rubric) => (

                    <div
                        key={rubric.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow"
                    >

                        {/* Top */}
                        <div className="flex items-start justify-between">

                            <div className="flex-1">

                                <h4 className="font-bold text-slate-900">
                                    {rubric.name}
                                </h4>

                                <p className="mt-2 text-sm text-slate-600">
                                    {rubric.description}
                                </p>

                            </div>

                            <button className="p-2 text-slate-400 hover:text-slate-600">
                                <Settings className="h-5 w-5" />
                            </button>

                        </div>

                        {/* Criteria */}
                        <div className="mt-5 space-y-3">

                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Tiêu chí đánh giá
                            </p>

                            {rubric.criteria.map((criterion) => (

                                <div
                                    key={criterion.id}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                >

                                    <div className="flex items-center gap-2 text-sm text-slate-700">

                                        <div className="h-2 w-2 rounded-full bg-indigo-600" />

                                        <span>
                                            {criterion.name}
                                        </span>

                                    </div>

                                    <span className="text-sm font-semibold text-indigo-600">
                                        {(criterion.weight * 100).toFixed(0)}%
                                    </span>

                                </div>

                            ))}

                        </div>

                        {/* Total Weight */}
                        <div className="mt-5 rounded-xl bg-indigo-50 p-4">

                            <p className="text-xs font-medium text-slate-600">
                                Tổng trọng số
                            </p>

                            <p className="mt-1 text-lg font-bold text-indigo-700">
                                {(rubric.totalWeight * 100).toFixed(0)}%
                            </p>

                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex gap-2">

                            <button className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                                Chi tiết
                            </button>

                            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                                <Copy className="h-5 w-5" />
                            </button>

                            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                                <Trash2 className="h-5 w-5" />
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            {/* Modal */}
            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

                    <div className="w-full max-w-3xl rounded-2xl bg-white p-8">

                        <h2 className="text-2xl font-bold text-slate-900">
                            {selectedRubric ? 'Chỉnh sửa Rubric' : 'Tạo Rubric mới'}
                        </h2>

                        <div className="mt-6">
                            Nội dung modal...
                        </div>

                        <div className="mt-6 flex gap-3">

                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Hủy
                            </button>

                            <button
                                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                            >
                                {selectedRubric ? 'Cập nhật' : 'Tạo'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}