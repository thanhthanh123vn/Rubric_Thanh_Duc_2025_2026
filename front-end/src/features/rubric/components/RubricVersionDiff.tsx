import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Minus, Plus } from "lucide-react";
import { rubricApi } from "@/api/RubricApi.ts";

type Criterion = {
    id: string;
    name: string;
    description?: string;
    cloId?: string | null;
    weight: number;
};

type Version = {
    id: string;
    name: string;
    description?: string;
    versionNumber: number;
    criteria: Criterion[];
};

type Comparison = {
    previousVersion: Version | null;
    proposedVersion: Version;
};

const formatWeight = (weight: number) => `${Math.round((weight <= 1 ? weight * 100 : weight) * 10) / 10}%`;

const criterionKey = (criterion: Criterion) => criterion.cloId || criterion.name.trim().toLowerCase();

function VersionPanel({ version, tone }: { version: Version; tone: "old" | "new" }) {
    const accent = tone === "old" ? "border-rose-200 bg-rose-50/40" : "border-emerald-200 bg-emerald-50/40";
    return (
        <section className={`min-w-0 rounded-2xl border ${accent}`}>
            <header className="border-b border-inherit px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {tone === "old" ? "Nội dung cũ" : "Nội dung đề xuất"} · v{version.versionNumber}
                </p>
                <h5 className="mt-1 font-bold text-slate-900">{version.name}</h5>
                <p className="mt-1 text-xs leading-5 text-slate-600">{version.description || "Không có mô tả"}</p>
            </header>
            <div className="divide-y divide-slate-200/70">
                {version.criteria.map((criterion) => (
                    <div key={criterion.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-800">{criterion.name}</p>
                                <p className="mt-1 text-xs text-slate-500">CLO: {criterion.cloId || "Chưa gắn"}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
                                {formatWeight(criterion.weight)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function RubricVersionDiff({ rubricId }: { rubricId: string }) {
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");
        rubricApi.getComparison(rubricId)
            .then((data) => mounted && setComparison(data))
            .catch(() => mounted && setError("Không thể tải nội dung so sánh."))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, [rubricId]);

    const stats = useMemo(() => {
        if (!comparison?.previousVersion) return null;
        const oldMap = new Map(comparison.previousVersion.criteria.map((item) => [criterionKey(item), item]));
        const newMap = new Map(comparison.proposedVersion.criteria.map((item) => [criterionKey(item), item]));
        let changed = 0;
        newMap.forEach((item, key) => {
            const old = oldMap.get(key);
            if (old && (old.name !== item.name || old.weight !== item.weight || old.cloId !== item.cloId)) changed += 1;
        });
        return {
            added: [...newMap.keys()].filter((key) => !oldMap.has(key)).length,
            removed: [...oldMap.keys()].filter((key) => !newMap.has(key)).length,
            changed,
        };
    }, [comparison]);

    if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin"/>Đang tạo bản so sánh...</div>;
    if (error || !comparison) return <div className="p-5 text-sm text-rose-700">{error}</div>;
    if (!comparison.previousVersion) return <VersionPanel version={comparison.proposedVersion} tone="new" />;

    return (
        <div className="space-y-4">
            {stats && (
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700"><Plus className="h-3.5 w-3.5"/>{stats.added} thêm</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-rose-700"><Minus className="h-3.5 w-3.5"/>{stats.removed} xóa</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-700">{stats.changed} thay đổi</span>
                </div>
            )}
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                <VersionPanel version={comparison.previousVersion} tone="old" />
                <ArrowRight className="mx-auto mt-8 hidden h-5 w-5 text-slate-400 lg:block" />
                <VersionPanel version={comparison.proposedVersion} tone="new" />
            </div>
        </div>
    );
}
