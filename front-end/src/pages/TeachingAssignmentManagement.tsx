import {
    BarChart3, CheckCircle2, ClipboardCheck, Clock3, Edit3, Loader2,
    Search, Send, Trash2, UserRoundCheck, UsersRound, X, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Button } from "@/components/ui/button";
import lecturerService from "@/pages/admin/api/lecturerService.ts";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";
import type { LecturerOption } from "@/features/course/student/api/type.ts";
import { getLecturerByUser } from "@/api/userApi.ts";
import teachingAssignmentApi, { type TeachingAssignmentProposal } from "@/api/teachingAssignmentApi.ts";

type View = "OVERVIEW" | "PROPOSALS" | "APPROVALS";

const statusMeta = {
    PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700", icon: Clock3 },
    APPROVED: { label: "Đã duyệt", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700", icon: XCircle },
    CANCELLED: { label: "Đã hủy", className: "bg-slate-100 text-slate-600", icon: X },
} as const;

const formatDate = (value?: string) => value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
    : "—";

export default function TeachingAssignmentManagement() {
    const location = useLocation();
    const navigate = useNavigate();
    const reduxUser = useAppSelector((state) => state.auth.user);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const isDean = user?.role === "DEAN";
    const resolveView = (): View => {
        if (location.pathname.endsWith("/view") || location.pathname.endsWith("/offerings")) return "OVERVIEW";
        if (location.pathname.endsWith("/records")) return "PROPOSALS";
        return isDean ? "APPROVALS" : "OVERVIEW";
    };
    const [view, setView] = useState<View>(resolveView);
    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
    const [proposals, setProposals] = useState<TeachingAssignmentProposal[]>([]);
    const [department, setDepartment] = useState("");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assignOffering, setAssignOffering] = useState<CourseOfferingResponse | null>(null);
    const [editingProposal, setEditingProposal] = useState<TeachingAssignmentProposal | null>(null);
    const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);
    const [requestNote, setRequestNote] = useState("");
    const [reviewing, setReviewing] = useState<TeachingAssignmentProposal | null>(null);
    const [reviewNote, setReviewNote] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const [offeringData, lecturerData, proposalData] = await Promise.all([
                courseOfferingService.getOfferings(),
                lecturerService.getAllLecturers(0, 200, ""),
                teachingAssignmentApi.getAll(),
            ]);
            setOfferings(Array.isArray(offeringData) ? offeringData : []);
            setLecturers(lecturerData.content || lecturerData || []);
            setProposals(proposalData);
            if (!isDean && user?.userId) {
                const profile = await getLecturerByUser(user.userId);
                setDepartment(profile.department?.departmentName || profile.department || "");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể tải dữ liệu phân công");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void loadData(); }, []);
    useEffect(() => { setView(resolveView()); }, [location.pathname, isDean]);
    useEffect(() => {
        if (selectedLecturerIds.length > 1) {
            setSelectedLecturerIds([selectedLecturerIds[selectedLecturerIds.length - 1]]);
        }
    }, [selectedLecturerIds]);

    const scopedOfferings = useMemo(() => offerings.filter((offering) => {
        if (!isDean && department && offering.course.department !== department) return false;
        const keyword = query.trim().toLowerCase();
        return !keyword || [offering.offeringId, offering.offeringName, offering.course.courseCode, offering.course.courseName]
            .some((value) => value?.toLowerCase().includes(keyword));
    }), [offerings, department, isDean, query]);

    const filteredProposals = useMemo(() => proposals.filter((proposal) => {
        if (view === "APPROVALS" && proposal.status !== "PENDING") return false;
        const keyword = query.trim().toLowerCase();
        return !keyword || [proposal.offeringName, proposal.courseCode, proposal.courseName, proposal.requestedByName]
            .some((value) => value?.toLowerCase().includes(keyword));
    }), [proposals, query, view]);

    const workload = useMemo(() => {
        const counts = new Map<string, { name: string; count: number }>();
        scopedOfferings.forEach((offering) => offering.lecturers?.forEach((lecturer) => {
            const current = counts.get(lecturer.lecturerId) || { name: lecturer.lecturerName, count: 0 };
            counts.set(lecturer.lecturerId, { ...current, count: current.count + 1 });
        }));
        return [...counts.entries()].map(([id, value]) => ({ id, ...value })).sort((a, b) => b.count - a.count);
    }, [scopedOfferings]);

    const openAssignment = (offering: CourseOfferingResponse, proposal?: TeachingAssignmentProposal) => {
        setAssignOffering(offering);
        setEditingProposal(proposal || null);
        setSelectedLecturerIds(proposal?.lecturers.slice(0, 1).map((item) => item.lecturerId)
            || (offering.mainLecturer ? [offering.mainLecturer.lecturerId] : offering.lecturers?.slice(0, 1).map((item) => item.lecturerId))
            || []);
        setRequestNote(proposal?.requestNote || "");
    };

    const closeAssignment = () => {
        if (submitting) return;
        setAssignOffering(null);
        setEditingProposal(null);
        setSelectedLecturerIds([]);
        setRequestNote("");
    };

    const saveProposal = async () => {
        if (!assignOffering || selectedLecturerIds.length === 0) return toast.error("Vui lòng chọn giảng viên");
        try {
            setSubmitting(true);
            const payload = { offeringId: assignOffering.offeringId, lecturerIds: selectedLecturerIds.slice(0, 1), note: requestNote };
            if (editingProposal) await teachingAssignmentApi.update(editingProposal.proposalId, payload);
            else await teachingAssignmentApi.create(payload);
            toast.success(editingProposal ? "Đã cập nhật đề xuất" : "Đã gửi đề xuất phân công để phê duyệt");
            setAssignOffering(null);
            setEditingProposal(null);
            await loadData();
            navigate("/department/assignments/records");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể lưu đề xuất");
        } finally { setSubmitting(false); }
    };

    const cancelProposal = async (proposalId: string) => {
        if (!window.confirm("Hủy đề xuất phân công này?")) return;
        try {
            await teachingAssignmentApi.cancel(proposalId);
            toast.success("Đã hủy đề xuất");
            await loadData();
        } catch (error: any) { toast.error(error?.response?.data?.message || "Không thể hủy đề xuất"); }
    };

    const review = async (action: "APPROVE" | "REJECT") => {
        if (!reviewing) return;
        if (action === "REJECT" && !reviewNote.trim()) return toast.error("Vui lòng nhập lý do từ chối");
        try {
            setSubmitting(true);
            await teachingAssignmentApi.review(reviewing.proposalId, action, reviewNote);
            toast.success(action === "APPROVE" ? "Đã phê duyệt và áp dụng phân công" : "Đã từ chối đề xuất");
            setReviewing(null);
            setReviewNote("");
            await loadData();
        } catch (error: any) { toast.error(error?.response?.data?.message || "Không thể xử lý đề xuất"); }
        finally { setSubmitting(false); }
    };

    const eligibleLecturers = lecturers.filter((lecturer) =>
        lecturer.role === "MAIN_LECTURER" && (isDean || !department || lecturer.department === department));
    const assignedCount = scopedOfferings.filter((offering) => offering.lecturers?.length).length;

    return (
        <div className="space-y-5">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Quản lý phân công</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Phân công giảng dạy</h1><p className="mt-1 text-sm text-slate-500">{isDean ? "Xem và phê duyệt hồ sơ phân công." : "Tạo phân công và theo dõi kết quả phê duyệt."}</p></div>
                <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm học phần, lớp, người đề xuất..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-teal-500" /></div>
            </header>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
                { label: "Lớp học phần", value: scopedOfferings.length, icon: ClipboardCheck, tone: "text-blue-700 bg-blue-50" },
                { label: "Đã phân công", value: assignedCount, icon: UserRoundCheck, tone: "text-emerald-700 bg-emerald-50" },
                { label: "Chờ duyệt", value: proposals.filter((item) => item.status === "PENDING").length, icon: Clock3, tone: "text-amber-700 bg-amber-50" },
                { label: "Giảng viên", value: workload.length, icon: UsersRound, tone: "text-violet-700 bg-violet-50" },
            ].map((stat) => <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></div><div><p className="text-xl font-black text-slate-900">{stat.value}</p><p className="text-xs text-slate-500">{stat.label}</p></div></div>)}</section>

            {loading ? <div className="py-20 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-teal-600" /></div> : view === "OVERVIEW" ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Học phần</th><th className="px-5 py-4">Học kỳ</th><th className="px-5 py-4">Giảng viên</th>{!isDean && <th className="px-5 py-4 text-right">Thao tác</th>}</tr></thead><tbody className="divide-y divide-slate-100">{scopedOfferings.map((offering) => <tr key={offering.offeringId} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-slate-900">{offering.offeringName}</p><p className="text-xs text-slate-500">{offering.course.courseCode} · {offering.course.courseName}</p></td><td className="px-5 py-4 text-slate-600">{offering.semester}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-1">{offering.lecturers?.length ? offering.lecturers.map((lecturer) => <span key={lecturer.lecturerId} className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{lecturer.lecturerName}</span>) : <span className="text-xs text-amber-600">Chưa phân công</span>}</div></td>{!isDean && <td className="px-5 py-4 text-right"><Button size="sm" onClick={() => openAssignment(offering)} className="bg-teal-600 text-white hover:bg-teal-700">Phân công</Button></td>}</tr>)}</tbody></table></div></div>
                    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-slate-900"><BarChart3 className="h-5 w-5 text-teal-600" />Tải giảng dạy</h2><div className="mt-4 space-y-3">{workload.length ? workload.slice(0, 12).map((item) => <div key={item.id} className="flex items-center justify-between gap-3"><p className="truncate text-sm text-slate-700">{item.name}</p><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.count >= 4 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>{item.count} lớp</span></div>) : <p className="text-sm text-slate-400">Chưa có dữ liệu.</p>}</div></aside>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{filteredProposals.length ? filteredProposals.map((proposal) => { const meta = statusMeta[proposal.status]; const StatusIcon = meta.icon; const offering = offerings.find((item) => item.offeringId === proposal.offeringId); return <article key={proposal.proposalId} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{proposal.offeringName}</h3><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</span></div><p className="mt-1 text-xs text-slate-500">{proposal.courseCode} · {proposal.courseName} · {formatDate(proposal.createdAt)}</p><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-slate-400">Phân công:</span>{proposal.lecturers.map((lecturer) => <span key={lecturer.lecturerId} className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">{lecturer.lecturerName}</span>)}</div>{proposal.requestNote && <p className="mt-2 text-xs italic text-slate-500">“{proposal.requestNote}”</p>}{proposal.reviewNote && <p className="mt-2 text-xs text-rose-600">Phản hồi: {proposal.reviewNote}</p>}</div><div className="flex flex-wrap justify-end gap-2">{!isDean && proposal.status === "PENDING" && offering && <><Button variant="outline" size="sm" onClick={() => openAssignment(offering, proposal)}><Edit3 className="h-4 w-4" />Sửa</Button><Button variant="outline" size="sm" onClick={() => void cancelProposal(proposal.proposalId)} className="text-rose-600"><Trash2 className="h-4 w-4" />Hủy</Button></>}{isDean && proposal.status === "PENDING" && <Button size="sm" onClick={() => setReviewing(proposal)} className="bg-teal-600 text-white hover:bg-teal-700">Xem xét</Button>}</div></article>; }) : <div className="py-16 text-center text-sm text-slate-500">Không có hồ sơ phân công phù hợp.</div>}</div></div>
            )}

            {assignOffering && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">{editingProposal ? "Chỉnh sửa đề xuất" : "Đề xuất phân công"}</h2><p className="mt-1 text-sm text-slate-500">{assignOffering.offeringName}</p></div><button onClick={closeAssignment} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 max-h-72 space-y-2 overflow-y-auto">{eligibleLecturers.map((lecturer) => { const selected = selectedLecturerIds.includes(lecturer.lecturerId); return <button key={lecturer.lecturerId} onClick={() => setSelectedLecturerIds((current) => selected ? current.filter((id) => id !== lecturer.lecturerId) : [...current, lecturer.lecturerId])} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selected ? "border-teal-400 bg-teal-50" : "border-slate-200"}`}><span className={`grid h-5 w-5 place-items-center rounded border text-xs ${selected ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300"}`}>{selected ? "✓" : ""}</span><div><p className="text-sm font-semibold text-slate-800">{lecturer.fullName}</p><p className="text-xs text-slate-500">{lecturer.department}</p></div></button>; })}</div><textarea value={requestNote} onChange={(event) => setRequestNote(event.target.value)} rows={3} placeholder="Ghi chú đề xuất..." className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-teal-500" /><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={closeAssignment}>Hủy</Button><Button disabled={submitting} onClick={() => void saveProposal()} className="bg-teal-600 text-white hover:bg-teal-700">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Gửi duyệt</Button></div></div></div>}

            {reviewing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-900">Duyệt phân công</h2><p className="mt-1 text-sm text-slate-500">{reviewing.offeringName} · {reviewing.courseCode}</p></div><button onClick={() => setReviewing(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Giảng viên đề xuất</p><div className="mt-2 flex flex-wrap gap-2">{reviewing.lecturers.map((lecturer) => <span key={lecturer.lecturerId} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-teal-700 shadow-sm">{lecturer.lecturerName}</span>)}</div><p className="mt-3 text-xs text-slate-500">Người đề xuất: {reviewing.requestedByName}</p></div><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={3} placeholder="Nhận xét; bắt buộc khi từ chối..." className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-500" /><div className="mt-5 flex justify-end gap-2"><Button disabled={submitting} onClick={() => void review("REJECT")} className="bg-rose-100 text-rose-700 hover:bg-rose-200">Từ chối</Button><Button disabled={submitting} onClick={() => void review("APPROVE")} className="bg-emerald-600 text-white hover:bg-emerald-700">Phê duyệt</Button></div></div></div>}
        </div>
    );
}
