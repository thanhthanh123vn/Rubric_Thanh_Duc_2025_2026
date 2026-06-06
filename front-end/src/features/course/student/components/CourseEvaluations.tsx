import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "@/features/course/courseApi";
import type { Assessment } from "@/features/course/student/assignmentSlice";
import StudentAttendanceCheckIn from "@/features/course/student/components/StudentAttendanceCheckIn.tsx";

type SectionKey = "attendance" | "assignments" | "project" | "final";

function normalizeSection(value: string | null): SectionKey {
  if (value === "attendance" || value === "assignments" || value === "project" || value === "final") {
    return value;
  }
  return "attendance";
}

function SimpleCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

export default function CourseEvaluations() {
  const { id: offeringId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSection = normalizeSection(searchParams.get("section"));

  useEffect(() => {
    if (!searchParams.get("section")) {
      setSearchParams({ section: "attendance" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!offeringId) {
        return;
      }

      try {
        setLoading(true);
        const [courseData, assessmentData] = await Promise.all([
          courseService.getCourseById(offeringId),
          courseService.getAssessmentByOffering(offeringId),
        ]);
        setCourse(courseData);
        setAssessments(assessmentData || []);
      } catch (error) {
        console.error("Lỗi khi tải trang đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offeringId]);

  const scoredAssessments = useMemo(
    () => assessments.filter((item) => item.calculatedScore !== null || item.submissionId),
    [assessments],
  );

  const courseTitle = course?.course?.courseName || course?.courseName || "Học phần";

  const assignmentSummary = useMemo(() => {
    const graded = scoredAssessments.filter((item) => item.calculatedScore !== null);
    const average =
      graded.length > 0
        ? (
            graded.reduce((sum, item) => sum + (item.calculatedScore || 0), 0) / graded.length
          ).toFixed(1)
        : "--";

    return {
      total: scoredAssessments.length.toString(),
      graded: graded.length.toString(),
      average: average === "--" ? "--" : `${average}/10`,
    };
  }, [scoredAssessments]);

  const renderAssignments = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleCard title="Tổng bài tập" value={assignmentSummary.total} note="Số bài tập hiện có trong mục đánh giá." />
        <SimpleCard title="Đã chấm" value={assignmentSummary.graded} note="Số bài tập đã có điểm." />
        <SimpleCard title="Điểm trung bình" value={assignmentSummary.average} note="Tính trên các bài đã chấm." />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {scoredAssessments.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Chưa có bài tập nào được chấm trong học phần này.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-4 py-3">Bài tập</th>
                  <th className="px-4 py-3">Hạn nộp</th>
                  <th className="px-4 py-3">CLO</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoredAssessments.map((item) => {
                  const status =
                    item.calculatedScore !== null
                      ? "Đã chấm"
                      : item.submissionId
                        ? "Đã nộp"
                        : "Chưa nộp";

                  return (
                    <tr key={item.assessmentId} className="align-top text-slate-700">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.assessmentName}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{new Date(item.endTime).toLocaleString("vi-VN")}</td>
                      <td className="px-4 py-4">
                        {item.cloCode?.length ? item.cloCode.join(", ") : "Chưa gắn CLO"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.calculatedScore !== null ? `${item.calculatedScore}/10` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderProject = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleCard title="Tiến độ" value="84%" note="Tiến độ nhóm hiện tại." />
        <SimpleCard title="Đánh giá demo" value="82%" note="Kết quả demo gần nhất." />
        <SimpleCard title="Phản hồi" value="Tốt" note="Giảng viên đánh giá nhóm đang đi đúng hướng." />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Ghi chú project</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nhóm đã hoàn thành phần lớn chức năng chính. Nên tiếp tục hoàn thiện phần trình bày và test trước buổi demo cuối.
        </p>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleCard title="Kiến thức" value="90%" note="Nắm được nội dung trọng tâm." />
        <SimpleCard title="Ứng dụng" value="86%" note="Làm đúng yêu cầu bài." />
        <SimpleCard title="Trình bày" value="92%" note="Trình bày rõ ràng, dễ theo dõi." />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Nhận xét cuối kì</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kết quả cuối kì ở mức tốt. Nếu tiếp tục giữ ổn định ở bài tập và project, tổng kết học phần sẽ rất khả quan.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeSection === "attendance") {
      return <StudentAttendanceCheckIn offeringId={offeringId || ""} />;
    }

    if (activeSection === "assignments") {
      return renderAssignments();
    }

    if (activeSection === "project") {
      return renderProject();
    }

    return renderFinal();
  };

  const currentLabel =
    activeSection === "attendance"
      ? "Điểm danh"
      : activeSection === "assignments"
        ? "Bài tập"
        : activeSection === "project"
          ? "Project"
          : "Bài cuối kì";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="flex">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Đánh giá học phần</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">{courseTitle}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Chọn mục ở sidebar bên trái để xem chi tiết từng phần đánh giá.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {currentLabel}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
              ) : (
                renderContent()
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
