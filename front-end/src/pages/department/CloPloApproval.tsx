import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Eye, Link2, Loader2, Search, X, XCircle } from "lucide-react";
import { toast } from "sonner";

import cloPloApprovalApi, { type CloPloStatus, type CloPloSubmission } from "@/api/cloPloApprovalApi.ts";
import { Button } from "@/components/ui/button.tsx";

const tabs: Array<{ value: CloPloStatus; label: string }> = [
    { value: "PENDING_REVIEW", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
];

function errorMessage(error: any) {
    return error?.response?.data?.message || error?.response?.data || "Không thể xử lý yêu cầu.";
}

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString("vi-VN") : "—";
}

export default function CloPloApproval() {
    const [status, setStatus] = useState<CloPloStatus>("PENDING_REVIEW");
    const [items, setItems] = useState<CloPloSubmission[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<CloPloSubmission | null>(null);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        try { setLoading(true); setItems(await cloPloApprovalApi.getApprovals(status)); }
        catch (error) { toast.error(errorMessage(error)); }
        finally { setLoading(false); }
    };

    useEffect(() => { void load(); }, [status]);

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return keyword ? items.filter((item) => `${item.courseCode} ${item.courseName} ${item.mainLecturerName || ""}`.toLowerCase().includes(keyword)) : items;
    }, [items, query]);

    const review = async (action: "APPROVE" | "REJECT") => {
        if (!selected?.submissionId) return;
        if (action === "REJECT" && !reason.trim()) return toast.error("Vui lòng nhập lý do từ chối.");
        const profileName = selected.submissionType === "CLO_PLO_MAPPING"
            ? "mapping CLO - PLO"
            : selected.clos[0]?.cloCode || "CLO";
        const question = action === "APPROVE" ? `Xác nhận duyệt ${profileName}?` : `Xác nhận từ chối ${profileName}?`;
        if (!window.confirm(question)) return;
        try {
            setSubmitting(true);
            await cloPloApprovalApi.review(selected.submissionId, action, reason.trim());
            toast.success(action === "APPROVE" ? `Đã duyệt ${profileName}.` : `Đã từ chối ${profileName}.`);
            setSelected(null); setReason(""); await load();
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setSubmitting(false); }
    };

    return <div className="mx-auto w-full max-w-[1440px] space-y-6 p-1">
        <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Quản lý CLO</p><h1 className="mt-2 text-3xl font-black text-slate-900">Duyệt CLO - PLO</h1><p className="mt-2 text-sm text-slate-500">Đánh giá đồng thời danh sách CLO và toàn bộ quan hệ ánh xạ PLO của học phần.</p></header>
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between"><div className="flex rounded-xl bg-slate-100 p-1">{tabs.map((tab) => <button key={tab.value} onClick={() => setStatus(tab.value)} className={`rounded-lg px-4 py-2 text-sm font-bold ${status === tab.value ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>{tab.label}</button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm học phần, giảng viên..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-teal-500 md:w-80" /></div></div>
            {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-teal-600" /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Mã học phần</th><th className="px-5 py-4">Tên học phần</th><th className="px-5 py-4">Loại hồ sơ</th><th className="px-5 py-4">Giảng viên chính</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Thời gian gửi</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((item) => <tr key={item.submissionId} className="hover:bg-slate-50"><td className="px-5 py-4 font-black text-teal-700">{item.courseCode}</td><td className="px-5 py-4 font-semibold text-slate-900">{item.courseName}</td><td className="px-5 py-4"><SubmissionType type={item.submissionType} /></td><td className="px-5 py-4 text-slate-600">{item.mainLecturerName || "—"}</td><td className="px-5 py-4"><Status status={item.status} /></td><td className="px-5 py-4 text-slate-500">{formatDate(item.submittedAt)}</td><td className="px-5 py-4 text-right"><Button variant="ghost" onClick={() => { setSelected(item); setReason(""); }} className="text-teal-700"><Eye className="h-4 w-4" />Xem hồ sơ</Button></td></tr>) : <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-500">Không có hồ sơ trong trạng thái này.</td></tr>}</tbody></table></div>}
        </section>
        {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5"><div><div className="flex items-center gap-2"><p className="text-xs font-bold uppercase text-teal-700">{selected.courseCode}</p><SubmissionType type={selected.submissionType} /></div><h2 className="mt-1 text-2xl font-black text-slate-900">{selected.courseName}</h2><p className="mt-1 text-sm text-slate-500">Giảng viên chính: {selected.mainLecturerName || "—"} · Gửi {formatDate(selected.submittedAt)}</p></div><button onClick={() => setSelected(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="space-y-6 p-5">
            <div className="grid gap-4 md:grid-cols-2">{selected.clos.map((clo) => <article key={clo.cloId} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><b className="text-teal-700">{clo.cloCode}</b>{clo.bloomLevel ? <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">Bloom: {clo.bloomLevel}</span> : null}</div><h3 className="mt-2 font-bold text-slate-900">{clo.cloName}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{clo.description}</p></article>)}</div>
            <section className="overflow-hidden rounded-2xl border border-slate-200"><div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 p-4 font-bold text-slate-900"><Link2 className="h-5 w-5 text-teal-600" />Mapping CLO → PLO <span className="text-xs font-normal text-slate-500">{selected.submissionType === "CLO" ? "(tham khảo, không bắt buộc khi duyệt CLO)" : "(nội dung cần duyệt)"}</span></div><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500"><th className="px-5 py-3">CLO</th><th className="px-5 py-3">PLO được ánh xạ</th></tr></thead><tbody className="divide-y divide-slate-100">{selected.clos.map((clo) => <tr key={clo.cloId}><td className="px-5 py-4 font-bold text-teal-700">{clo.cloCode}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2">{clo.mappedPloIds.length ? clo.mappedPloIds.map((id) => { const plo = selected.plos.find((item) => item.ploId === id); return <span key={id} title={plo?.description} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{plo?.ploCode || id}</span>; }) : <span className="text-xs italic text-slate-400">Chưa mapping</span>}</div></td></tr>)}</tbody></table></section>
            {selected.status === "PENDING_REVIEW" ? <label className="block text-sm font-bold text-slate-700">Lý do từ chối<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="Bắt buộc khi từ chối hồ sơ..." className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-teal-500" /></label> : selected.rejectionReason ? <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><b>Lý do từ chối:</b> {selected.rejectionReason}</div> : null}
        </div><div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white p-5"><Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>{selected.status === "PENDING_REVIEW" ? <><Button disabled={submitting} onClick={() => review("REJECT")} className="bg-rose-600 text-white hover:bg-rose-700"><XCircle className="h-4 w-4" />Từ chối</Button><Button disabled={submitting} onClick={() => review("APPROVE")} className="bg-emerald-600 text-white hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" />Duyệt</Button></> : null}</div></div></div> : null}
    </div>;
}

function SubmissionType({ type, cloCode }: { type?: "CLO" | "CLO_PLO_MAPPING" | null; cloCode?: string }) {
    return type === "CLO_PLO_MAPPING"
        ? <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">Mapping CLO - PLO</span>
        : <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">CLO{cloCode ? ` · ${cloCode}` : ""}</span>;
}

function Status({ status }: { status: CloPloStatus }) {
    if (status === "APPROVED") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Đã duyệt</span>;
    if (status === "REJECTED") return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><XCircle className="h-3.5 w-3.5" />Từ chối</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Clock3 className="h-3.5 w-3.5" />Chờ duyệt</span>;
}
