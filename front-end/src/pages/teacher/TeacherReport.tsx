import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, ClipboardList,
  FileSpreadsheet, FolderKanban, GraduationCap, Loader2, Users, X,
} from "lucide-react";
import { toast } from "sonner";

import { attendanceApi, type AttendanceStudentOverviewResponse } from "@/api/attendanceApi.ts";
import { fetchSubmissionStatuses } from "@/api/GradingApi.ts";
import type { SubmissionStatusDTO } from "@/api/type.ts";
import { courseService, type CourseGradebook } from "@/features/course/courseApi.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { getRubricMatrixById } from "@/api/RubricApi.ts";

type ReportSection = "grades" | "outcomes";
type GradeCategory = "attendance" | "assignments" | "projects";
type AssessmentItem = {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string | null;
  weight?: number | null;
};
type CourseInfo = { courseCode?: string; courseName?: string };
type CourseStudent = { studentId: string; fullName: string };
type CloItem = {
  cloId: string;
  cloCode?: string | null;
  cloDescription?: string | null;
  progressPercent?: number | null;
  passedStudents?: number | null;
  failedStudents?: number | null;
};
type ObeProgress = {
  clos?: CloItem[];
  totalStudents?: number;
  overallProgress?: number;
};
type RubricLevel = { levelId: string; levelName: string; description?: string | null; score?: number | null };
type RubricRow = { criteriaId: string; criteriaName: string; weight: number; levels: RubricLevel[] };
type AttendanceRubric = { id: string; name: string; description?: string; rows: RubricRow[] };

const GRADE_CATEGORIES: Array<{
  key: GradeCategory;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  { key: "attendance", title: "Chuyên cần", description: "Điểm danh theo từng buổi và tỷ lệ tham dự.", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "assignments", title: "Bài tập", description: "Điểm quiz, bài nộp và đánh giá thường xuyên.", icon: <ClipboardList className="h-5 w-5" /> },
  { key: "projects", title: "Project", description: "Điểm các đồ án và project của học phần.", icon: <FolderKanban className="h-5 w-5" /> },
];

const assessmentType = (value?: string | null) => (value || "").trim().toLowerCase();
const clampPercent = (value: number) => Math.max(0, Math.min(value, 100));

