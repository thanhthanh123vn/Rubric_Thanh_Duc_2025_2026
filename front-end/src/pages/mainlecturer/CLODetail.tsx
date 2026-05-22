import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, BookOpenCheck, PencilLine } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getAllClo } from "@/features/rubric/rubricApi.ts";

type CloItem = {
    cloId: string;
    cloName: string;
    cloCode: string;
    description: string;
    bloomLevel: string;
    courseMappings?: Array<{ courseId: string }>;
};

type AssessmentWeight = {
    id: string;
    assessmentName: string;
    assessmentType: string;
    assessmentWeight: number;
    cloWeight: number;
    dueWindow: string;
};

const fallbackAssessmentWeights: AssessmentWeight[] = [
    {
        id: "asm-1",
        assessmentName: "Project Sprint 1",
        assessmentType: "Project",
        assessmentWeight: 30,
        cloWeight: 15,
        dueWindow: "Tuan 4 - Tuan 6",
    },
    {
        id: "asm-2",
        assessmentName: "Demo giua ky",
        assessmentType: "Presentation",
        assessmentWeight: 20,
        cloWeight: 10,
        dueWindow: "Tuan 8",
    },
    {
        id: "asm-3",
        assessmentName: "Bao cao cuoi ky",
        assessmentType: "Report",
        assessmentWeight: 50,
        cloWeight: 25,
        dueWindow: "Tuan 14 - Tuan 15",
    },
];

function StatCard({
    icon,
    label,
    value,
    note,
    tone,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    note: string;
    tone: string;
}) {
    return (
        <div className={`rounded-[1.75rem] border p-5 shadow-sm ${tone}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function CLODetail() {
    const { cloId = "" } = useParams();
    const [clos, setClos] = useState<CloItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [weights, setWeights] = useState<AssessmentWeight[]>(fallbackAssessmentWeights);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            setLoading(true);

            try {
                const cloResponse = await getAllClo();

                if (mounted) {
                    setClos(Array.isArray(cloResponse.data) ? cloResponse.data : []);
                }
            } catch (error) {
                console.error("Khong the tai du lieu CLO detail", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadData();

        return () => {
            mounted = false;
        };
    }, []);

    const displayClo = useMemo(() => {
        const selected = clos.find((item) => item.cloId === cloId);

        return selected ?? {
            cloId,
            cloCode: cloId ? cloId.toUpperCase() : "CLO",
            cloName: "CLO dang duoc thiet ke giao dien",
            description: "Thong tin chi tiet CLO se hien thi day du khi backend tra ve.",
            bloomLevel: "Van dung",
            courseMappings: [{ courseId: "SE330" }, { courseId: "SE445" }],
        };
    }, [cloId, clos]);

    const totalCloWeight = weights.reduce((sum, item) => sum + item.cloWeight, 0);

    const updateWeight = (id: string, value: number) => {
        setWeights((current) =>
            current.map((item) => (item.id === id ? { ...item, cloWeight: value } : item)),
        );
    };

    if (loading) {
        return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Dang tai giao dien chi tiet CLO...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                to="/mainlecturer/clo"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lai danh sach CLO
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,_rgba(22,163,74,0.12),_rgba(74,222,128,0.10))] px-6 py-6 md:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">CLO Workspace</p>
                    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700">
                                {displayClo.cloCode}
                            </div>
                            <h1 className="mt-3 text-3xl font-bold text-slate-900">{displayClo.cloName}</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{displayClo.description}</p>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bloom Level</p>
                            <p className="mt-2 text-xl font-bold text-slate-900">{displayClo.bloomLevel}</p>
                            <p className="mt-2 text-sm text-slate-600">
                                Man nay chi quan ly thong tin CLO va phan bo trong so. `Level` duoc cau hinh trong rubric detail.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
                    <StatCard
                        icon={<BookOpenCheck className="h-5 w-5" />}
                        label="Mon hoc dang ap dung"
                        value={String(displayClo.courseMappings?.length ?? 0)}
                        note="Lay tu lien ket course_clo va course_clo_map de giang vien nhin nhanh pham vi ap dung."
                        tone="border-slate-200 bg-slate-50"
                    />
                    <StatCard
                        icon={<PencilLine className="h-5 w-5" />}
                        label="Bloom level"
                        value={displayClo.bloomLevel}
                        note="Bloom level la thuoc tinh cua CLO, khac voi rubric level duoc dinh nghia trong tung rubric."
                        tone="border-emerald-200 bg-emerald-50"
                    />
                    <StatCard
                        icon={<BarChart3 className="h-5 w-5" />}
                        label="Tong trong so CLO"
                        value={`${totalCloWeight}%`}
                        note="Mau giao dien cho bang assessment_clo de can doi phan bo trong so trong tung assessment."
                        tone="border-green-200 bg-green-50"
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                CLO Weight Setup
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Tao trong so CLO theo assessment</h2>
                        </div>
                        <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                            assessment_clo
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Assessment
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Weight cua bai
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            CLO weight
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {weights.map((item) => (
                                        <tr key={item.id} className="align-top">
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-900">{item.assessmentName}</p>
                                                <p className="mt-1 text-sm text-slate-500">{item.dueWindow}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-700">{item.assessmentType}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-900">{item.assessmentWeight}%</td>
                                            <td className="px-4 py-4">
                                                <div className="flex max-w-[140px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                                                    <input
                                                        type="number"
                                                        value={item.cloWeight}
                                                        onChange={(event) => updateWeight(item.id, Number(event.target.value))}
                                                        className="w-full bg-transparent py-3 text-sm font-semibold text-slate-900 outline-none"
                                                    />
                                                    <span className="text-sm text-slate-500">%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-dashed border-green-200 bg-green-50 p-4 text-sm leading-6 text-slate-600">
                        Giao dien nay uu tien cho thao tac phan bo `clo_weight` nhanh. Sau nay khi noi API, co the gan truc tiep vao cap `assessment_id` + `clo_id`.
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                CLO Snapshot
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Thong tin tong hop</h2>
                        </div>
                        <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                            course_clo
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mo ta CLO</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{displayClo.description}</p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Course mappings</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(displayClo.courseMappings ?? []).map((mapping) => (
                                    <span
                                        key={mapping.courseId}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                                    >
                                        {mapping.courseId}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Rubric flow</p>
                            <p className="mt-2 text-sm leading-6 text-amber-900">
                                `Level` khong thuoc CLO detail. Level va mo ta muc dat duoc phai dinh nghia trong rubric detail, sau do criterion moi duoc gan vao CLO.
                            </p>
                            <Link
                                to="/mainlecturer/rubric"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900"
                            >
                                Mo danh sach rubric
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

