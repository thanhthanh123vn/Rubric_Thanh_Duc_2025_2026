import {
    CheckCircle2, Edit3, Link2, Loader2, Plus, Search, Target, Trash2, Unlink, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import programPloApi, { type ProgramPlo, type ProgramPloPayload } from "@/api/programPloApi.ts";

type FormState = ProgramPloPayload & { ploId?: string };

export default function PloManagement() {
    const [plos, setPlos] = useState<ProgramPlo[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState("");
    const [form, setForm] = useState<FormState | null>(null);
    const [formError, setFormError] = useState("");
    const [deleting, setDeleting] = useState<ProgramPlo | null>(null);
    const [blocked, setBlocked] = useState<ProgramPlo | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setPlos(await programPloApi.getAll());
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể tải danh sách PLO");
        } finally { setLoading(false); }
    };

    useEffect(() => { void loadData(); }, []);

    const summary = useMemo(() => ({
        total: plos.length,
        mapped: plos.filter((item) => item.linkedCloCount > 0).length,
        unmapped: plos.filter((item) => item.linkedCloCount === 0).length,
    }), [plos]);
    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return !keyword ? plos : plos.filter((item) =>
            item.ploCode.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword));
    }, [plos, query]);

    const openCreate = () => { setForm({ ploCode: "", description: "" }); setFormError(""); };
    const openEdit = (plo: ProgramPlo) => { setForm({ ploId: plo.ploId, ploCode: plo.ploCode, description: plo.description }); setFormError(""); };

    const save = async () => {
        if (!form) return;
        const code = form.ploCode.trim().replace(/\s+/g, "").toUpperCase();
        const description = form.description.trim();
        if (!code) return setFormError("Mã PLO là bắt buộc.");
        if (!description) return setFormError("Mô tả PLO là bắt buộc.");
        if (plos.some((item) => item.ploCode.toUpperCase() === code && item.ploId !== form.ploId)) {
            return setFormError(`Mã PLO ${code} đã tồn tại.`);
        }
        try {
            setSubmitting(true);
            if (form.ploId) await programPloApi.update(form.ploId, { ploCode: code, description });
            else await programPloApi.create({ ploCode: code, description });
            toast.success(form.ploId ? "Đã cập nhật PLO" : "Đã thêm PLO");
            setForm(null);
            await loadData();
        } catch (error: any) {
            setFormError(error?.response?.data?.message || "Không thể lưu PLO");
        } finally { setSubmitting(false); }
    };

    const requestDelete = (plo: ProgramPlo) => {
        if (plo.linkedCloCount > 0) setBlocked(plo);
        else setDeleting(plo);
    };
    const confirmDelete = async () => {
        if (!deleting) return;
        try {
            setSubmitting(true);
            await programPloApi.delete(deleting.ploId);
            toast.success(`Đã xóa ${deleting.ploCode}`);
            setDeleting(null);
            await loadData();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Không thể xóa PLO";
            setDeleting(null);
            toast.error(message);
        } finally { setSubmitting(false); }
    };

    return <div className="space-y-5 p-4 md:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Chương trình đào tạo CNTT</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Quản lý PLO</h1><p className="mt-1 text-sm text-slate-500">Quản lý chuẩn đầu ra chương trình và tình trạng ánh xạ CLO.</p></div><Button onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-700"><Plus className="h-4 w-4" />Thêm PLO</Button></header>

        <section className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Tổng số PLO" value={summary.total} icon={Target} tone="bg-indigo-50 text-indigo-700" />
            <SummaryCard label="PLO đã ánh xạ" value={summary.mapped} icon={Link2} tone="bg-emerald-50 text-emerald-700" />
            <SummaryCard label="PLO chưa ánh xạ" value={summary.unmapped} icon={Unlink} tone="bg-amber-50 text-amber-700" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Danh sách PLO</h2><p className="text-xs text-slate-500">{filtered.length} chuẩn đầu ra chương trình</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã hoặc mô tả PLO..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-indigo-500" /></div></div>
            {loading ? <div className="grid min-h-56 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="w-28 px-5 py-4">Mã PLO</th><th className="px-5 py-4">Mô tả PLO</th><th className="w-36 px-5 py-4 text-center">Số CLO liên kết</th><th className="w-36 px-5 py-4">Trạng thái</th><th className="w-32 px-5 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((plo) => <tr key={plo.ploId} className="align-top hover:bg-slate-50"><td className="px-5 py-4 font-black text-indigo-700">{plo.ploCode}</td><td className="px-5 py-4 leading-6 text-slate-700">{plo.description}</td><td className="px-5 py-4 text-center font-bold text-slate-700">{plo.linkedCloCount}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${plo.linkedCloCount ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{plo.linkedCloCount ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}{plo.linkedCloCount ? "Đã ánh xạ" : "Chưa ánh xạ"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="Sửa PLO" onClick={() => openEdit(plo)} className="text-indigo-600"><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Xóa PLO" onClick={() => requestDelete(plo)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button></div></td></tr>) : <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-500">Không tìm thấy PLO phù hợp.</td></tr>}</tbody></table></div>}
        </section>

        {form && <FormDialog form={form} error={formError} submitting={submitting} onChange={setForm} onClose={() => !submitting && setForm(null)} onSave={() => void save()} />}
        {deleting && <ConfirmDialog plo={deleting} submitting={submitting} onClose={() => !submitting && setDeleting(null)} onConfirm={() => void confirmDelete()} />}
        {blocked && <BlockedDialog plo={blocked} onClose={() => setBlocked(null)} />}
    </div>;
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Target; tone: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-black text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>; }

function FormDialog({ form, error, submitting, onChange, onClose, onSave }: { form: FormState; error: string; submitting: boolean; onChange: (value: FormState) => void; onClose: () => void; onSave: () => void }) { const editing = Boolean(form.ploId); return <DialogShell onClose={onClose}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase text-indigo-600">Quản lý PLO</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editing ? "Chỉnh sửa PLO" : "Thêm PLO"}</h2></div><button disabled={submitting} onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Mã PLO<input autoFocus value={form.ploCode} onChange={(e) => onChange({ ...form, ploCode: e.target.value })} placeholder="PLO1" maxLength={20} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal uppercase outline-none focus:border-indigo-500" /></label><label className="block text-sm font-semibold text-slate-700">Mô tả PLO<textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={6} placeholder="Nhập mô tả chuẩn đầu ra chương trình..." className="mt-1 w-full rounded-xl border border-slate-200 p-3 font-normal leading-6 outline-none focus:border-indigo-500" /></label>{error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" disabled={submitting} onClick={onClose}>Hủy</Button><Button disabled={submitting} onClick={onSave} className="bg-indigo-600 text-white hover:bg-indigo-700">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{editing ? "Cập nhật" : "Lưu"}</Button></div></DialogShell>; }

function ConfirmDialog({ plo, submitting, onClose, onConfirm }: { plo: ProgramPlo; submitting: boolean; onClose: () => void; onConfirm: () => void }) { return <DialogShell onClose={onClose}><h2 className="text-xl font-bold text-slate-900">Xóa PLO?</h2><p className="mt-3 text-sm leading-6 text-slate-600">Bạn có chắc chắn muốn xóa <b>{plo.ploCode}</b> không?</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" disabled={submitting} onClick={onClose}>Hủy</Button><Button disabled={submitting} onClick={onConfirm} className="bg-rose-600 text-white hover:bg-rose-700">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Xóa</Button></div></DialogShell>; }

function BlockedDialog({ plo, onClose }: { plo: ProgramPlo; onClose: () => void }) { return <DialogShell onClose={onClose}><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Link2 className="h-6 w-6" /></div><h2 className="mt-4 text-xl font-bold text-slate-900">Không thể xóa {plo.ploCode}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Không thể xóa {plo.ploCode} vì PLO đang được <b>{plo.linkedCloCount} CLO</b> liên kết.</p><div className="mt-6 flex justify-end"><Button onClick={onClose}>Đóng</Button></div></DialogShell>; }

function DialogShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">{children}</div></div>; }
