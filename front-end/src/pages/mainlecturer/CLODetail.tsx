import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpenCheck, Target } from "lucide-react";
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

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
        </div>
    );
}

export default function CLODetail() {
    const { cloId = "" } = useParams();
    const [clos, setClos] = useState<CloItem[]>([]);
    const [loading, setLoading] = useState(true);

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
                console.error("Không thể tải dữ liệu CLO detail", error);
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

        return (
            selected ?? {
                cloId,
                cloCode: cloId ? cloId.toUpperCase() : "CLO",
                cloName: "CLO",
                description: "Chưa có mô tả cho CLO này.",
                bloomLevel: "Chưa cập nhật",
                courseMappings: [],
            }
        );
    }, [cloId, clos]);

    if (loading) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Đang tải chi tiết CLO...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Link
                to="/mainlecturer/clo"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách CLO
            </Link>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                            {displayClo.cloCode}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{displayClo.cloName}</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{displayClo.description}</p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
                        <Target className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Bloom</p>
                            <p className="text-sm font-bold">{displayClo.bloomLevel}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <InfoCard label="Mã CLO" value={displayClo.cloCode} />
                    <InfoCard
                        label="Số khóa học"
                        value={String(displayClo.courseMappings?.length ?? 0)}
                    />
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Khóa học được gán</h2>
                        <p className="text-sm text-slate-500">Danh sách áp dụng của CLO này</p>
                    </div>
                </div>

                <div className="mt-5">
                    {(displayClo.courseMappings ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {(displayClo.courseMappings ?? []).map((mapping) => (
                                <span
                                    key={mapping.courseId}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                                >
                                    {mapping.courseId}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            CLO này chưa được gán vào khóa học nào.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
