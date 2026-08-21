import {
    ArrowLeft, ArrowRight, BookOpen, Edit2, Eye, GraduationCap, Plus, Search, Target, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { bloomLevels } from "./mainLecturerData";
import {
    createClo,
    getAllClo,
    getClosByCourse,
    getCourseOptions,
    updateClo,
    type CloPayload,
    type CloResponse,
    type CourseOption,
} from "@/features/rubric/rubricApi.ts";

type FormState = {
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
};

const emptyForm: FormState = { cloCode: "", cloName: "", description: "", bloomLevel: "" };

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } | string } }).response;
        if (typeof response?.data === "string") return response.data;
        if (response?.data?.message) return response.data.message;
    }
    return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
}

export default function CLOManagement() {
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

    const selectedCourse = courses.find((course) => course.courseId === selectedCourseId) ?? null;
    const cloCountByCourse = useMemo(() => {
        return allClos.reduce<Record<string, number>>((counts, clo) => {
            counts[clo.courseId] = (counts[clo.courseId] || 0) + 1;
            return counts;
        }, {});
    }, [allClos]);
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

        Promise.resolve()
            .then(() => {
                if (active) setLoadingClos(true);
                return getClosByCourse(selectedCourseId);
            })
            .then((response) => {
                if (active) setCourseClos(Array.isArray(response.data) ? response.data : []);
            })
            .catch((error) => {
                if (!active) return;
                setCourseClos([]);
                toast.error(getErrorMessage(error));
            })
            .finally(() => {
                if (active) setLoadingClos(false);
            });

        return () => { active = false; };
    }, [selectedCourseId]);

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
            await Promise.all([loadCourseClos(selectedCourseId), loadOverview()]);
            toast.success(editingClo ? "Đã cập nhật CLO." : "Đã tạo CLO cho khóa học.");
            closeModal();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
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
                    <button type="button" onClick={openCreateModal} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-5 w-5" />Thêm CLO</button>
                </div>
            </section>

            {loadingClos ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải danh sách CLO...</div>
            ) : courseClos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Target className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 font-bold text-slate-800">Khóa học chưa có CLO</h2><p className="mt-1 text-sm text-slate-500">Tạo chuẩn đầu ra đầu tiên cho khóa học này.</p><button type="button" onClick={openCreateModal} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">Tạo CLO đầu tiên</button></div>
            ) : (
                <section className="grid gap-4 lg:grid-cols-2">
                    {courseClos.map((clo) => (
                        <article key={clo.cloId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700">{clo.cloCode}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{clo.cloName}</h2><span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Bloom: {clo.bloomLevel}</span></div><div className="flex gap-1"><Link to={`/mainlecturer/clo/${clo.cloId}`} aria-label={`Xem ${clo.cloCode}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><Eye className="h-4 w-4" /></Link><button type="button" onClick={() => openEditModal(clo)} aria-label={`Sửa ${clo.cloCode}`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><Edit2 className="h-4 w-4" /></button></div></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{clo.description || "Chưa có mô tả."}</p></div></div>
                        </article>
                    ))}
                </section>
            )}

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
