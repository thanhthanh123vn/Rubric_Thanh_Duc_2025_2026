import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import AssessmentDetailModal from "./AssessmentDetailModal";
import { courseService } from "@/features/course/courseApi";
import type { Assessment } from "@/features/course/student/assignmentSlice";
import StudentAttendanceCheckIn from "@/features/course/student/components/StudentAttendanceCheckIn.tsx";
import { assessmentCommentApi } from "@/features/course/student/api/AssignmentDetailPost.ts";
import { getRubricById, type RubricDTO } from "@/api/RubricApi.ts";
import type { AssessmentSubmission } from "@/features/course/student/api/type.ts";

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN");
}

function getAssessmentStatus(item: { calculatedScore: number | null; submissionId: string | null }) {
  if (item.calculatedScore !== null) {
    return "Đã chấm";
  }

  if (item.submissionId) {
    return "Đã nộp";
  }

  return "Chưa nộp";
}

function getAssessmentStatusClass(status: string) {
  if (status === "Đã chấm") {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  }

  if (status === "Đã nộp") {
    return "border border-amber-200 bg-amber-100 text-amber-700";
  }

  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function getAssessmentType(item: Assessment) {
  return (item.assessmentType || "").trim().toLowerCase();
}

function isProjectAssessment(item: Assessment) {
  return getAssessmentType(item) === "project";
}

function isAssignmentOrQuizAssessment(item: Assessment) {
  const assessmentType = getAssessmentType(item);
  return assessmentType === "assignment" || assessmentType === "quiz";
}

export default function CourseEvaluations() {
  const { id: offeringId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedAssessmentDetail, setSelectedAssessmentDetail] = useState<AssessmentSubmission | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<RubricDTO | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const assignmentAssessments = useMemo(
    () => scoredAssessments.filter((item) => isAssignmentOrQuizAssessment(item)),
    [scoredAssessments],
  );

  const projectAssessments = useMemo(
    () => scoredAssessments.filter((item) => isProjectAssessment(item)),
    [scoredAssessments],
  );

  const selectedSummary = useMemo(
    () => scoredAssessments.find((item) => item.assessmentId === selectedAssessmentId) || null,
    [scoredAssessments, selectedAssessmentId],
  );

  const courseTitle = course?.course?.courseName || course?.courseName || "Học phần";

  const assignmentSummary = useMemo(() => {
    const graded = assignmentAssessments.filter((item) => item.calculatedScore !== null);
    const average =
      graded.length > 0
        ? (graded.reduce((sum, item) => sum + (item.calculatedScore || 0), 0) / graded.length).toFixed(1)
        : "--";

    return {
      total: assignmentAssessments.length.toString(),
      graded: graded.length.toString(),
      average: average === "--" ? "--" : `${average}/10`,
    };
  }, [assignmentAssessments]);

  const projectSummary = useMemo(() => {
    const graded = projectAssessments.filter((item) => item.calculatedScore !== null);
    const average =
      graded.length > 0
        ? (graded.reduce((sum, item) => sum + (item.calculatedScore || 0), 0) / graded.length).toFixed(1)
        : "--";

    return {
      total: projectAssessments.length.toString(),
      graded: graded.length.toString(),
      average: average === "--" ? "--" : `${average}/10`,
    };
  }, [projectAssessments]);

  useEffect(() => {
    if (!isDetailOpen || !selectedAssessmentId) {
      return;
    }

    const fetchAssessmentDetail = async () => {
      try {
        setDetailLoading(true);
        const detail = await assessmentCommentApi.getAssessmentDetail(selectedAssessmentId);
        setSelectedAssessmentDetail(detail);

        if (detail?.rubricId) {
          const rubricResponse = await getRubricById(detail.rubricId);
          setSelectedRubric(rubricResponse.data || rubricResponse);
        } else {
          setSelectedRubric(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đánh giá:", error);
        setSelectedAssessmentDetail(null);
        setSelectedRubric(null);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchAssessmentDetail();
  }, [isDetailOpen, selectedAssessmentId]);

  const openDetail = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setSelectedAssessmentDetail(null);
    setSelectedRubric(null);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  const renderAssessmentTable = (items: Assessment[], emptyText: string) => {
    if (items.length === 0) {
      return <div className="p-6 text-sm text-slate-500">{emptyText}</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <th className="px-4 py-3">Tên đánh giá</th>
              <th className="px-4 py-3">Hạn nộp</th>
              <th className="px-4 py-3">CLO</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Điểm</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const status = getAssessmentStatus(item);

              return (
                <tr key={item.assessmentId} className="align-top text-slate-700 transition-colors hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{item.assessmentName}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{formatDateTime(item.endTime)}</td>
                  <td className="px-4 py-4">{item.cloCode?.length ? item.cloCode.join(", ") : "Chưa gắn CLO"}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getAssessmentStatusClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {item.calculatedScore !== null ? `${item.calculatedScore}/10` : "--"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openDetail(item.assessmentId)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Xem đánh giá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAssignments = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleCard title="Tổng bài tập" value={assignmentSummary.total} note="Số bài tập đã nộp hoặc đã có điểm trong học phần." />
        <SimpleCard title="Đã chấm" value={assignmentSummary.graded} note="Số bài tập đã có điểm và phản hồi." />
        <SimpleCard title="Điểm trung bình" value={assignmentSummary.average} note="Tính trên các bài đã được chấm." />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {renderAssessmentTable(assignmentAssessments, "Chưa có bài tập nào được nộp hoặc chấm trong học phần này.")}
      </div>
    </div>
  );

  const renderProject = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleCard title="Tổng đồ án" value={projectSummary.total} note="Số đầu mục đồ án đã có nộp bài hoặc đã được chấm." />
        <SimpleCard title="Đã chấm" value={projectSummary.graded} note="Số đầu mục đồ án đã có điểm và nhận xét." />
        <SimpleCard title="Điểm trung bình" value={projectSummary.average} note="Tính trên các đầu mục đồ án đã được chấm." />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Đánh giá đồ án</p>
            <p className="mt-1 text-sm text-slate-500">Xem các cột mốc đồ án, điểm số và phản hồi chi tiết từ giảng viên.</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {projectAssessments.length > 0 ? `${projectAssessments.length} đầu mục` : "Chưa có dữ liệu"}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {renderAssessmentTable(projectAssessments, "Chưa có đầu mục đồ án nào được nộp hoặc chấm trong học phần này.")}
        </div>
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
        <p className="text-sm font-semibold text-slate-900">Nhận xét cuối kỳ</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kết quả cuối kỳ ở mức tốt. Nếu tiếp tục giữ ổn định ở bài tập và project, tổng kết học phần sẽ rất khả quan.
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
          : "Bài cuối kỳ";

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
              {loading ? <div className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</div> : renderContent()}
            </section>
          </div>
        </main>
      </div>

      <AssessmentDetailModal
        isOpen={isDetailOpen}
        detailLoading={detailLoading}
        selectedSummary={selectedSummary}
        selectedAssessmentDetail={selectedAssessmentDetail}
        selectedRubric={selectedRubric}
        onClose={closeDetail}
      />
    </div>
  );
}
