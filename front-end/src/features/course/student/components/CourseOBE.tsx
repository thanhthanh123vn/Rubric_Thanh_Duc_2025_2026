import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useParams } from "react-router-dom";

import Banner from "@/components/common/Banner";
import { courseService, type StudentOBEProgress } from "@/features/course/courseApi";
import { resolveBannerColor } from "@/utils/colorUtils";

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

function getStudentProgress(clo: StudentOBEProgress) {
  const achieved = Number(clo.achievedScore || 0);
  const totalWeight = Number(clo.totalWeight || 0);

  // Dữ liệu sinh viên phải dựa trên điểm/trọng số cá nhân, không dùng tỷ lệ tổng hợp của lớp.
  if (totalWeight > 0) return clampPercent((achieved / totalWeight) * 100);
  return clampPercent(Number(clo.progressPercent || 0));
}

function getProgressMeta(progress: number) {
  if (progress >= 75) {
    return { label: "Đạt", bar: "bg-emerald-500", text: "text-emerald-700" };
  }
  if (progress >= 50) {
    return { label: "Cần cải thiện", bar: "bg-amber-400", text: "text-amber-700" };
  }
  return { label: "Chưa đạt", bar: "bg-rose-500", text: "text-rose-700" };
}

export default function CourseOBE() {
  const { id: offeringId } = useParams();
  const [clos, setClos] = useState<StudentOBEProgress[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!offeringId) return undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [studentObeData, courseData] = await Promise.all([
          courseService.getOBEProgressByStudent(offeringId),
          courseService.getCourseById(offeringId),
        ]);
        if (!active) return;
        setClos(Array.isArray(studentObeData) ? studentObeData : []);
        setCourse(courseData);
      } catch (fetchError) {
        console.error("Lỗi tải OBE cá nhân:", fetchError);
        if (active) setError("Chưa thể tải tiến độ OBE cá nhân. Vui lòng thử lại sau.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();
    return () => { active = false; };
  }, [offeringId]);

  const summary = useMemo(() => {
    const totalAchieved = clos.reduce((sum, clo) => sum + Number(clo.achievedScore || 0), 0);
    const totalWeight = clos.reduce((sum, clo) => sum + Number(clo.totalWeight || 0), 0);
    const overall = totalWeight > 0 ? clampPercent((totalAchieved / totalWeight) * 100) : 0;
    return { overall: Math.round(overall) };
  }, [clos]);

  const bannerColor = offeringId ? resolveBannerColor(offeringId, course?.bannerColor) : "emerald";

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 xl:p-8">
      <div className="mx-auto w-full max-w-[1312px]">
        <Banner
          title={course?.course?.courseName || "Tiến độ OBE"}
          description={`Tiến độ OBE cá nhân${course ? ` · ${course.semester} (${course.year})` : ""}`}
          color={bannerColor}
          imageUrl={course?.bannerImageUrl}
        />

        {loading ? (
          <div className="space-y-5 py-6">
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">{error}</div>
        ) : clos.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 font-bold text-slate-900">Chưa có dữ liệu OBE cá nhân</h3>
            <p className="mt-2 text-sm text-slate-500">Dữ liệu sẽ xuất hiện sau khi bài đánh giá gắn CLO của bạn được chấm.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="font-medium text-gray-700">Tiến độ tổng</p>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-3 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${summary.overall}%` }} />
              </div>
              <p className="mt-1 text-right text-sm text-gray-600">{summary.overall}%</p>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div><h3 className="font-bold text-slate-900">Chi tiết chuẩn đầu ra (CLO)</h3><p className="mt-1 text-xs text-slate-500">Mỗi thanh sử dụng dữ liệu điểm và trọng số riêng của tài khoản sinh viên hiện tại.</p></div>
                <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{clos.length} CLO</span>
              </div>
              <div className="space-y-4">
                {clos.map((clo, index) => <CLOProgressCard key={clo.cloId || `${clo.cloCode}-${index}`} clo={clo} />)}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

function CLOProgressCard({ clo }: { clo: StudentOBEProgress }) {
  const progress = getStudentProgress(clo);
  const meta = getProgressMeta(progress);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-gray-900">{clo.cloCode || "CLO"}</p>
        <span className={`text-sm font-medium ${meta.text}`}>{meta.label}</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{clo.cloDescription || "Chưa có mô tả chuẩn đầu ra."}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-2 rounded-full transition-all duration-500 ${meta.bar}`} style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1 text-right text-sm text-gray-600">{Math.round(progress)}%</p>
    </article>
  );
}
