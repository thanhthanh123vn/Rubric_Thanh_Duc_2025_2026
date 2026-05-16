import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Layers3, Scale, SquareDashedBottom } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
    type CriterionLevelDescriptor,
    getRubricDetail,
    type RubricCriterion,
    type RubricLevel,
    type RubricResponse,
} from "@/features/rubric/rubricApi.ts";

type DescriptorLookup = Record<string, CriterionLevelDescriptor>;

const PERCENT_RATIO_EPSILON = 0.0001;

const formatWeight = (weight: number) => {
    const isRatioValue = weight <= 1 + PERCENT_RATIO_EPSILON;
    const normalizedWeight = isRatioValue ? weight * 100 : weight;
    const rounded = Math.abs(normalizedWeight - Math.round(normalizedWeight)) < PERCENT_RATIO_EPSILON
        ? Math.round(normalizedWeight)
        : Number(normalizedWeight.toFixed(1));

    return `${rounded}%`;
};

function CriterionLevelTable({
    criterion,
    levels,
    descriptorLookup,
}: {
    criterion: RubricCriterion;
    levels: RubricLevel[];
    descriptorLookup: DescriptorLookup;
}) {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Criterion
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">{criterion.name}</h3>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                    <Scale className="h-4 w-4" />
                    Weight {formatWeight(criterion.weight)}
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Level
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Score
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Description
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {levels.map((level) => {
                                const descriptor = descriptorLookup[`${criterion.id}:${level.id}`];

                                return (
                                    <tr key={level.id} className="align-top">
                                        <td className="px-4 py-4">
                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                                {level.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                                            {descriptor ? descriptor.score : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-sm leading-6 text-slate-600">
                                            {descriptor?.description || "Chưa có mô tả cho mức này."}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default function RubricDetail() {
    const { rubricId = "" } = useParams();
    const [rubric, setRubric] = useState<RubricResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchRubricDetail = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getRubricDetail(rubricId);

                if (mounted) {
                    setRubric(response);
                }
            } catch {
                if (mounted) {
                    setError("Không thể tải chi tiết rubric. Vui lòng thử lại sau.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void fetchRubricDetail();

        return () => {
            mounted = false;
        };
    }, [rubricId]);

    const descriptorLookup = useMemo(() => {
        return (rubric?.criterionLevelDescriptors ?? []).reduce<DescriptorLookup>((lookup, descriptor) => {
            lookup[`${descriptor.criterionId}:${descriptor.levelId}`] = descriptor;
            return lookup;
        }, {});
    }, [rubric?.criterionLevelDescriptors]);

    const hasLevelMatrix = (rubric?.levels?.length ?? 0) > 0;

    if (loading) {
        return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Đang tải chi tiết rubric...</p>
            </div>
        );
    }

    if (error || !rubric) {
        return (
            <div className="space-y-4">
                <Link
                    to="/mainlecturer/rubric"
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách rubric
                </Link>

                <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
                    {error || "Không tìm thấy rubric."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                to="/mainlecturer/rubric"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách rubric
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,_rgba(79,70,229,0.10),_rgba(14,165,233,0.08))] px-6 py-6 md:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Rubric Detail</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">{rubric.name}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {rubric.description || "Rubric này chưa có mô tả tổng quan."}
                    </p>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-indigo-600 shadow-sm">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Criteria</p>
                                <p className="text-2xl font-bold text-slate-900">{rubric.criteria.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-cyan-600 shadow-sm">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Levels</p>
                                <p className="text-2xl font-bold text-slate-900">{rubric.levels?.length ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                                <SquareDashedBottom className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Weight</p>
                                <p className="text-2xl font-bold text-slate-900">{formatWeight(rubric.totalWeight)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {!hasLevelMatrix && (
                <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-800 shadow-sm">
                    Rubric này hiện chưa có dữ liệu `Rubric Level`. Trang vẫn hiển thị thông tin tổng quan và sẽ tự render ma trận
                    khi backend trả về `levels` cùng `criterionLevelDescriptors`.
                </section>
            )}

            <div className="space-y-5">
                {rubric.criteria.map((criterion) => (
                    <CriterionLevelTable
                        key={criterion.id}
                        criterion={criterion}
                        levels={rubric.levels ?? []}
                        descriptorLookup={descriptorLookup}
                    />
                ))}
            </div>
        </div>
    );
}
