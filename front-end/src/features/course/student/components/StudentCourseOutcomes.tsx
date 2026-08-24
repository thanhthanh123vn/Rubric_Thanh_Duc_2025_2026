import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Layers3, Loader2, RefreshCw, Target } from "lucide-react";
import { useParams } from "react-router-dom";

import Banner from "@/components/common/Banner";
import { courseService } from "@/features/course/courseApi.ts";
import { getClosByCourse, type CloResponse } from "@/features/rubric/rubricApi.ts";
import { resolveBannerColor } from "@/utils/colorUtils";

const sortClos = (items: CloResponse[]) => [...items].sort((left, right) =>
  (left.cloCode || left.cloName || "").localeCompare(right.cloCode || right.cloName || "", "vi", { numeric: true }),
);

export default function StudentCourseOutcomes() {
  const { id: offeringId } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [clos, setClos] = useState<CloResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOutcomes = useCallback(async () => {
    if (!offeringId) return;
    setLoading(true);
    setError("");
    try {
      const courseData = await courseService.getCourseById(offeringId);
      const courseId = courseData?.course?.courseId || courseData?.courseId;
      if (!courseId) throw new Error("Không xác định được khóa học của lớp học phần.");

      const cloResponse = await getClosByCourse(courseId);
      const courseClos = Array.isArray(cloResponse.data) ? cloResponse.data : [];
      setCourse(courseData);
      setClos(sortClos(courseClos.filter((clo) => !clo.approvalStatus || clo.approvalStatus === "APPROVED")));
    } catch (loadError) {
      console.error("Không thể tải chuẩn đầu ra khóa học:", loadError);
      setClos([]);
      setError("Chưa thể tải chuẩn đầu ra khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [offeringId]);

  useEffect(() => { void loadOutcomes(); }, [loadOutcomes]);

  const bloomLevels = useMemo(
    () => new Set(clos.map((clo) => clo.bloomLevel?.trim()).filter(Boolean)).size,
    [clos],
  );
  const courseName = course?.course?.courseName || course?.courseName || "Chuẩn đầu ra khóa học";
  const courseCode = course?.course?.courseCode || course?.courseCode || offeringId || "--";
  const bannerColor = offeringId ? resolveBannerColor(offeringId, course?.bannerColor) : "emerald";

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 xl:p-8">
      <div className="mx-auto w-full max-w-[1312px] space-y-6">
        <Banner title={courseName} description={`Chuẩn đầu ra chính thức của khóa học · ${courseCode}`} color={bannerColor} imageUrl={course?.bannerImageUrl} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700"><Target className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.16em]">Chuẩn đầu ra khóa học</p></div>
              <h1 className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">Sinh viên cần đạt được gì sau khóa học?</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Danh sách dưới đây là các CLO đã được phê duyệt chính thức. Tiến độ đạt từng CLO được theo dõi riêng trong mục Tiến độ OBE cá nhân.</p>
            </div>
            <button type="button" onClick={() => void loadOutcomes()} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>

          {!loading && !error ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4"><div className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-emerald-700" /><span className="text-sm font-semibold text-emerald-900">CLO chính thức</span></div><p className="mt-2 text-2xl font-black text-emerald-700">{clos.length}</p></div>
              <div className="rounded-2xl bg-violet-50 p-4"><div className="flex items-center gap-3"><Layers3 className="h-5 w-5 text-violet-700" /><span className="text-sm font-semibold text-violet-900">Mức Bloom</span></div><p className="mt-2 text-2xl font-black text-violet-700">{bloomLevels}</p></div>
            </div>
          ) : null}
        </section>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm font-medium text-slate-600 shadow-sm"><Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />Đang tải chuẩn đầu ra khóa học...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">{error}</div>
        ) : clos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Target className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-4 font-bold text-slate-900">Chưa có CLO chính thức</h2><p className="mt-2 text-sm text-slate-500">Khóa học hiện chưa có chuẩn đầu ra đã được phê duyệt.</p></div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {clos.map((clo, index) => (
              <article key={clo.cloId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-700">{index + 1}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-900">{clo.cloName || clo.cloCode || `CLO ${index + 1}`}</h2>{clo.cloCode && clo.cloCode !== clo.cloName ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{clo.cloCode}</span> : null}</div>
                      {clo.bloomLevel ? <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Bloom: {clo.bloomLevel}</span> : null}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{clo.description || "Chuẩn đầu ra này chưa có mô tả chi tiết."}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
