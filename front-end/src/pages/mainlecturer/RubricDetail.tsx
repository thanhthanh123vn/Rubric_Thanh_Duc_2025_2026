import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Layers3, Link2, Scale, SquareDashedBottom } from "lucide-react";
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
    const [criterionCloMap, setCriterionCloMap] = useState<Record<string, string>>({});

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

    useEffect(() => {
        if (!rubric) {
            return;
        }

        setCriterionCloMap(
            rubric.criteria.reduce<Record<string, string>>((lookup, criterion) => {
                lookup[criterion.id] = criterion.cloId ?? "";
                return lookup;
            }, {}),
        );
    }, [rubric]);

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
    const mappedCriteriaCount = Object.values(criterionCloMap).filter(Boolean).length;

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
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
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
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lai danh sach rubric
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,_rgba(79,70,229,0.10),_rgba(14,165,233,0.08))] px-6 py-6 md:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Rubric Detail</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">{rubric.name}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {rubric.description || "Rubric nay chua co mo ta tong quan."}
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

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">CLO Mapping</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Gan CLO vao criteria</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Phan nay dung cho viec map `clo_id` vao tung `rubric_criteria`. Moi criterion co the duoc gan mot CLO de tao dung flow OBE.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                        <Link2 className="h-4 w-4" />
                        {mappedCriteriaCount}/{rubric.criteria.length} criteria da gan CLO
                    </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {rubric.criteria.map((criterion) => {
                        const selectedCloId = criterionCloMap[criterion.id] ?? "";
                        const selectedClo = selectedCloId ? cloLookup[selectedCloId] : null;

                        return (
                            <article key={criterion.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-900">{criterion.name}</h3>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                                {formatWeight(criterion.weight)}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            Chon CLO phu hop cho criterion nay. Sau khi noi API, gia tri se map vao truong `clo_id`.
                                        </p>
                                    </div>

                                    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        selectedClo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    }`}>
                                        {selectedClo ? "Da gan CLO" : "Chua gan CLO"}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl bg-white p-4">
                                    <label className="text-sm font-medium text-slate-700">CLO ap dung</label>
                                    <select
                                        value={selectedCloId}
                                        onChange={(event) =>
                                            setCriterionCloMap((current) => ({
                                                ...current,
                                                [criterion.id]: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                                    >
                                        <option value="">Chon CLO cho criterion nay</option>
                                        {clos.map((clo) => (
                                            <option key={clo.cloId} value={clo.cloId}>
                                                {clo.cloCode} - {clo.cloName}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedClo ? (
                                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {selectedClo.cloCode}
                                                </span>
                                                {selectedClo.bloomLevel && (
                                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                                        {selectedClo.bloomLevel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-3 font-semibold text-slate-900">{selectedClo.cloName}</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Criterion nay se duoc tinh vao phan danh gia cua CLO da chon trong rubric detail.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                            Chua co CLO nao duoc gan cho criterion nay.
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {!hasLevelMatrix && (
                <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-800 shadow-sm">
                    Rubric nay hien chua co du lieu `Rubric Level`. Trang van hien thi thong tin tong quan va se tu render ma tran khi backend tra ve `levels` cung `criterionLevelDescriptors`.
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
