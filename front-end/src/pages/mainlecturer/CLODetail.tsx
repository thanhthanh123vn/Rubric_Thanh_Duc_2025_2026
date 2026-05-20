import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, BookOpenCheck, PencilLine, PlusCircle, Trash2 } from "lucide-react";
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

type CloLevelDraft = {
    id: string;
    name: string;
    scorePercent: number;
    description: string;
    evidence: string;
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

const fallbackLevels: CloLevelDraft[] = [
    {
        id: "level-1",
        name: "Chua dat",
        scorePercent: 25,
        description: "Minh chung roi rac, chua dap ung tron ven yeu cau cua CLO.",
        evidence: "Can bo sung demo, bao cao hoac bai lam de xac nhan nang luc.",
    },
    {
        id: "level-2",
        name: "Dat toi thieu",
        scorePercent: 50,
        description: "Hoan thanh phan cot loi nhung van can ho tro o mot so buoc phan tich.",
        evidence: "Co san pham co ban, lap luan ngan va can them doi chieu tieu chi.",
    },
    {
        id: "level-3",
        name: "Kha",
        scorePercent: 75,
        description: "Thuc hien dung yeu cau, giai thich duoc lua chon va ket qua.",
        evidence: "San pham day du, co minh chung va giai trinh hop ly.",
    },
    {
        id: "level-4",
        name: "Xuat sac",
        scorePercent: 100,
        description: "Vuot muc mong doi, minh chung ro va co chieu sau phan tich.",
        evidence: "San pham hoan chinh, co cai tien va phan bien thuyet phuc.",
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
    const [levels, setLevels] = useState<CloLevelDraft[]>(fallbackLevels);

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
    const averageScorePercent = levels.length > 0
        ? Math.round(levels.reduce((sum, item) => sum + item.scorePercent, 0) / levels.length)
        : 0;
    const strongestLevel = levels.reduce<CloLevelDraft | null>((selected, item) => {
        if (!selected || item.scorePercent > selected.scorePercent) {
            return item;
        }

        return selected;
    }, null);

    const updateWeight = (id: string, value: number) => {
        setWeights((current) =>
            current.map((item) => (item.id === id ? { ...item, cloWeight: value } : item)),
        );
    };

    const updateLevel = (id: string, field: keyof CloLevelDraft, value: string | number) => {
        setLevels((current) =>
            current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        );
    };

    const addLevel = () => {
        setLevels((current) => [
            ...current,
            {
                id: `level-${Date.now()}`,
                name: `Muc ${current.length + 1}`,
                scorePercent: 0,
                description: "",
                evidence: "",
            },
        ]);
    };

    const deleteLevel = (id: string) => {
        setLevels((current) => current.filter((item) => item.id !== id));
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
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lai danh sach CLO
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,_rgba(37,99,235,0.10),_rgba(20,184,166,0.10))] px-6 py-6 md:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">CLO Workspace</p>
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
                                Day la man quan ly level cua CLO. Viec gan CLO vao criteria se duoc thuc hien trong rubric detail.
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
                        label="So level hien co"
                        value={String(levels.length)}
                        note="Hien thi cac level cua CLO va cho phep them, sua, xoa truc tiep."
                        tone="border-emerald-200 bg-emerald-50"
                    />
                    <StatCard
                        icon={<BarChart3 className="h-5 w-5" />}
                        label="Tong trong so CLO"
                        value={`${totalCloWeight}%`}
                        note="Mau giao dien cho bang assessment_clo de can doi phan bo trong so trong tung assessment."
                        tone="border-sky-200 bg-sky-50"
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
                        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
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

                    <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-slate-600">
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
                        <div className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
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

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Level noi bat</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{strongestLevel?.name ?? "Chua co"}</p>
                            <p className="mt-2 text-sm text-slate-600">
                                {strongestLevel
                                    ? `Dang dat ${strongestLevel.scorePercent}% trong bo level hien tai.`
                                    : "Them level dau tien de bat dau chuan hoa rubric level."}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Level Designer</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Danh sach level hien co</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Hien thi va quan ly toan bo level cua CLO. Giang vien chinh co the them, sua hoac xoa bat ky level nao ngay tren man nay.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addLevel}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Them level
                    </button>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Hien co {levels.length} level, muc trung binh {averageScorePercent}%. Phan nay chi tap trung quan ly level, khong con chua chuc nang gan CLO vao rubric.
                </div>

                <div className="mt-6 space-y-4">
                    {levels.map((level, index) => (
                        <article key={level.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            Level {index + 1}
                                        </span>
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                            {level.scorePercent}%
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        value={level.name}
                                        onChange={(event) => updateLevel(level.id, "name", event.target.value)}
                                        className="mt-3 w-full bg-transparent text-xl font-bold text-slate-900 outline-none"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex w-28 items-center rounded-xl border border-slate-200 bg-white px-3">
                                        <input
                                            type="number"
                                            value={level.scorePercent}
                                            onChange={(event) => updateLevel(level.id, "scorePercent", Number(event.target.value))}
                                            className="w-full py-3 text-sm font-semibold text-slate-900 outline-none"
                                        />
                                        <span className="text-sm text-slate-500">%</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => deleteLevel(level.id)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Xoa
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-2xl bg-white p-4">
                                    <label className="text-sm font-medium text-slate-700">Mo ta muc dat duoc</label>
                                    <textarea
                                        rows={3}
                                        value={level.description}
                                        onChange={(event) => updateLevel(level.id, "description", event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                                    />
                                </div>

                                <div className="rounded-2xl bg-white p-4">
                                    <label className="text-sm font-medium text-slate-700">Minh chung ky vong</label>
                                    <textarea
                                        rows={2}
                                        value={level.evidence}
                                        onChange={(event) => updateLevel(level.id, "evidence", event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                                    />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
