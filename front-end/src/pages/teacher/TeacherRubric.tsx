import {
  BookOpen, CheckCircle2, Edit3, Eye, GraduationCap, Layers3, Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getAllRubric, getClosByCourse, type CloResponse } from "@/features/rubric/rubricApi";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import courseService from "@/pages/admin/api/courseService.ts";

interface TeacherCourse {
  courseId: string;
  offeringId: string;
  courseCode: string;
  courseName: string;
  semester?: string;
}

interface RubricDTO {
  id: string;
  name: string;
  description: string;
  defaultType?: string;
  status?: string;
}

const cloStatusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

const cloStatusClass: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } | string } }).response;
    if (typeof response?.data === "string") return response.data;
    if (response?.data?.message) return response.data.message;
  }
  return "Không thể tải dữ liệu. Vui lòng thử lại.";
}

export default function TeacherRubric() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [cloItems, setCloItems] = useState<CloResponse[]>([]);
  const [rubricTemplates, setRubricTemplates] = useState<RubricDTO[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingClos, setLoadingClos] = useState(false);
  const navigate = useNavigate();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.courseId === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  useEffect(() => {
    let active = true;

    Promise.allSettled([courseService.getLecturerDashBoardCourses(), getAllRubric()])
      .then(([courseResult, rubricResult]) => {
        if (!active) return;

        const courseResponse = courseResult.status === "fulfilled" ? courseResult.value : [];
        const uniqueCourses = Array.from(
          new Map(
            ((Array.isArray(courseResponse) ? courseResponse : []) as TeacherCourse[])
              .filter((course) => Boolean(course.courseId))
              .map((course) => [course.courseId, course]),
          ).values(),
        );

        setCourses(uniqueCourses);
        setSelectedCourseId((current) => current || uniqueCourses[0]?.courseId || "");
        setRubricTemplates(
          rubricResult.status === "fulfilled" && Array.isArray(rubricResult.value.data)
            ? rubricResult.value.data
            : [],
        );

        if (courseResult.status === "rejected") toast.error(getErrorMessage(courseResult.reason));
        if (rubricResult.status === "rejected") toast.error(getErrorMessage(rubricResult.reason));
      })
      .finally(() => {
        if (active) setLoadingPage(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setCloItems([]);
      return;
    }

    let active = true;
    setLoadingClos(true);
    getClosByCourse(selectedCourseId)
      .then((response) => {
        if (!active) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        setCloItems(rows.filter((clo) => clo.courseId === selectedCourseId));
      })
      .catch((error) => {
        if (!active) return;
        setCloItems([]);
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoadingClos(false);
      });

    return () => { active = false; };
  }, [selectedCourseId]);

  if (loadingPage) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải dữ liệu CLO và Rubric...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5">
      <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><GraduationCap className="h-6 w-6" /></div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Chuẩn đầu ra và đánh giá</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">CLO & Rubric</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Xem CLO riêng theo từng học phần và truy cập các Rubric phục vụ đánh giá.</p>
          </div>

          <label className="w-full text-sm font-bold text-slate-700 lg:max-w-md">
            Học phần đang xem
            <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-medium outline-none focus:border-emerald-500">
              {courses.length === 0 ? <option value="">Chưa được phân công học phần</option> : null}
              {courses.map((course) => <option key={course.courseId} value={course.courseId}>{course.courseCode} - {course.courseName}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Học phần phụ trách</span><BookOpen className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-slate-900">{courses.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">CLO học phần</span><Target className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-2xl font-black text-slate-900">{cloItems.length}</p></div>
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Rubric khả dụng</span><Layers3 className="h-5 w-5 text-violet-600" /></div><p className="mt-3 text-2xl font-black text-slate-900">{rubricTemplates.length}</p></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{selectedCourse?.courseCode || "CLO"}</p><h2 className="mt-1 text-xl font-black text-slate-900">CLO của học phần</h2><p className="mt-1 text-sm text-slate-500">{selectedCourse?.courseName || "Chọn học phần để xem CLO"}</p></div>
            <Target className="h-5 w-5 shrink-0 text-emerald-600" />
          </div>

          <div className="mt-5 space-y-3">
            {loadingClos ? <div className="py-10 text-center text-sm text-slate-500">Đang tải CLO của học phần...</div> : null}
            {!loadingClos && !selectedCourseId ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Tài khoản chưa được phân công học phần.</div> : null}
            {!loadingClos && selectedCourseId && cloItems.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Học phần này chưa có CLO.</div> : null}
            {!loadingClos && cloItems.map((item) => {
              const status = item.approvalStatus || "DRAFT";
              return (
                <article key={item.cloId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{item.cloCode}</p><h3 className="mt-1 font-bold text-slate-900">{item.cloName}</h3></div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${cloStatusClass[status] || cloStatusClass.DRAFT}`}>{cloStatusLabel[status] || status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description || "Chưa có mô tả."}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><CheckCircle2 className="h-4 w-4 text-blue-500" />Bloom: {item.bloomLevel || "Chưa xác định"}</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Thư viện đánh giá</p><h2 className="mt-1 text-xl font-black text-slate-900">Rubric khả dụng</h2><p className="mt-1 text-sm text-slate-500">Chọn Rubric để xem nội dung và tiêu chí đánh giá.</p></div>
            <Layers3 className="h-5 w-5 shrink-0 text-violet-600" />
          </div>

          <div className="mt-5 space-y-3">
            {rubricTemplates.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Chưa có Rubric khả dụng.</div> : null}
            {rubricTemplates.map((template) => (
              <button type="button" key={template.id || template.name} onClick={() => navigate(user?.role === "ADMIN" ? `/admin/rubrics/list/${template.id}` : `/teacher/rubric/${template.id}`)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40">
                <div className="min-w-0"><p className="font-bold text-slate-900">{template.name}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{template.description || "Chưa có mô tả."}</p>{template.defaultType ? <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{template.defaultType}</span> : null}</div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">{user?.role === "ADMIN" ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
