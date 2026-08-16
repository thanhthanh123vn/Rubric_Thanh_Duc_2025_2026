import { Copy, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CreateRubricModal from "@/features/rubric/components/CreateRubricModal.tsx";
import { cloneRubricVersion, getMyRubrics } from "@/features/rubric/rubricApi.ts";
import RubricVersionList from "@/pages/mainlecturer/RubricVersionList.tsx";

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
    rubricType?: "FACULTY" | "LECTURER_VARIANT";
    versionNumber?: number;
    status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
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

function LegacyRubricBuilder() {
    const [rubrics, setRubrics] = useState<RubricType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [cloningId, setCloningId] = useState<string | null>(null);
     const fetchAllRubrics = async () => {
        try {
            const res = await getMyRubrics();
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

    const handleClone = async (rubric: RubricType) => {
        try {
            setCloningId(rubric.id);
            await cloneRubricVersion(rubric.id);
            setRubrics(await fetchAllRubrics());
            toast.success("Đã tạo rubric version và gửi Trưởng khoa duyệt");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể tạo rubric version");
        } finally {
            setCloningId(null);
        }
    };

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
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                                    <span className={`rounded-full px-2.5 py-1 ${rubric.rubricType === "LECTURER_VARIANT" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                                        {rubric.rubricType === "LECTURER_VARIANT" ? "Bản riêng" : "Rubric chung"} · v{rubric.versionNumber ?? 1}
                                    </span>
                                    {rubric.status && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                            {rubric.status}
                                        </span>
                                    )}
                                </div>
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

                            {rubric.rubricType !== "LECTURER_VARIANT" && rubric.status === "APPROVED" && (
                                <button
                                    type="button"
                                    disabled={cloningId === rubric.id}
                                    onClick={() => void handleClone(rubric)}
                                    title="Tạo version riêng từ rubric này"
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700 disabled:cursor-wait disabled:opacity-50"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                            )}

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

export default function RubricBuilder() {
    return <RubricVersionList />;
}

