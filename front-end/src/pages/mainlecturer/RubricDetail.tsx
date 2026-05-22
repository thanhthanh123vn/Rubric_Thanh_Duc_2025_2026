import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, ExternalLink, Layers3, Scale, SquareDashedBottom } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
    type CriterionLevelDescriptor,
    getAllClo,
    getRubricDetail,
    type RubricCriterion,
    type RubricLevel,
    type RubricResponse,
} from "@/features/rubric/rubricApi.ts";

type DescriptorLookup = Record<string, CriterionLevelDescriptor>;
type CloOption = {
    cloId: string;
    cloCode: string;
    cloName: string;
    bloomLevel?: string;
};

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

                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
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
                                            {descriptor?.description || "Chua co mo ta cho muc nay."}
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
    const [clos, setClos] = useState<CloOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const fetchRubricDetail = async () => {
            setLoading(true);
            setError("");

            try {
                const [response, cloResponse] = await Promise.all([
                    getRubricDetail(rubricId),
                    getAllClo(),
                ]);

                if (mounted) {
                    setRubric(response);
                    setClos(Array.isArray(cloResponse.data) ? cloResponse.data : []);
                }
            } catch {
                if (mounted) {
                    setError("Khong the tai chi tiet rubric. Vui long thu lai sau.");
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

    const cloLookup = useMemo(() => {
        return clos.reduce<Record<string, CloOption>>((lookup, clo) => {
            lookup[clo.cloId] = clo;
            return lookup;
        }, {});
    }, [clos]);

    const hasLevelMatrix = (rubric?.levels?.length ?? 0) > 0;
    const criteria = rubric?.criteria ?? [];
    const levels = rubric?.levels ?? [];
    const mappedCriteriaCount = criteria.filter((criterion) => criterion.cloId).length;
    const totalDescriptors = rubric?.criterionLevelDescriptors?.length ?? 0;
    const expectedDescriptors = criteria.length * levels.length;

    if (loading) {
        return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Dang tai chi tiet rubric...</p>
            </div>
        );
    }

    if (error || !rubric) {
        return (
            <div className="space-y-4">
                <Link
                    to="/mainlecturer/rubric"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lai danh sach rubric
                </Link>

                <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
                    {error || "Khong tim thay rubric."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                to="/mainlecturer/rubric"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lai danh sach rubric
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,_rgba(22,163,74,0.12),_rgba(74,222,128,0.10))] px-6 py-6 md:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Rubric Detail</p>
                            <h1 className="mt-2 text-3xl font-bold text-slate-900">{rubric.name}</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                {rubric.description || "Rubric nay chua co mo ta tong quan."}
                            </p>
                        </div>

                        <Link
                            to="/mainlecturer/rubric-matrix"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Chinh sua trong Rubric Matrix
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-4 md:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-green-700 shadow-sm">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Criteria</p>
                                <p className="text-2xl font-bold text-slate-900">{criteria.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-green-700 shadow-sm">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Levels</p>
                                <p className="text-2xl font-bold text-slate-900">{levels.length}</p>
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

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-amber-600 shadow-sm">
                                <Scale className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mapping Status</p>
                                <p className="text-2xl font-bold text-slate-900">{mappedCriteriaCount}/{criteria.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Criteria Overview</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Danh sach criteria va CLO</h2>
                    </div>

                    <Link
                        to="/mainlecturer/rubric-matrix"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                        Mo Rubric Matrix
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Criterion
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Weight
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        CLO
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Bloom
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {criteria.map((criterion) => {
                                    const clo = criterion.cloId ? cloLookup[criterion.cloId] : null;

                                    return (
                                        <tr key={criterion.id}>
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-900">{criterion.name}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                                                {formatWeight(criterion.weight)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {clo ? (
                                                    <div>
                                                        <p className="font-semibold text-green-700">{clo.cloCode}</p>
                                                        <p className="mt-1 text-sm text-slate-600">{clo.cloName}</p>
                                                    </div>
                                                ) : (
                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                        Chua gan CLO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {clo?.bloomLevel || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {!hasLevelMatrix && (
                <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-800 shadow-sm">
                    Rubric nay hien chua co du lieu `Rubric Level`. Hay cau hinh level va descriptor trong `Rubric Matrix` de hoan thien nghiep vu cham diem.
                </section>
            )}

            {hasLevelMatrix && (
                <div className="space-y-5">
                    {criteria.map((criterion) => (
                        <CriterionLevelTable
                            key={criterion.id}
                            criterion={criterion}
                            levels={levels}
                            descriptorLookup={descriptorLookup}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