function formatScore(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "--";
  return Number(value).toFixed(1);
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function TeacherReportPage({ section }: { section: ReportSection }) {
  const { id: offeringId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gradeCategory, setGradeCategory] = useState<GradeCategory>("attendance");
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStudentOverviewResponse[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [scores, setScores] = useState<Record<string, SubmissionStatusDTO[]>>({});
  const [obe, setObe] = useState<ObeProgress | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [gradebook, setGradebook] = useState<CourseGradebook | null>(null);
  const [rubricStudent, setRubricStudent] = useState<CourseStudent | null>(null);
  const [attendanceRubric, setAttendanceRubric] = useState<AttendanceRubric | null>(null);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [savingAttendanceStudent, setSavingAttendanceStudent] = useState<string | null>(null);
  const [selectedRubricLevels, setSelectedRubricLevels] = useState<Record<string, string>>({});
  const [warningDrafts, setWarningDrafts] = useState<Record<string, string>>({});
  const [bulkGrading, setBulkGrading] = useState(false);

  useEffect(() => {
    if (!offeringId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [courseData, attendanceData, assessmentData, obeData, studentData, gradebookData] = await Promise.all([
          courseService.getCourseById(offeringId),
          attendanceApi.getAttendanceOverviewByOffering(offeringId),
          assessmentService.getAssessmentsByOffering(offeringId),
          courseService.getOBEProgress(offeringId),
          courseService.getStudentsByOffering(offeringId),
          courseService.getGradebook(offeringId),
        ]);
        const assessmentRows: AssessmentItem[] = Array.isArray(assessmentData) ? assessmentData : [];
        setCourse(courseData || null);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
        setAssessments(assessmentRows);
        setObe(obeData || null);
        setStudents(Array.isArray(studentData) ? studentData : []);
        setGradebook(gradebookData || null);
        setWarningDrafts(Object.fromEntries((gradebookData?.students || []).map((student) => [
          student.studentId,
          String(student.attendanceWarningCount ?? 0),
        ])));

        const entries = await Promise.all(assessmentRows.map(async (item) => {
          try {
            const data = await fetchSubmissionStatuses(item.assessmentId);
            return [item.assessmentId, Array.isArray(data) ? data : []] as const;
          } catch (error) {
            console.error(`Không thể tải điểm của ${item.assessmentId}:`, error);
            return [item.assessmentId, []] as const;
          }
        }));
        setScores(Object.fromEntries(entries));
      } catch (error) {
        console.error("Không thể tải báo cáo học phần:", error);
        setCourse(null); setAttendance([]); setAssessments([]); setScores({}); setObe(null); setStudents([]); setGradebook(null);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [offeringId]);

  const roster = useMemo(() => {
    const rows = new Map<string, CourseStudent>();
    students.forEach((item) => rows.set(item.studentId, { studentId: item.studentId, fullName: item.fullName?.trim() || item.studentId }));
    attendance.forEach((item) => rows.set(item.studentId, { studentId: item.studentId, fullName: item.studentName?.trim() || rows.get(item.studentId)?.fullName || item.studentId }));
    Object.values(scores).flat().forEach((item) => {
      if (!rows.has(item.studentId)) rows.set(item.studentId, { studentId: item.studentId, fullName: item.studentId });
    });
    return [...rows.values()].sort((a, b) => a.studentId.localeCompare(b.studentId));
  }, [attendance, scores, students]);

  const attendanceDates = useMemo(() => {
    const dates = new Map<string, { sessionId: string; attendanceDate: string }>();
    attendance.forEach((row) => row.attendanceDates?.forEach((item) => {
      if (!dates.has(item.sessionId)) dates.set(item.sessionId, { sessionId: item.sessionId, attendanceDate: item.attendanceDate });
    }));
    return [...dates.values()].sort((a, b) => new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime());
  }, [attendance]);

  const attendanceMap = useMemo(() => new Map(attendance.map((row) => [row.studentId, row])), [attendance]);
  const scoreMap = useMemo(() => {
    const result = new Map<string, SubmissionStatusDTO>();
    Object.entries(scores).forEach(([assessmentId, items]) => items.forEach((item) => result.set(`${assessmentId}:${item.studentId}`, item)));
    return result;
  }, [scores]);
  const selectedAssessments = useMemo(() => assessments.filter((item) => {
    const type = assessmentType(item.assessmentType);
    if (gradeCategory === "projects") return type === "project";
    if (gradeCategory === "assignments") return type !== "project" && type !== "attendance";
    return false;
  }), [assessments, gradeCategory]);
  const quality = useMemo(() => {
    const clos = Array.isArray(obe?.clos) ? obe.clos : [];
    return {
      clos,
      overall: Number(obe?.overallProgress || 0),
      achieved: clos.filter((item) => Number(item.progressPercent || 0) >= 70).length,
      warning: clos.filter((item) => Number(item.progressPercent || 0) < 50).length,
    };
  }, [obe]);

  const loadAttendanceRubric = async () => {
    if (attendanceRubric) return attendanceRubric;
    setLoadingRubric(true);
    try {
      const response = await getRubricMatrixById("R1");
      const rubric = response.data as AttendanceRubric;
      setAttendanceRubric(rubric);
      return rubric;
    } catch (error) {
      console.error("Không thể tải rubric chuyên cần:", error);
      toast.error("Không thể tải rubric chuyên cần R1.");
      return null;
    } finally {
      setLoadingRubric(false);
    }
  };

  const openAttendanceRubric = async (student: CourseStudent) => {
    setRubricStudent(student);
    setSelectedRubricLevels({});
    await loadAttendanceRubric();
  };

  const rubricScore = useMemo(() => {
    if (!attendanceRubric?.rows?.length) return null;
    let weightedScore = 0;
    let totalWeight = 0;
    for (const criterion of attendanceRubric.rows) {
      const level = criterion.levels?.find((item) => item.levelId === selectedRubricLevels[criterion.criteriaId]);
      if (!level || level.score === null || level.score === undefined) continue;
      const weight = Number(criterion.weight) || 0;
      weightedScore += Number(level.score) * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : null;
  }, [attendanceRubric, selectedRubricLevels]);

  const saveAttendanceScore = async (studentId: string, score: number) => {
    if (!offeringId) return false;
    const saved = gradebook?.students?.find((item) => item.studentId === studentId);
    setSavingAttendanceStudent(studentId);
    try {
      const updated = await courseService.updateGradebookScores(offeringId, [{
        studentId,
        attendanceScore: Math.round(score * 10) / 10,
        assignmentScore: saved?.assignmentScore ?? null,
        examScore: saved?.examScore ?? null,
      }]);
      setGradebook(updated);
      return true;
    } catch (error) {
      console.error("Không thể lưu điểm chuyên cần:", error);
      toast.error("Không thể lưu điểm chuyên cần.");
      return false;
    } finally {
      setSavingAttendanceStudent(null);
    }
  };

  const saveWarningCount = async (studentId: string) => {
    if (!offeringId) return;
    const rawValue = warningDrafts[studentId] ?? "0";
    const warningCount = Number(rawValue);
    if (!Number.isInteger(warningCount) || warningCount < 0) {
      toast.warning("Số lần bị nhắc nhở phải là số nguyên từ 0 trở lên.");
      const savedValue = gradebook?.students?.find((item) => item.studentId === studentId)?.attendanceWarningCount ?? 0;
      setWarningDrafts((current) => ({ ...current, [studentId]: String(savedValue) }));
      return;
    }
    const saved = gradebook?.students?.find((item) => item.studentId === studentId);
    if (warningCount === (saved?.attendanceWarningCount ?? 0)) {
      setWarningDrafts((current) => ({ ...current, [studentId]: String(warningCount) }));
      return;
    }
    setSavingAttendanceStudent(studentId);
    try {
      const updated = await courseService.updateGradebookScores(offeringId, [{
        studentId,
        attendanceScore: saved?.attendanceScore ?? null,
        attendanceWarningCount: warningCount,
        assignmentScore: saved?.assignmentScore ?? null,
        examScore: saved?.examScore ?? null,
      }]);
      setGradebook(updated);
      toast.success(`Đã lưu ${warningCount} lần nhắc nhở cho ${studentId}.`);
    } catch (error) {
      console.error("Không thể lưu số lần nhắc nhở:", error);
      toast.error("Không thể lưu số lần bị nhắc nhở.");
    } finally {
      setSavingAttendanceStudent(null);
    }
  };

  const selectLevelByRank = (criterion: RubricRow, rank: number) => {
    const levels = [...(criterion.levels || [])]
      .filter((level) => level.score !== null && level.score !== undefined)
      .sort((a, b) => Number(b.score) - Number(a.score));
    return levels[Math.min(Math.max(rank, 0), Math.max(levels.length - 1, 0))];
  };

  const bulkGradeAttendance = async () => {
    if (!offeringId || bulkGrading) return;
    if (!window.confirm("Chấm lại điểm chuyên cần cho toàn bộ sinh viên có dữ liệu theo rubric R1?")) return;
    setBulkGrading(true);
    try {
      const rubric = await loadAttendanceRubric();
      if (!rubric?.rows?.length) return;

      const attendanceCriterion = rubric.rows.find((item) =>
        item.criteriaId === "C1" || item.criteriaName.toLowerCase().includes("tham dự"),
      ) || rubric.rows[0];
      const attitudeCriterion = rubric.rows.find((item) =>
        item.criteriaId === "C2" || item.criteriaName.toLowerCase().includes("thái độ"),
      ) || rubric.rows[1];

      if (!attendanceCriterion || !attitudeCriterion) {
        toast.error("Rubric R1 phải có tiêu chí tham dự và thái độ trong lớp.");
        return;
      }

      const savedByStudent = new Map((gradebook?.students || []).map((item) => [item.studentId, item]));
      const payload = attendance.flatMap((overview) => {
        if (!overview.totalSessions) return [];
        const attendanceRate = (overview.presentCount / overview.totalSessions) * 100;
        const attendanceRank = attendanceRate >= 90 ? 0 : attendanceRate >= 80 ? 1 : attendanceRate >= 65 ? 2 : 3;
        const warningCount = Math.max(0, Number(warningDrafts[overview.studentId] ?? 0) || 0);
        const attitudeRank = warningCount === 0 ? 0 : warningCount === 1 ? 1 : warningCount <= 3 ? 2 : 3;
        const attendanceLevel = selectLevelByRank(attendanceCriterion, attendanceRank);
        const attitudeLevel = selectLevelByRank(attitudeCriterion, attitudeRank);
        if (!attendanceLevel || !attitudeLevel) return [];

        const attendanceWeight = Number(attendanceCriterion.weight) || 0;
        const attitudeWeight = Number(attitudeCriterion.weight) || 0;
        const totalWeight = attendanceWeight + attitudeWeight;
        if (totalWeight <= 0) return [];
        const score = Math.round((
          (Number(attendanceLevel.score) * attendanceWeight
            + Number(attitudeLevel.score) * attitudeWeight) / totalWeight
        ) * 10) / 10;
        const saved = savedByStudent.get(overview.studentId);
        return [{
          studentId: overview.studentId,
          attendanceScore: score,
          attendanceWarningCount: warningCount,
          assignmentScore: saved?.assignmentScore ?? null,
          examScore: saved?.examScore ?? null,
        }];
      });

      if (!payload.length) {
        toast.warning("Chưa có sinh viên nào đủ dữ liệu để chấm hàng loạt.");
        return;
      }
      const updated = await courseService.updateGradebookScores(offeringId, payload);
      setGradebook(updated);
      setWarningDrafts(Object.fromEntries((updated.students || []).map((student) => [
        student.studentId,
        String(student.attendanceWarningCount ?? 0),
      ])));
      const skipped = roster.length - payload.length;
      toast.success(`Đã chấm hàng loạt ${payload.length} sinh viên${skipped > 0 ? `, bỏ qua ${skipped} sinh viên chưa có dữ liệu` : ""}.`);
    } catch (error) {
      console.error("Không thể chấm hàng loạt:", error);
      toast.error("Không thể chấm hàng loạt điểm chuyên cần.");
    } finally {
      setBulkGrading(false);
    }
  };

  const applyRubricScore = async () => {
    if (!rubricStudent || !attendanceRubric) return;
    if (attendanceRubric.rows.some((criterion) => !selectedRubricLevels[criterion.criteriaId]) || rubricScore === null) {
      toast.warning("Vui lòng chọn mức đánh giá cho tất cả tiêu chí.");
      return;
    }
    if (await saveAttendanceScore(rubricStudent.studentId, rubricScore)) {
      toast.success(`Đã lưu điểm chuyên cần ${rubricStudent.studentId}: ${rubricScore.toFixed(1)}/10.`);
      setRubricStudent(null);
    }
  };

  if (loading) return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Đang tải dữ liệu báo cáo...</div>
    </div>
  );

  const activeCategory = GRADE_CATEGORIES.find((item) => item.key === gradeCategory)!;

  return (
    <div className="space-y-6 p-1">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Báo cáo học phần</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{course?.courseName || "Báo cáo và thống kê"}</h1>
        {course?.courseCode ? <p className="mt-1 text-sm text-slate-500">{course.courseCode}</p> : null}
      </div>

      {section === "grades" ? (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div><h2 className="text-lg font-bold text-slate-900">Bảng điểm học phần</h2><p className="mt-1 text-sm text-slate-500">Chọn một nhóm điểm để xem bảng chi tiết.</p></div>
          <div className="grid gap-3 md:grid-cols-3">
            {GRADE_CATEGORIES.map((item) => (
              <button key={item.key} type="button" onClick={() => setGradeCategory(item.key)} className={`rounded-xl border p-4 text-left transition ${gradeCategory === item.key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}>
                <div className="flex items-center gap-3"><span className={`rounded-lg p-2 ${gradeCategory === item.key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{item.icon}</span><span className="font-semibold text-slate-900">{item.title}</span></div>
                <p className="mt-3 text-sm leading-5 text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div><h3 className="font-semibold text-slate-900">Điểm {activeCategory.title}</h3><p className="text-xs text-slate-500">{roster.length} sinh viên</p></div>
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="max-h-[620px] overflow-auto">
              {gradeCategory === "attendance" ? (
                <table className="min-w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-20 bg-emerald-50"><tr>
                    <th className="sticky left-0 z-30 w-14 border-b border-r border-slate-300 bg-emerald-50 px-3 py-3">STT</th>
                    <th className="sticky left-14 z-30 min-w-32 border-b border-r border-slate-300 bg-emerald-50 px-3 py-3 text-left">MSSV</th>
                    <th className="min-w-52 border-b border-r border-slate-300 px-3 py-3 text-left">Họ và tên</th>
                    {attendanceDates.map((item, index) => <th key={item.sessionId} className="min-w-24 border-b border-r border-slate-300 px-3 py-3">Buổi {index + 1}<span className="block text-xs font-normal text-slate-500">{formatDate(item.attendanceDate)}</span></th>)}
                    <th className="min-w-24 border-b border-r border-slate-300 px-3 py-3">Tỷ lệ</th>
                    <th className="min-w-32 border-b border-r border-slate-300 px-3 py-3">Bị nhắc nhở</th>
                    <th className="min-w-24 border-b border-r border-slate-300 px-3 py-3">Điểm</th>
                    <th className="min-w-40 border-b border-slate-300 px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <span>Chấm</span>
                        <details className="relative text-left">
                          <summary aria-label="Mở menu chấm hàng loạt" title="Chấm hàng loạt" className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-lg border border-emerald-300 bg-white text-sm font-bold normal-case tracking-normal text-emerald-700 hover:bg-emerald-50">▾</summary>
                          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                            <button type="button" onClick={() => void bulkGradeAttendance()} disabled={bulkGrading || attendance.length === 0} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold normal-case tracking-normal text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400">{bulkGrading ? "Đang chấm..." : "Chấm toàn bộ theo rubric R1"}</button>
                          </div>
                        </details>
                      </div>
                    </th>
                  </tr></thead>
                  <tbody>{roster.map((student, index) => {
                    const row = attendanceMap.get(student.studentId);
                    const cells = new Map(row?.attendanceDates?.map((item) => [item.sessionId, item]) || []);
                    const rate = row && row.totalSessions > 0 ? (row.presentCount / row.totalSessions) * 100 : null;
                    return <tr key={student.studentId} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/50">
                      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-2.5 text-center text-slate-500">{index + 1}</td>
                      <td className="sticky left-14 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-2.5 font-mono font-medium">{student.studentId}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 font-medium">{student.fullName}</td>
                      {attendanceDates.map((date) => { const status = cells.get(date.sessionId)?.status; return <td key={date.sessionId} className={`border-b border-r border-slate-200 px-3 py-2.5 text-center font-semibold ${status === "PRESENT" ? "text-emerald-700" : status === "ABSENT" ? "text-rose-600" : "text-slate-400"}`}>{status === "PRESENT" ? "P" : status === "ABSENT" ? "V" : "--"}</td>; })}
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold">{rate === null ? "--" : `${Math.round(rate)}%`}</td>
                      <td className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                        <input type="number" min="0" step="1" inputMode="numeric" aria-label={`Số lần bị nhắc nhở của ${student.studentId}`} value={warningDrafts[student.studentId] ?? "0"} onChange={(event) => { if (/^\d*$/.test(event.target.value)) setWarningDrafts((current) => ({ ...current, [student.studentId]: event.target.value })); }} onBlur={() => void saveWarningCount(student.studentId)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} disabled={savingAttendanceStudent === student.studentId} className="h-9 w-16 rounded-lg border border-slate-300 bg-white px-2 text-center font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100" />
                      </td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold text-emerald-700">{formatScore(gradebook?.students?.find((item) => item.studentId === student.studentId)?.attendanceScore)}</td>
                      <td className="border-b border-slate-200 px-3 py-2.5">
                        <div className="flex items-center justify-center">
                          <button type="button" onClick={() => void openAttendanceRubric(student)} disabled={savingAttendanceStudent === student.studentId} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{savingAttendanceStudent === student.studentId ? "Đang lưu..." : "Chấm"}</button>
                        </div>
                      </td>
                    </tr>;
                  })}</tbody>
                </table>
              ) : selectedAssessments.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center px-6 text-center text-sm text-slate-500">Chưa có đầu điểm {activeCategory.title.toLowerCase()} trong học phần này.</div>
              ) : (
                <table className="min-w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-20 bg-emerald-50"><tr>
                    <th className="sticky left-0 z-30 w-14 border-b border-r border-slate-300 bg-emerald-50 px-3 py-3">STT</th>
                    <th className="sticky left-14 z-30 min-w-32 border-b border-r border-slate-300 bg-emerald-50 px-3 py-3 text-left">MSSV</th>
                    <th className="min-w-52 border-b border-r border-slate-300 px-3 py-3 text-left">Họ và tên</th>
                    {selectedAssessments.map((item) => <th key={item.assessmentId} className="min-w-36 border-b border-r border-slate-300 px-3 py-3">{item.assessmentName}{item.weight ? <span className="block text-xs font-normal text-slate-500">Trọng số {item.weight}%</span> : null}</th>)}
                    <th className="min-w-24 border-b border-slate-300 px-3 py-3">Trung bình</th>
                  </tr></thead>
                  <tbody>{roster.map((student, index) => {
                    const studentScores = selectedAssessments.map((item) => scoreMap.get(`${item.assessmentId}:${student.studentId}`)?.totalScore).filter((value): value is number => value !== null && value !== undefined && Number.isFinite(Number(value)));
                    const average = studentScores.length ? studentScores.reduce((sum, value) => sum + Number(value), 0) / studentScores.length : null;
                    return <tr key={student.studentId} className="odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/50">
                      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-2.5 text-center text-slate-500">{index + 1}</td>
                      <td className="sticky left-14 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-2.5 font-mono font-medium">{student.studentId}</td>
                      <td className="border-b border-r border-slate-200 px-3 py-2.5 font-medium">{student.fullName}</td>
                      {selectedAssessments.map((item) => { const submission = scoreMap.get(`${item.assessmentId}:${student.studentId}`); return <td key={item.assessmentId} className="border-b border-r border-slate-200 px-3 py-2.5 text-center font-semibold">{submission?.totalScore !== null && submission?.totalScore !== undefined ? formatScore(submission.totalScore) : submission?.submitted ? <span className="text-xs font-medium text-amber-600">Chờ chấm</span> : "--"}</td>; })}
                      <td className="border-b border-slate-200 px-3 py-2.5 text-center font-bold text-emerald-700">{formatScore(average)}</td>
                    </tr>;
                  })}</tbody>
                </table>
              )}
            </div>
          </div>
          {gradeCategory === "attendance" ? <div className="space-y-1 text-xs text-slate-500"><p>Quy ước: P = Có mặt, V = Vắng.</p><p>Chấm hàng loạt theo R1: tham dự ≥90% / ≥80% / ≥65% / &lt;65%; thái độ tương ứng 0 / 1 / 2–3 / ≥4 lần bị nhắc nhở.</p></div> : null}
        </section>
      ) : (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-bold text-slate-900">Báo cáo chuẩn đầu ra (OBE)</h2><p className="mt-1 text-sm text-slate-500">Theo dõi mức độ đạt CLO và liên kết dữ liệu CLO–PLO của học phần.</p></div><button type="button" onClick={() => navigate(`/teacher/course/${offeringId}/obe`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Xem chi tiết OBE<ArrowRight className="h-4 w-4" /></button></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Mức đạt OBE", value: `${Math.round(quality.overall)}%`, icon: <BarChart3 className="h-5 w-5" /> },
              { label: "CLO được đo lường", value: String(quality.clos.length), icon: <BookOpenCheck className="h-5 w-5" /> },
              { label: "CLO đạt từ 70%", value: String(quality.achieved), icon: <CheckCircle2 className="h-5 w-5" /> },
              { label: "Sinh viên", value: String(obe?.totalStudents || roster.length), icon: <Users className="h-5 w-5" /> },
            ].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>{item.icon}</div><p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p></div>)}
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-xl border border-slate-200"><div className="border-b border-slate-200 bg-slate-50 px-4 py-3"><h3 className="font-semibold text-slate-900">Mức độ đạt theo CLO</h3></div><div className="divide-y divide-slate-100">
              {quality.clos.length === 0 ? <div className="px-4 py-12 text-center text-sm text-slate-500">Chưa có dữ liệu CLO để thống kê.</div> : quality.clos.map((clo) => { const progress = Number(clo.progressPercent || 0); return <button key={clo.cloId} type="button" onClick={() => navigate(`/teacher/course/${offeringId}/obe/${clo.cloId}`)} className="block w-full px-4 py-4 text-left hover:bg-slate-50"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-900">{clo.cloCode || "CLO"}</p><p className="mt-1 text-sm text-slate-500">{clo.cloDescription || "Chưa có mô tả"}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${progress >= 70 ? "bg-emerald-100 text-emerald-700" : progress >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{Math.round(progress)}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${progress >= 70 ? "bg-emerald-500" : progress >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${clampPercent(progress)}%` }} /></div><p className="mt-2 text-xs text-slate-500">Đạt {clo.passedStudents || 0} · Chưa đạt {clo.failedStudents || 0}</p></button>; })}
            </div></div>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-3"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><GraduationCap className="h-5 w-5" /></span><h3 className="font-semibold text-slate-900">CLO–PLO</h3></div><p className="mt-3 text-sm leading-6 text-slate-500">Kết quả PLO được tổng hợp từ mức đạt CLO và ánh xạ chuẩn đầu ra của chương trình đào tạo.</p><button type="button" onClick={() => navigate(`/teacher/course/${offeringId}/obe`)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">Xem phân tích CLO–PLO<ArrowRight className="h-4 w-4" /></button></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-900">Cảnh báo chất lượng</p><p className="mt-2 text-3xl font-bold text-rose-600">{quality.warning}</p><p className="mt-1 text-sm text-slate-500">CLO có mức đạt dưới 50% cần được xem xét.</p></div>
            </div>
          </div>
        </section>
      )}
      {rubricStudent ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRubricStudent(null); }}>
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Chấm chuyên cần bằng rubric</p><h2 className="mt-1 text-xl font-bold text-slate-900">{attendanceRubric?.name || "Rubric chuyên cần"}</h2><p className="mt-1 text-sm text-slate-500">{rubricStudent.studentId} - {rubricStudent.fullName}</p></div>
            <button type="button" onClick={() => setRubricStudent(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng bảng rubric"><X className="h-5 w-5" /></button>
          </div>
          <div className="overflow-y-auto p-6">
            {loadingRubric ? <div className="flex min-h-56 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />Đang tải rubric chuyên cần...</div>
              : !attendanceRubric?.rows?.length ? <div className="py-14 text-center text-sm text-slate-500">Không tìm thấy rubric chuyên cần R1.</div>
                : <div className="space-y-5">
                  {attendanceRubric.description ? <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{attendanceRubric.description}</p> : null}
                  {attendanceRubric.rows.map((criterion) => <div key={criterion.criteriaId} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-slate-900">{criterion.criteriaName}</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Trọng số {criterion.weight}%</span></div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(criterion.levels || []).map((level) => {
                      const selected = selectedRubricLevels[criterion.criteriaId] === level.levelId;
                      return <button key={level.levelId} type="button" onClick={() => setSelectedRubricLevels((current) => ({ ...current, [criterion.criteriaId]: level.levelId }))} className={`rounded-xl border p-3 text-left transition ${selected ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><span className="font-semibold text-slate-900">{level.levelName}</span><span className="rounded-lg bg-white px-2 py-1 text-sm font-bold text-emerald-700">{Number(level.score ?? 0).toFixed(1)}</span></div>{level.description ? <p className="mt-2 text-xs leading-5 text-slate-500">{level.description}</p> : null}</button>;
                    })}</div>
                  </div>)}
                </div>}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="text-sm text-slate-500">Điểm chuyên cần: </span><span className="text-2xl font-bold text-emerald-700">{rubricScore === null ? "--" : rubricScore.toFixed(1)}</span><span className="text-sm font-semibold text-slate-500"> / 10</span></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setRubricStudent(null)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Hủy</button><button type="button" onClick={() => void applyRubricScore()} disabled={loadingRubric || !attendanceRubric?.rows?.length || savingAttendanceStudent === rubricStudent.studentId} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">{savingAttendanceStudent === rubricStudent.studentId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Lưu điểm</button></div>
          </div>
        </div>
      </div> : null}
    </div>
  );
}

export function TeacherGradebookReport() {
  return <TeacherReportPage section="grades" />;
}

export function TeacherOutcomeReport() {
  return <TeacherReportPage section="outcomes" />;
}

export default TeacherGradebookReport;
