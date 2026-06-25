import { Copy, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateRubricModal from "@/features/rubric/components/CreateRubricModal.tsx";
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

const PERCENT_RATIO_EPSILON = 0.0001;

const formatPercent = (value: number) => {
    const isRatioValue = value <= 1 + PERCENT_RATIO_EPSILON;
    const normalized = isRatioValue ? value * 100 : value;
    const rounded = Math.abs(normalized - Math.round(normalized)) < PERCENT_RATIO_EPSILON
        ? Math.round(normalized)
        : Number(normalized.toFixed(1));

    return `${rounded}%`;
};

export default function RubricBuilder() {
    const [rubrics, setRubrics] = useState<RubricType[]>([]);
    const [showModal, setShowModal] = useState(false);
     const fetchAllRubrics = async () => {
        try {
            const res = await getAllRubric();
            return Array.isArray(res.data) ? res.data : [];
        } catch (error) {
            console.error("Lỗi lấy danh sách rubric:", error);
            return [];
        }
    };
    useEffect(() => {
        const loadData = async () => {
            const rubrics = await fetchAllRubrics();
            setRubrics(rubrics);
        };

        void loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Rubric Studio</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">Tạo và quản lý rubric</h3>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                    <Plus className="h-5 w-5" />
                    Rubric mới
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rubrics.map((rubric) => (
                    <div
                        key={rubric.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{rubric.name}</h4>
                                <p className="mt-2 text-sm text-slate-600">{rubric.description}</p>
                            </div>

                            <button className="p-2 text-slate-400 hover:text-slate-600">
                                <Settings className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Tiêu chí đánh giá</p>

                            {rubric.criteria.map((criterion) => (
                                <div
                                    key={criterion.id}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <div className="h-2 w-2 rounded-full bg-green-700" />
                                        <span>{criterion.name}</span>
                                    </div>

                                    <span className="text-sm font-semibold text-green-700">{formatPercent(criterion.weight)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 rounded-xl bg-green-50 p-4">
                            <p className="text-xs font-medium text-slate-600">Tổng trọng số</p>
                            <p className="mt-1 text-lg font-bold text-green-700">{formatPercent(rubric.totalWeight)}</p>
                        </div>

                        <div className="mt-5 flex gap-2">
                            <Link
                                to={`/mainlecturer/rubric/${rubric.id}`}
                                className="flex-1 rounded-lg border border-green-200 bg-green-50 py-2 text-center text-sm font-medium text-green-700 hover:bg-green-100"
                            >
                                Chi tiết
                            </Link>

                            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700">
                                <Copy className="h-5 w-5" />
                            </button>

                            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && <CreateRubricModal open={showModal} onClose={() => setShowModal(false)}
                                             onSuccess={() => {

                fetchAllRubrics();
            }} />}
        </div>
    );
}

