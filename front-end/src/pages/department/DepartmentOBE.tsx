import {
    AlertTriangle, ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronRight,
    FileSpreadsheet, FileText, Loader2, Target, X, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";
import obeAnalyticsApi, { type CloAnalytics, type CloDetail, type OfferingObeAnalytics } from "@/api/obeAnalyticsApi.ts";
import { Button } from "@/components/ui/button";

const TARGET = 70;
type Summary = { courses: number; totalClos: number; achieved: number; notAchieved: number; rate: number };
type OfferingResult = CourseOfferingResponse & { obe: OfferingObeAnalytics; achievedClos: number; achievementRate: number };
const normalizeYear = (value?: string) => (value || "Chưa xác định").replace("/", "-");
const semesterLabel = (value?: string) => !value ? "Chưa xác định" : /^HK/i.test(value) ? value.toUpperCase() : `HK${value}`;
const percent = (value: number) => `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;

export default function DepartmentOBE() {
    const location = useLocation();
    const reportRef = useRef<HTMLDivElement>(null);
    const reduxUser = useAppSelector((state) => state.auth.user);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const isDean = user?.role === "DEAN";
    const isReport = !isDean && location.pathname.endsWith("/report");
    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState("");
    const [results, setResults] = useState<OfferingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [selectedOffering, setSelectedOffering] = useState<OfferingResult | null>(null);
    const [selectedClo, setSelectedClo] = useState<CloAnalytics | null>(null);
    const [cloDetail, setCloDetail] = useState<CloDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const offeringData = await courseOfferingService.getLeadershipOfferings();
                const list = Array.isArray(offeringData) ? offeringData : [];
                setOfferings(list);
                const years = [...new Set(list.map((item) => normalizeYear(item.year)))].sort().reverse();
                const semesters = [...new Set(list.map((item) => item.semester).filter(Boolean))];
                setYear((current) => current || years[0] || "");
                setSemester((current) => current || semesters[0] || "");
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Không thể tải dữ liệu OBE");
            } finally { setLoading(false); }
        };
        void load();
    }, [isDean, user?.userId]);

    const yearOptions = useMemo(() => [...new Set(offerings.map((item) => normalizeYear(item.year)))].sort().reverse(), [offerings]);
    const semesterOptions = useMemo(() => [...new Set(offerings.map((item) => item.semester).filter(Boolean))], [offerings]);
    const periodOfferings = useMemo(() => offerings.filter((item) => {
        return (!year || normalizeYear(item.year) === year) && (!semester || item.semester === semester);
    }), [offerings, year, semester]);

    useEffect(() => {
        const load = async () => {
            setAnalyticsLoading(true);
            const settled = await Promise.allSettled(periodOfferings.map(async (offering) => {
                const obe = await obeAnalyticsApi.getOffering(offering.offeringId);
                const clos = Array.isArray(obe.clos) ? obe.clos : [];
                const achievedClos = clos.filter((clo) => clo.progressPercent >= TARGET).length;
                const achievementRate = Number.isFinite(obe.overallProgress)
                    ? obe.overallProgress
                    : (clos.length ? clos.reduce((sum, clo) => sum + clo.progressPercent, 0) / clos.length : 0);
                return { ...offering, obe: { ...obe, clos }, achievedClos, achievementRate } as OfferingResult;
            }));
            setResults(settled.flatMap((item) => item.status === "fulfilled" ? [item.value] : []));
            if (settled.some((item) => item.status === "rejected")) toast.warning("Một số học phần chưa có dữ liệu OBE hoàn chỉnh");
            setAnalyticsLoading(false);
        };
        if (!loading) void load();
    }, [periodOfferings, loading]);

    const summary = useMemo<Summary>(() => {
        const totalClos = results.reduce((sum, item) => sum + item.obe.clos.length, 0);
        const achieved = results.reduce((sum, item) => sum + item.achievedClos, 0);
        const totalProgress = results.reduce(
            (sum, item) => sum + item.obe.clos.reduce((cloSum, clo) => cloSum + clo.progressPercent, 0),
            0,
        );
        return { courses: results.length, totalClos, achieved, notAchieved: Math.max(totalClos - achieved, 0), rate: totalClos ? totalProgress / totalClos : 0 };
    }, [results]);
    const attention = useMemo(() => results.filter((item) => item.obe.clos.length && item.achievementRate < TARGET).sort((a, b) => a.achievementRate - b.achievementRate), [results]);

    const openClo = async (clo: CloAnalytics) => {
        if (!selectedOffering) return;
        setSelectedClo(clo); setCloDetail(null); setDetailLoading(true);
        try { setCloDetail(await obeAnalyticsApi.getCloDetail(selectedOffering.offeringId, clo.cloId)); }
        catch (error: any) { toast.error(error?.response?.data?.message || "Không thể tải chi tiết CLO"); }
        finally { setDetailLoading(false); }
    };

    const exportExcel = () => {
        const rows = results.map((item) => ({
            "Mã học phần": item.course.courseCode, "Tên học phần": item.course.courseName,
            "Lớp học phần": item.offeringName,
            "Giảng viên": item.lecturers?.map((lecturer) => lecturer.lecturerName).join(", ") || "Chưa phân công",
            "Tổng CLO": item.obe.clos.length, "CLO đạt": item.achievedClos,
            "CLO chưa đạt": item.obe.clos.length - item.achievedClos, "Tỷ lệ đạt (%)": Number(item.achievementRate.toFixed(1)),
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Bao cao OBE");
        XLSX.writeFile(workbook, `Bao-cao-OBE-${year}-${semesterLabel(semester)}.xlsx`);
    };
    const exportPdf = async () => {
        if (!reportRef.current) return;
        const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff" });
        const pdf = new jsPDF("p", "mm", "a4");
        const width = 190, height = canvas.height * width / canvas.width, image = canvas.toDataURL("image/png");
        let remaining = height, position = 10;
        pdf.addImage(image, "PNG", 10, position, width, height); remaining -= 277;
        while (remaining > 0) { position = remaining - height + 10; pdf.addPage(); pdf.addImage(image, "PNG", 10, position, width, height); remaining -= 277; }
        pdf.save(`Bao-cao-OBE-${year}-${semesterLabel(semester)}.pdf`);
    };

    if (loading) return <LoadingState label="Đang tải dữ liệu học phần..." />;
    return <div className="space-y-5 p-4 md:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Phân tích OBE</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{isDean ? "Tình hình OBE toàn khoa" : isReport ? "Báo cáo OBE" : "Tổng quan OBE"}</h1><p className="mt-1 text-sm text-slate-500">Dữ liệu tổng hợp từ các Course Offering trong kỳ được chọn.</p></div>{isReport && <div className="flex gap-2"><Button variant="outline" onClick={() => void exportPdf()}><FileText className="h-4 w-4" />Xuất PDF</Button><Button onClick={exportExcel} className="bg-emerald-600 text-white hover:bg-emerald-700"><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button></div>}</header>
        <FilterBar years={yearOptions} semesters={semesterOptions} year={year} semester={semester} onYear={setYear} onSemester={setSemester} />
        {analyticsLoading ? <LoadingState label="Đang tổng hợp kết quả CLO..." /> : isReport ? <ReportView reportRef={reportRef} summary={summary} results={results} attention={attention} year={year} semester={semester} /> : isDean ? <LeadershipDashboard summary={summary} attention={attention} onView={setSelectedOffering} /> : <Overview summary={summary} results={results} onView={setSelectedOffering} />}
        {selectedOffering && <OfferingDialog offering={selectedOffering} allowCloDetail={!isDean} onClose={() => setSelectedOffering(null)} onClo={openClo} />}
        {selectedClo && <CloDialog clo={selectedClo} detail={cloDetail} loading={detailLoading} onClose={() => { setSelectedClo(null); setCloDetail(null); }} />}
    </div>;
}

function FilterBar({ years, semesters, year, semester, onYear, onSemester }: { years: string[]; semesters: string[]; year: string; semester: string; onYear: (v: string) => void; onSemester: (v: string) => void }) {
    return <section className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="min-w-48 text-sm font-semibold text-slate-600">Năm học<select value={year} onChange={(e) => onYear(e.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal text-slate-800 outline-none focus:border-indigo-500">{years.map((item) => <option key={item}>{item}</option>)}</select></label><label className="min-w-40 text-sm font-semibold text-slate-600">Học kỳ<select value={semester} onChange={(e) => onSemester(e.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal text-slate-800 outline-none focus:border-indigo-500">{semesters.map((item) => <option key={item} value={item}>{semesterLabel(item)}</option>)}</select></label></section>;
}

function Kpis({ summary, compact = false }: { summary: Summary; compact?: boolean }) {
    const cards = compact ? [["Học phần", summary.courses, BookOpen, "bg-blue-50 text-blue-700"], ["Tổng CLO", summary.totalClos, Target, "bg-violet-50 text-violet-700"], ["Tỷ lệ đạt", percent(summary.rate), BarChart3, "bg-emerald-50 text-emerald-700"]] : [["Học phần", summary.courses, BookOpen, "bg-blue-50 text-blue-700"], ["Tổng CLO", summary.totalClos, Target, "bg-violet-50 text-violet-700"], ["CLO đạt", summary.achieved, CheckCircle2, "bg-emerald-50 text-emerald-700"], ["CLO chưa đạt", summary.notAchieved, XCircle, "bg-rose-50 text-rose-700"]];
    return <section className={`grid gap-3 ${compact ? "md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>{cards.map(([label, value, Icon, tone]) => { const C = Icon as typeof BookOpen; return <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><C className="h-5 w-5" /></span><div><p className="text-2xl font-black text-slate-900">{value as string | number}</p><p className="text-xs text-slate-500">{label as string}</p></div></div>; })}</section>;
}

function Overview({ summary, results, onView }: { summary: Summary; results: OfferingResult[]; onView: (item: OfferingResult) => void }) { return <div className="space-y-5"><Kpis summary={summary} /><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center"><span className="text-sm font-semibold text-indigo-700">Mức đạt OBE trung bình: </span><span className="text-2xl font-black text-indigo-800">{percent(summary.rate)}</span></div><CourseTable results={results} onView={onView} /></div>; }

function LeadershipDashboard({ summary, attention, onView }: { summary: Summary; attention: OfferingResult[]; onView: (item: OfferingResult) => void }) {
    const lowest = attention[0];
    return <div className="space-y-5"><Kpis summary={summary} compact /><section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Tình hình chung</h2><div className="mt-4 space-y-3"><Metric label="CLO đạt" value={summary.achieved} tone="text-emerald-600" /><Metric label="CLO chưa đạt" value={summary.notAchieved} tone="text-rose-600" /><Metric label="Mức đạt OBE trung bình" value={percent(summary.rate)} tone="text-indigo-700" /></div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="flex items-center gap-2 font-bold text-amber-900"><AlertTriangle className="h-5 w-5" />Nhận xét / cảnh báo</h2><p className="mt-3 text-sm text-amber-900">Có <b>{attention.length}</b> học phần có mức đạt OBE dưới {TARGET}%.</p><p className="mt-1 text-sm text-amber-800">{lowest ? `${lowest.course.courseName} có kết quả thấp nhất (${percent(lowest.achievementRate)}).` : "Không có học phần cần cảnh báo trong kỳ này."}</p></div></section><AttentionTable items={attention} onView={onView} /></div>;
}

function ReportView({ reportRef, summary, results, attention, year, semester }: { reportRef: RefObject<HTMLDivElement | null>; summary: Summary; results: OfferingResult[]; attention: OfferingResult[]; year: string; semester: string }) {
    const weakClos = results.flatMap((item) => item.obe.clos.filter((clo) => clo.progressPercent < TARGET).map((clo) => ({ ...clo, course: item.course.courseName, offering: item.offeringName }))).sort((a, b) => a.progressPercent - b.progressPercent);
    return <div ref={reportRef} className="space-y-5 bg-slate-50 p-2"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold text-slate-900">Báo cáo kết quả OBE</h2><p className="text-sm text-slate-500">Năm học {year} · {semesterLabel(semester)}</p></div><Kpis summary={summary} /><div className="rounded-2xl border border-slate-200 bg-white p-5"><Metric label="Mức đạt OBE trung bình" value={percent(summary.rate)} tone="text-indigo-700" /></div><AttentionTable items={attention} /><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">Chi tiết CLO cần cải thiện</h3><div className="mt-4 divide-y divide-slate-100">{weakClos.length ? weakClos.map((clo) => <div key={`${clo.offering}-${clo.cloId}`} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-slate-800">{clo.cloCode} · {clo.course}</p><p className="text-xs text-slate-500">{clo.cloDescription}</p></div><span className="font-bold text-rose-600">{percent(clo.progressPercent)}</span></div>) : <p className="py-6 text-center text-sm text-slate-500">Không có CLO dưới mục tiêu.</p>}</div></div></div>;
}

function CourseTable({ results, onView }: { results: OfferingResult[]; onView: (item: OfferingResult) => void }) { return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Học phần</th><th className="px-5 py-4">Giảng viên</th><th className="px-5 py-4">CLO</th><th className="px-5 py-4">CLO đạt</th><th className="px-5 py-4">Tỷ lệ</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{results.length ? results.map((item) => <tr key={item.offeringId} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-slate-900">{item.course.courseName}</p><p className="text-xs text-slate-500">{item.offeringName}</p></td><td className="px-5 py-4 text-slate-600">{item.lecturers?.map((lecturer) => lecturer.lecturerName).join(", ") || "Chưa phân công"}</td><td className="px-5 py-4">{item.obe.clos.length}</td><td className="px-5 py-4">{item.achievedClos}</td><td className={`px-5 py-4 font-bold ${item.achievementRate < TARGET ? "text-rose-600" : "text-emerald-600"}`}>{percent(item.achievementRate)}{item.achievementRate < TARGET && " ⚠"}</td><td className="px-5 py-4 text-right"><Button size="sm" variant="outline" onClick={() => onView(item)}>Xem chi tiết<ChevronRight className="h-4 w-4" /></Button></td></tr>) : <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500">Chưa có dữ liệu OBE trong kỳ này.</td></tr>}</tbody></table></div></div>; }

function AttentionTable({ items, onView }: { items: OfferingResult[]; onView?: (item: OfferingResult) => void }) { return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Học phần cần chú ý</h2></div><div className="divide-y divide-slate-100">{items.length ? items.map((item) => <div key={item.offeringId} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-semibold text-slate-800">{item.course.courseName}</p><p className="text-xs text-slate-500">{item.offeringName}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.achievementRate < 60 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{percent(item.achievementRate)}</span>{onView && <Button size="sm" variant="ghost" onClick={() => onView(item)}>Xem<ArrowRight className="h-4 w-4" /></Button>}</div></div>) : <p className="px-5 py-10 text-center text-sm text-slate-500">Không có học phần dưới ngưỡng cảnh báo.</p>}</div></div>; }

function OfferingDialog({ offering, allowCloDetail, onClose, onClo }: { offering: OfferingResult; allowCloDetail: boolean; onClose: () => void; onClo: (clo: CloAnalytics) => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase text-indigo-600">Chi tiết học phần</p><h2 className="mt-1 text-xl font-bold text-slate-900">{offering.course.courseName}</h2><p className="text-sm text-slate-500">{semesterLabel(offering.semester)} · {normalizeYear(offering.year).replace("-", "/")}</p></div><button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-2">{offering.obe.clos.map((clo) => <button key={clo.cloId} disabled={!allowCloDetail} onClick={() => allowCloDetail && onClo(clo)} className={`flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left ${allowCloDetail ? "hover:border-indigo-300 hover:bg-indigo-50" : "cursor-default"}`}><div><p className="font-bold text-slate-900">{clo.cloCode}</p><p className="line-clamp-1 text-xs text-slate-500">{clo.cloDescription}</p></div><div className="flex items-center gap-3"><span className={`font-black ${clo.progressPercent >= TARGET ? "text-emerald-600" : clo.progressPercent >= 60 ? "text-amber-600" : "text-rose-600"}`}>{percent(clo.progressPercent)}</span>{clo.progressPercent >= TARGET ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}</div></button>)}</div></div></div>; }

function CloDialog({ clo, detail, loading, onClose }: { clo: CloAnalytics; detail: CloDetail | null; loading: boolean; onClose: () => void }) {
    const average = detail?.students.length ? detail.students.reduce((sum, item) => sum + item.score, 0) / detail.students.length : clo.progressPercent;
    return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase text-indigo-600">Chi tiết CLO</p><h2 className="mt-1 text-xl font-bold text-slate-900">{clo.cloCode}</h2><p className="mt-1 text-sm text-slate-500">{clo.cloDescription}</p></div><button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Mục tiêu</p><p className="text-2xl font-black text-slate-900">{TARGET}%</p></div><div className="rounded-2xl bg-indigo-50 p-4"><p className="text-xs text-indigo-600">Đạt được</p><p className="text-2xl font-black text-indigo-800">{percent(average)}</p></div></div>{loading ? <LoadingState label="Đang tải liên kết đánh giá..." /> : <div className="mt-5"><h3 className="font-bold text-slate-900">Rubric / đánh giá liên quan</h3><div className="mt-3 space-y-2">{detail?.assessments?.length ? detail.assessments.map((item) => <div key={item.assessmentId} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><div><p className="text-sm font-medium text-slate-700">{item.assessmentName}</p><p className="text-xs text-slate-400">Trọng số {item.weight}%</p></div><span className={`text-sm font-bold ${item.achievementPercent >= TARGET ? "text-emerald-600" : "text-rose-600"}`}>{percent(item.achievementPercent)}</span></div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có Rubric hoặc bài đánh giá liên kết với CLO này.</p>}</div></div>}</div></div>;
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: string }) { return <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"><span className="text-sm text-slate-600">{label}</span><span className={`text-lg font-black ${tone}`}>{value}</span></div>; }
function LoadingState({ label }: { label: string }) { return <div className="grid min-h-48 place-items-center rounded-2xl border border-slate-200 bg-white"><div className="text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-600" /><p className="mt-3 text-sm text-slate-500">{label}</p></div></div>; }
