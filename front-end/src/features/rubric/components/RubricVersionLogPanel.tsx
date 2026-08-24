import { CheckCircle2, Clock3, GitCommitHorizontal, History, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { rubricApi, type RubricVersionLog } from "@/api/RubricApi.ts";

type RubricVersionLogPanelProps = {
    searchQuery: string;
};

const statusMeta = {
    PENDING: { label: "Chờ duyệt", icon: Clock3, className: "bg-amber-50 text-amber-700 ring-amber-200" },
    APPROVED: { label: "Đã duyệt", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    REJECTED: { label: "Từ chối", icon: XCircle, className: "bg-rose-50 text-rose-700 ring-rose-200" },
} as const;

const formatDate = (value?: string | null) => value
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(value))
    : "Chưa xử lý";

export default function RubricVersionLogPanel({ searchQuery }: RubricVersionLogPanelProps) {
    const [logs, setLogs] = useState<RubricVersionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadLogs = async () => {
            try {
                setLoading(true);
                const data = await rubricApi.getVersionLogs();
                if (active) setLogs(data);
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Không thể tải nhật ký version rubric");
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadLogs();
        return () => { active = false; };
    }, []);

    const filteredLogs = useMemo(() => {
        const keyword = searchQuery.trim().toLocaleLowerCase("vi");
        if (!keyword) return logs;
        return logs.filter((log) => [
            log.rubricName,
            log.courseId,
            log.submittedByName,
            log.reviewedByName,
            `v${log.versionNumber ?? 1}`,
        ].some((value) => value?.toLocaleLowerCase("vi").includes(keyword)));
    }, [logs, searchQuery]);

    const counts = useMemo(() => ({
        total: logs.length,
        pending: logs.filter((log) => log.status === "PENDING").length,
        approved: logs.filter((log) => log.status === "APPROVED").length,
        rejected: logs.filter((log) => log.status === "REJECTED").length,
    }), [logs]);

    if (loading) {
        return <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">Đang tải nhật ký version...</div>;
    }

    return (
        <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    { label: "Tổng sự kiện", value: counts.total, tone: "text-slate-800" },
                    { label: "Chờ duyệt", value: counts.pending, tone: "text-amber-700" },
                    { label: "Đã duyệt", value: counts.approved, tone: "text-emerald-700" },
                    { label: "Từ chối", value: counts.rejected, tone: "text-rose-700" },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className={`text-2xl font-black ${item.tone}`}>{item.value}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><History className="h-5 w-5" /></div>
                    <div>
                        <h3 className="font-bold text-slate-900">Dòng thời gian version</h3>
                        <p className="text-xs text-slate-500">Theo dõi quá trình gửi và phê duyệt rubric.</p>
                    </div>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">Không tìm thấy sự kiện phù hợp.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => {
                            const meta = statusMeta[log.status] || statusMeta.PENDING;
                            const StatusIcon = meta.icon;
                            const isVersion = (log.versionNumber ?? 1) > 1;
                            return (
                                <article key={log.approvalRequestId} className="grid gap-4 px-5 py-4 hover:bg-slate-50/70 lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.75fr)_auto] lg:items-center">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                                            {isVersion ? <GitCommitHorizontal className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-bold text-slate-900">{log.rubricName}</p>
                                                <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">v{log.versionNumber ?? 1}</span>
                                                {log.sourceVersionNumber ? <span className="text-xs text-slate-400">từ v{log.sourceVersionNumber}</span> : null}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">{log.courseId || "Chưa gắn học phần"} · gửi bởi <strong className="font-semibold text-slate-700">{log.submittedByName || log.submittedBy}</strong></p>
                                            {log.feedback ? <p className="mt-2 line-clamp-1 text-xs italic text-slate-500">“{log.feedback}”</p> : null}
                                        </div>
                                    </div>

                                    <div className="text-xs leading-5 text-slate-500">
                                        <p>Gửi: <span className="font-medium text-slate-700">{formatDate(log.requestedAt)}</span></p>
                                        <p>{log.reviewedBy ? <>Duyệt bởi: <span className="font-medium text-slate-700">{log.reviewedByName || log.reviewedBy}</span></> : "Chưa có người xử lý"}</p>
                                        {log.reviewedAt ? <p>Xử lý: {formatDate(log.reviewedAt)}</p> : null}
                                    </div>

                                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>
                                        <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                                    </span>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
