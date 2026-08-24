import {
    AlertCircle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, Edit2, Eye,
    FileEdit, GraduationCap, Link2, Plus, Save, Search, Send, Target, Trash2, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { bloomLevels } from "./mainLecturerData";
import {
    createClo,
    deleteClo,
    getAllClo,
    getClosByCourse,
    getCourseOptions,
    updateClo,
    type CloPayload,
    type CloResponse,
    type CourseOption,
} from "@/features/rubric/rubricApi.ts";
import cloPloApprovalApi, { type CloPloSubmission } from "@/api/cloPloApprovalApi.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";

type FormState = {
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
};

const emptyForm: FormState = { cloCode: "", cloName: "", description: "", bloomLevel: "" };
const statusLabel = { DRAFT: "Bản nháp", PENDING_REVIEW: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối" };

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } | string } }).response;
        if (typeof response?.data === "string") return response.data;
        if (response?.data?.message) return response.data.message;
    }
    return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
}

export default function CLOManagement() {
    const reduxUser = useAppSelector((state) => state.auth.user);
    const currentUser = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const isMainLecturer = currentUser?.role === "MAIN_LECTURER";
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCourseId = searchParams.get("courseId") || "";
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [allClos, setAllClos] = useState<CloResponse[]>([]);
    const [courseClos, setCourseClos] = useState<CloResponse[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingClos, setLoadingClos] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingClo, setEditingClo] = useState<CloResponse | null>(null);
    const [formData, setFormData] = useState<FormState>(emptyForm);
    const [activeTab, setActiveTab] = useState<"CLO" | "MAPPING">("CLO");
    const [workflow, setWorkflow] = useState<CloPloSubmission | null>(null);
    const [mappings, setMappings] = useState<Record<string, string[]>>({});
    const [workflowLoading, setWorkflowLoading] = useState(false);

    const selectedCourse = courses.find((course) => course.courseId === selectedCourseId) ?? null;
    const cloCountByCourse = useMemo(() => {
        return allClos.reduce<Record<string, number>>((counts, clo) => {
            counts[clo.courseId] = (counts[clo.courseId] || 0) + 1;
            return counts;
        }, {});
    }, [allClos]);
    const overviewStats = useMemo(() => {
        const stats = { total: allClos.length, draft: 0, pending: 0, approved: 0, rejected: 0 };
        allClos.forEach((clo) => {
            const status = clo.approvalStatus || "DRAFT";
            if (status === "APPROVED") stats.approved += 1;
            else if (status === "PENDING_REVIEW") stats.pending += 1;
            else if (status === "REJECTED") stats.rejected += 1;
            else stats.draft += 1;
        });
        return stats;
    }, [allClos]);
    const courseStats = useMemo(() => {
        const stats = { total: courseClos.length, draft: 0, pending: 0, approved: 0, rejected: 0 };
        courseClos.forEach((clo) => {
            const status = clo.approvalStatus || "DRAFT";
            if (status === "APPROVED") stats.approved += 1;
            else if (status === "PENDING_REVIEW") stats.pending += 1;
            else if (status === "REJECTED") stats.rejected += 1;
            else stats.draft += 1;
        });
        return stats;
    }, [courseClos]);
    const filteredCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return courses;
        return courses.filter((course) =>
            `${course.courseCode || ""} ${course.courseName} ${course.department || ""}`.toLowerCase().includes(keyword),
        );
    }, [courses, search]);

    const loadOverview = async () => {
        try {
            setLoading(true);
            const [courseResponse, cloResponse] = await Promise.all([getCourseOptions(), getAllClo()]);
            setCourses(courseResponse);
            setAllClos(Array.isArray(cloResponse.data) ? cloResponse.data : []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const loadCourseClos = async (courseId: string) => {
        try {
            setLoadingClos(true);
            const response = await getClosByCourse(courseId);
            setCourseClos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setCourseClos([]);
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingClos(false);
        }
    };

    const loadWorkflow = async (courseId: string) => {
        try {
            setWorkflowLoading(true);
            const data = await cloPloApprovalApi.getCourseProfile(courseId);
            setWorkflow(data);
            setMappings(Object.fromEntries(data.clos.map((clo) => [clo.cloId, clo.mappedPloIds || []])));
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setWorkflowLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        Promise.all([getCourseOptions(), getAllClo()])
            .then(([courseResponse, cloResponse]) => {
                if (!active) return;
                setCourses(courseResponse);
                setAllClos(Array.isArray(cloResponse.data) ? cloResponse.data : []);
            })
            .catch((error) => {
                if (active) toast.error(getErrorMessage(error));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!selectedCourseId) return;
        let active = true;
        setLoadingClos(true);
        setWorkflowLoading(isMainLecturer);

        const requests = isMainLecturer
            ? Promise.all([getClosByCourse(selectedCourseId), cloPloApprovalApi.getCourseProfile(selectedCourseId)])
            : Promise.all([getClosByCourse(selectedCourseId), Promise.resolve(null)]);
        requests.then(([response, profile]) => {
                if (active) {
                    setCourseClos(Array.isArray(response.data) ? response.data : []);
                    setWorkflow(profile);
                    setMappings(profile
                        ? Object.fromEntries(profile.clos.map((clo) => [clo.cloId, clo.mappedPloIds || []]))
                        : {});
                }
            })
            .catch((error) => {
                if (!active) return;
                setCourseClos([]);
                toast.error(getErrorMessage(error));
            })
            .finally(() => {
                if (active) {
                    setLoadingClos(false);
                    setWorkflowLoading(false);
                }
            });

        return () => { active = false; };
    }, [isMainLecturer, selectedCourseId]);

    const openCreateModal = () => {
        if (!selectedCourse) return;
        setEditingClo(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (clo: CloResponse) => {
        setEditingClo(clo);
        setFormData({
            cloCode: clo.cloCode || "",
            cloName: clo.cloName || "",
            description: clo.description || "",
            bloomLevel: clo.bloomLevel || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClo(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedCourseId) return;
        const payload: CloPayload = {
            courseId: selectedCourseId,
            cloCode: formData.cloCode.trim(),
            cloName: formData.cloName.trim(),
            description: formData.description.trim(),
            bloomLevel: formData.bloomLevel,
        };
        try {
            setSaving(true);
            if (editingClo) await updateClo(editingClo.cloId, payload);
            else await createClo(payload);
            await Promise.all([loadCourseClos(selectedCourseId), loadOverview(), loadWorkflow(selectedCourseId)]);
            toast.success(editingClo ? "Đã cập nhật CLO." : "Đã tạo CLO cho khóa học.");
            closeModal();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const mappingState = workflow?.mappingWorkflow;
    const mappingEditable = isMainLecturer && mappingState?.status !== "PENDING_REVIEW";

    const handleDelete = async (clo: CloResponse) => {
        if (!window.confirm(`Xóa ${clo.cloCode}?`)) return;
        try {
            await deleteClo(clo.cloId);
            await Promise.all([loadCourseClos(selectedCourseId), loadOverview(), loadWorkflow(selectedCourseId)]);
            toast.success(`Đã xóa ${clo.cloCode}.`);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const toggleMapping = (cloId: string, ploId: string) => {
        if (!mappingEditable) return;
        setMappings((current) => {
            const selected = current[cloId] || [];
            return { ...current, [cloId]: selected.includes(ploId)
                    ? selected.filter((id) => id !== ploId) : [...selected, ploId] };
        });
    };

    const saveMappings = async () => {
        try {
            setSaving(true);
            const data = await cloPloApprovalApi.saveMappings(selectedCourseId, mappings);
            setWorkflow(data);
            toast.success("Đã lưu nháp ánh xạ CLO - PLO.");
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSaving(false); }
    };

    const submitCloForReview = async (clo: CloResponse) => {
        if (!window.confirm(`Gửi riêng ${clo.cloCode} để Lãnh đạo khoa duyệt?`)) return;
        try {
            setSaving(true);
            await cloPloApprovalApi.submitClo(clo.cloId);
            await Promise.all([loadCourseClos(selectedCourseId), loadWorkflow(selectedCourseId)]);
            toast.success(`Đã gửi ${clo.cloCode} để duyệt.`);
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSaving(false); }
    };

    const submitMappingForReview = async () => {
        if (!window.confirm("Gửi riêng mapping CLO - PLO để Lãnh đạo khoa duyệt?")) return;
        try {
            setSaving(true);
            await cloPloApprovalApi.saveMappings(selectedCourseId, mappings);
            const data = await cloPloApprovalApi.submitMapping(selectedCourseId);
            setWorkflow(data);
            toast.success("Đã gửi mapping CLO - PLO để duyệt.");
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSaving(false); }
    };

    if (!selectedCourseId) {
        return (
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Chuẩn đầu ra học phần</p>
                            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Quản lý CLO theo khóa học</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Chọn một khóa học để xem và quản lý bộ chuẩn đầu ra riêng của khóa học đó.</p>
                        </div>
                        <div className="relative w-full lg:max-w-sm">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hoặc tên khóa học..." className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-400 focus:bg-white" />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Tổng CLO</span><Target className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-slate-900">{overviewStats.total}</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Bản nháp</span><FileEdit className="h-5 w-5 text-slate-500" /></div><p className="mt-3 text-2xl font-black text-slate-900">{overviewStats.draft}</p></div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-amber-800">Chờ duyệt</span><Clock3 className="h-5 w-5 text-amber-600" /></div><p className="mt-3 text-2xl font-black text-amber-900">{overviewStats.pending}</p></div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-emerald-800">Đã duyệt</span><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-emerald-900">{overviewStats.approved}</p></div>
                </section>

                {loading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải danh sách khóa học...</div>
                ) : filteredCourses.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Không tìm thấy khóa học phù hợp.</div>
                ) : (
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <button key={course.courseId} type="button" onClick={() => setSearchParams({ courseId: course.courseId })} className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><BookOpen className="h-6 w-6" /></div>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{cloCountByCourse[course.courseId] || 0} CLO</span>
                                </div>
                                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{course.courseCode || course.courseId}</p>
                                <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold text-slate-900 group-hover:text-emerald-700">{course.courseName}</h2>
                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500"><span>{course.credits ? `${course.credits} tín chỉ` : course.department || "Khóa học"}</span><span className="inline-flex items-center gap-1 font-semibold text-emerald-700">Xem CLO <ArrowRight className="h-4 w-4" /></span></div>
                            </button>
                        ))}
                    </section>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1440px] space-y-5">
            <button type="button" onClick={() => setSearchParams({})} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />Danh sách khóa học</button>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><GraduationCap className="h-7 w-7" /></div>
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{selectedCourse?.courseCode || selectedCourseId}</p><h1 className="mt-1 text-2xl font-black text-slate-900">{selectedCourse?.courseName || "Khóa học"}</h1><p className="mt-1 text-sm text-slate-500">{courseClos.length} chuẩn đầu ra học phần</p></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {isMainLecturer ? <button type="button" onClick={openCreateModal} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-5 w-5" />Thêm CLO</button> : null}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tổng CLO</p><p className="mt-1 text-xl font-black text-slate-900">{courseStats.total}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Có thể chỉnh sửa</p><p className="mt-1 text-xl font-black text-slate-900">{courseStats.draft + courseStats.rejected}</p></div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Chờ duyệt</p><p className="mt-1 text-xl font-black text-amber-900">{courseStats.pending}</p></div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Chính thức</p><p className="mt-1 text-xl font-black text-emerald-900">{courseStats.approved}</p></div>
            </section>

            {isMainLecturer && mappingState?.status === "REJECTED" && mappingState.rejectionReason ? <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><b>Lý do từ chối mapping:</b><p className="mt-1">{mappingState.rejectionReason}</p></div></div> : null}

            {isMainLecturer ? <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <button onClick={() => setActiveTab("CLO")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${activeTab === "CLO" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Target className="mr-2 inline h-4 w-4" />CLO</button>
                <button onClick={() => setActiveTab("MAPPING")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${activeTab === "MAPPING" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Link2 className="mr-2 inline h-4 w-4" />Ánh xạ CLO - PLO</button>
            </div> : null}

            {(!isMainLecturer || activeTab === "CLO") && (loadingClos ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải danh sách CLO...</div>
            ) : courseClos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Target className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold text-slate-800">Khóa học chưa có CLO</h2><p className="mt-1 text-sm text-slate-500">{isMainLecturer ? "Tạo chuẩn đầu ra đầu tiên cho khóa học này." : "Học phần này chưa có dữ liệu CLO."}</p>{isMainLecturer ? <button type="button" onClick={openCreateModal} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">Tạo CLO đầu tiên</button> : null}</div>
            ) : (
                <section className="grid gap-4 lg:grid-cols-2">
                    {courseClos.map((clo) => {
                        const cloStatus = clo.approvalStatus || "DRAFT";
                        const itemEditable = isMainLecturer && (cloStatus === "DRAFT" || cloStatus === "REJECTED");
                        return <article key={clo.cloId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700">{clo.cloCode}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{clo.cloName}</h2><div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Bloom: {clo.bloomLevel}</span><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cloStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" : cloStatus === "REJECTED" ? "bg-rose-100 text-rose-700" : cloStatus === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{statusLabel[cloStatus]}</span></div></div><div className="flex gap-1"><Link to={`/mainlecturer/clo/${clo.cloId}`} aria-label={`Xem ${clo.cloCode}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><Eye className="h-4 w-4" /></Link>{itemEditable ? <><button type="button" onClick={() => openEditModal(clo)} aria-label={`Sửa ${clo.cloCode}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(clo)} aria-label={`Xóa ${clo.cloCode}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></> : null}</div></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{clo.description || "Chưa có mô tả."}</p>{cloStatus === "REJECTED" && clo.rejectionReason ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"><b>Lý do từ chối:</b> {clo.rejectionReason}</p> : null}{itemEditable ? <button disabled={saving} onClick={() => submitCloForReview(clo)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" />Gửi duyệt {clo.cloCode}</button> : null}</div></div>
                        </article>;
                    })}
                </section>
            ))}

            {isMainLecturer && activeTab === "MAPPING" ? <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Ma trận ánh xạ CLO - PLO</h2><p className="mt-1 text-sm text-slate-500">Mapping là tùy chọn đối với hồ sơ CLO và được gửi duyệt riêng sau khi CLO chính thức.</p></div>{mappingState ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">Mapping: {statusLabel[mappingState.status]}</span> : null}</div>
                {workflowLoading ? <div className="p-10 text-center text-sm text-slate-500">Đang tải ánh xạ...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50"><tr><th className="sticky left-0 bg-slate-50 px-5 py-4 text-left">CLO</th>{workflow?.plos.map((plo) => <th key={plo.ploId} title={plo.description} className="px-4 py-4 text-center">{plo.ploCode}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{workflow?.clos.map((clo) => <tr key={clo.cloId}><td className="sticky left-0 bg-white px-5 py-4"><b className="text-emerald-700">{clo.cloCode}</b><p className="mt-1 max-w-xs text-xs text-slate-500">{clo.cloName || clo.description}</p></td>{workflow.plos.map((plo) => <td key={plo.ploId} className="px-4 py-4 text-center"><input type="checkbox" disabled={!mappingEditable} checked={(mappings[clo.cloId] || []).includes(plo.ploId)} onChange={() => toggleMapping(clo.cloId, plo.ploId)} className="h-5 w-5 rounded border-slate-300 accent-emerald-600" /></td>)}</tr>)}</tbody></table></div>}
                {mappingEditable ? <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end"><button disabled={saving} onClick={saveMappings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-bold text-slate-700"><Save className="h-4 w-4" />Lưu nháp</button><button disabled={saving} onClick={submitMappingForReview} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />Gửi duyệt mapping</button></div> : <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-sm font-medium text-slate-600">Mapping đang ở trạng thái {mappingState ? statusLabel[mappingState.status] : "Bản nháp"} và không thể chỉnh sửa.</div>}
            </section> : null}

            {showModal ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6"><div><h2 className="text-xl font-bold text-slate-900">{editingClo ? "Chỉnh sửa CLO" : "Thêm CLO mới"}</h2><p className="mt-1 text-sm text-slate-500">Thuộc khóa học: <strong>{selectedCourse?.courseName || selectedCourseId}</strong></p></div><button type="button" onClick={closeModal} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-sm font-semibold text-slate-700">Mã CLO<input value={formData.cloCode} onChange={(event) => setFormData((current) => ({ ...current, cloCode: event.target.value }))} placeholder="Ví dụ: CLO1" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-emerald-500" required /></label>
                                <label className="text-sm font-semibold text-slate-700">Mức độ Bloom<select value={formData.bloomLevel} onChange={(event) => setFormData((current) => ({ ...current, bloomLevel: event.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-emerald-500" required><option value="">Chọn mức độ</option>{bloomLevels.map((level) => <option key={level.level} value={level.level}>{level.level}</option>)}</select></label>
                            </div>
                            <label className="block text-sm font-semibold text-slate-700">Tên chuẩn đầu ra<input value={formData.cloName} onChange={(event) => setFormData((current) => ({ ...current, cloName: event.target.value }))} placeholder="Nhập tên chuẩn đầu ra" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-emerald-500" required /></label>
                            <label className="block text-sm font-semibold text-slate-700">Mô tả<textarea rows={4} value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả năng lực sinh viên cần đạt..." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-500" required /></label>
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={closeModal} disabled={saving} className="min-h-12 rounded-xl border border-slate-300 px-5 font-semibold text-slate-700">Hủy</button><button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-emerald-700 px-6 font-semibold text-white disabled:opacity-60">{saving ? "Đang lưu..." : editingClo ? "Lưu thay đổi" : "Tạo CLO"}</button></div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
