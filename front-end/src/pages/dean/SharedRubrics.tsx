import { BookOpenCheck, CheckCircle2, Layers3, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getSharedRubrics, type RubricResponse } from "@/features/rubric/rubricApi.ts";

const formatWeight = (weight: number) => {
    const normalized = weight <= 1 ? weight * 100 : weight;
    return `${Number(normalized.toFixed(1))}%`;
};

export default function SharedRubrics() {
    const [rubrics, setRubrics] = useState<RubricResponse[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const data = await getSharedRubrics();
                if (active) setRubrics(data);
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Không thể tải rubric dùng chung");
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, []);

    const filteredRubrics = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase("vi");
        if (!keyword) return rubrics;
        return rubrics.filter((rubric) => [rubric.name, rubric.description, rubric.id]
            .some((value) => value?.toLocaleLowerCase("vi").includes(keyword)));
    }, [rubrics, search]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <header className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                            <Layers3 className="h-4 w-4" /> Thư viện cấp khoa
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Rubric dùng chung</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Bốn rubric chuẩn dùng lại cho nhiều học phần. Rubric chỉ mô tả tiêu chí và mức đánh giá;
                            CLO được ánh xạ riêng khi áp dụng rubric cho học phần hoặc bài đánh giá.
                        </p>
                    </div>
                    <label className="relative block w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm rubric..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                    </label>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Rubric dùng chung</p>
                    <p className="mt-2 text-3xl font-black text-indigo-700">{rubrics.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Đã phê duyệt</p>
                    <p className="mt-2 text-3xl font-black text-emerald-700">{rubrics.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Nguyên tắc sử dụng</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">Không gắn CLO trực tiếp vào rubric dùng chung</p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-sm text-slate-500">Đang tải rubric dùng chung...</div>
            ) : filteredRubrics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm text-slate-500">Không tìm thấy rubric phù hợp.</div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {filteredRubrics.map((rubric) => (
                        <article key={rubric.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 gap-3">
                                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
                                            <BookOpenCheck className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="font-bold text-slate-900">{rubric.name}</h2>
                                            <p className="mt-1 text-xs text-slate-500">{rubric.id} · Version {rubric.versionNumber ?? 1}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt
                                    </span>
                                </div>
                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{rubric.description || "Chưa có mô tả."}</p>
                            </div>
                            <div className="p-5">
                                <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <span>{rubric.criteria.length} tiêu chí</span>
                                    <span>Không gắn CLO</span>
                                </div>
                                <div className="space-y-2">
                                    {rubric.criteria.slice(0, 4).map((criterion) => (
                                        <div key={criterion.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                                            <span className="min-w-0 truncate font-medium text-slate-700">{criterion.name}</span>
                                            <span className="shrink-0 font-bold text-indigo-700">{formatWeight(criterion.weight)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
