import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  Loader2,
  ShieldAlert,
  TimerReset,
  TriangleAlert,
  Users,
} from "lucide-react";

import { attendanceApi, type AttendanceStudentOverviewResponse } from "@/api/attendanceApi.ts";
import { courseService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart.tsx";

type TeacherAssessmentReportItem = {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string | null;
  endTime?: string | null;
  submittedCount?: number | null;
  pendingCount?: number | null;
};

type TeacherCourseInfo = {
  courseCode?: string;
  courseName?: string;
};

type OBEProgressItem = {
  cloId: string;
  cloCode?: string | null;
  cloDescription?: string | null;
  progressPercent?: number | null;
};

type OBEProgressResponse = {
  clos?: OBEProgressItem[];
  totalStudents?: number;
  overallProgress?: number;
};

type CourseStudentScore = {
  studentId: string;
  fullName: string;
  totalScore?: number | null;
  midtermScore?: number | null;
  finalScore?: number | null;
};

const scoreChartConfig = {
  totalScore: {
    label: "Điểm tổng",
    color: "#10b981",
  },
  midtermScore: {
    label: "Giữa kỳ",
    color: "#0f766e",
  },
  finalScore: {
    label: "Cuối kỳ",
    color: "#f59e0b",
  },
  assignments: {
    label: "Bài tập",
    color: "#14b8a6",
  },
  projects: {
    label: "Project",
    color: "#3b82f6",
  },
  pending: {
    label: "Chờ xử lý",
    color: "#f97316",
  },
  overdue: {
    label: "Quá hạn",
    color: "#ef4444",
  },
} as const;

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function isPastDeadline(value?: string | null) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < Date.now();
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function SectionShell({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        <div>
          <h4 className="text-xl font-bold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ShortcutCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="w-fit rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
      <p className="mt-4 text-base font-bold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
        Mở chi tiết
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

export default function TeacherReport() {
  const { id: offeringId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState<TeacherCourseInfo | null>(null);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceStudentOverviewResponse[]>([]);
  const [assessments, setAssessments] = useState<TeacherAssessmentReportItem[]>([]);
  const [groupCount, setGroupCount] = useState(0);
  const [obeProgress, setObeProgress] = useState<OBEProgressResponse | null>(null);
  const [courseStudents, setCourseStudents] = useState<CourseStudentScore[]>([]);

  useEffect(() => {
    if (!offeringId) return;

    const loadReportData = async () => {
      try {
        setIsLoading(true);
        const [courseResponse, attendanceResponse, assessmentResponse, groupsResponse, obeResponse, studentResponse] =
          await Promise.all([
            courseService.getCourseById(offeringId),
            attendanceApi.getAttendanceOverviewByOffering(offeringId),
            assessmentService.getAssessmentsByOffering(offeringId),
            groupService.getGroupsByOffering(offeringId),
            courseService.getOBEProgress(offeringId),
            courseService.getStudentsByOffering(offeringId),
          ]);

        setCourseInfo(courseResponse || null);
        setAttendanceRows(Array.isArray(attendanceResponse) ? attendanceResponse : []);
        setAssessments(Array.isArray(assessmentResponse) ? assessmentResponse : []);
        setGroupCount(Array.isArray(groupsResponse) ? groupsResponse.length : 0);
        setObeProgress(obeResponse || null);
        setCourseStudents(Array.isArray(studentResponse) ? studentResponse : []);
      } catch (error) {
        console.error("Lỗi khi tải báo cáo học phần:", error);
        setCourseInfo(null);
        setAttendanceRows([]);
        setAssessments([]);
        setGroupCount(0);
        setObeProgress(null);
        setCourseStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadReportData();
  }, [offeringId]);

  const attendanceSummary = useMemo(() => {
    const totalStudents = attendanceRows.length;
    const totalSessions = attendanceRows[0]?.totalSessions || 0;
    const totalPresent = attendanceRows.reduce((sum, row) => sum + row.presentCount, 0);
    const totalPossible = totalStudents * totalSessions;
    const passCount = attendanceRows.filter((row) => row.resultStatus === "PASS").length;

    const sessionsWithManyAbsences = Array.from({ length: totalSessions })
      .map((_, index) => {
        const absentCount = attendanceRows.reduce((sum, row) => {
          const dateItem = row.attendanceDates?.[index];
          return sum + (dateItem?.status === "ABSENT" ? 1 : 0);
        }, 0);
        const attendanceDate = attendanceRows[0]?.attendanceDates?.[index]?.attendanceDate || null;
        return {
          absentCount,
          attendanceDate,
        };
      })
      .filter((item) => item.attendanceDate)
      .sort((first, second) => second.absentCount - first.absentCount)
      .slice(0, 3);

    return {
      totalStudents,
      totalSessions,
      failCount: totalStudents - passCount,
      averageRate: totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0,
      sessionsWithManyAbsences,
    };
  }, [attendanceRows]);

  const assignmentSummary = useMemo(() => {
    const assignmentItems = assessments.filter((item) => {
      const type = (item.assessmentType || "").trim().toLowerCase();
      return type !== "project" && type !== "attendance";
    });

    const pendingCount = assignmentItems.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0);
    const overdueItems = assignmentItems
      .filter((item) => isPastDeadline(item.endTime) && Number(item.pendingCount || 0) > 0)
      .sort((first, second) => Number(second.pendingCount || 0) - Number(first.pendingCount || 0));

    return {
      pendingCount,
      overdueItems,
    };
  }, [assessments]);

  const projectSummary = useMemo(() => {
    const projectItems = assessments.filter(
      (item) => (item.assessmentType || "").trim().toLowerCase() === "project",
    );

    const pendingCount = projectItems.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0);
    const overdueItems = projectItems
      .filter((item) => isPastDeadline(item.endTime) && Number(item.pendingCount || 0) > 0)
      .sort((first, second) => Number(second.pendingCount || 0) - Number(first.pendingCount || 0));

    return {
      total: projectItems.length,
      pendingCount,
      overdueItems,
    };
  }, [assessments]);

  const qualitySummary = useMemo(() => {
    const clos = Array.isArray(obeProgress?.clos) ? obeProgress.clos : [];
    const weakClos = clos
      .filter((item) => Number(item.progressPercent || 0) < 50)
      .sort((first, second) => Number(first.progressPercent || 0) - Number(second.progressPercent || 0));
    const watchClos = clos
      .filter((item) => {
        const progress = Number(item.progressPercent || 0);
        return progress >= 50 && progress < 70;
      })
      .sort((first, second) => Number(first.progressPercent || 0) - Number(second.progressPercent || 0));

    return {
      totalClos: clos.length,
      overallProgress: Number(obeProgress?.overallProgress || 0),
      weakClos,
      watchClos,
    };
  }, [obeProgress]);

  const workloadChartData = useMemo(() => {
    const assignmentItems = assessments.filter((item) => {
      const type = (item.assessmentType || "").trim().toLowerCase();
      return type !== "project" && type !== "attendance";
    });
    const projectItems = assessments.filter(
      (item) => (item.assessmentType || "").trim().toLowerCase() === "project",
    );

    return [
      {
        name: "Bài tập",
        pending: assignmentItems.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0),
        overdue: assignmentItems.filter((item) => isPastDeadline(item.endTime) && Number(item.pendingCount || 0) > 0)
          .length,
      },
      {
        name: "Project",
        pending: projectItems.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0),
        overdue: projectItems.filter((item) => isPastDeadline(item.endTime) && Number(item.pendingCount || 0) > 0)
          .length,
      },
    ];
  }, [assessments]);

  const topStudentScoreData = useMemo(() => {
    return [...courseStudents]
      .filter((student) => student.totalScore !== null && student.totalScore !== undefined)
      .sort((first, second) => Number(second.totalScore || 0) - Number(first.totalScore || 0))
      .slice(0, 8)
      .map((student) => ({
        name: student.fullName?.trim() || student.studentId,
        shortName: (student.fullName?.trim() || student.studentId).split(" ").slice(-2).join(" "),
        totalScore: Number(student.totalScore || 0),
        midtermScore: Number(student.midtermScore || 0),
        finalScore: Number(student.finalScore || 0),
      }));
  }, [courseStudents]);

  const scoreDistributionData = useMemo(() => {
    const initial = {
      "Dưới 5": 0,
      "5 - 6.9": 0,
      "7 - 8.4": 0,
      "8.5 - 10": 0,
    };

    courseStudents.forEach((student) => {
      const score = Number(student.totalScore);
      if (!Number.isFinite(score)) return;
      if (score < 5) initial["Dưới 5"] += 1;
      else if (score < 7) initial["5 - 6.9"] += 1;
      else if (score < 8.5) initial["7 - 8.4"] += 1;
      else initial["8.5 - 10"] += 1;
    });

    return [
      { name: "Dưới 5", value: initial["Dưới 5"], fill: "#ef4444" },
      { name: "5 - 6.9", value: initial["5 - 6.9"], fill: "#f59e0b" },
      { name: "7 - 8.4", value: initial["7 - 8.4"], fill: "#10b981" },
      { name: "8.5 - 10", value: initial["8.5 - 10"], fill: "#0f766e" },
    ].filter((item) => item.value > 0);
  }, [courseStudents]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải báo cáo học phần...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Báo cáo học phần</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {courseInfo?.courseName || "Tổng quan vận hành và chất lượng học tập"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {courseInfo?.courseCode ? `${courseInfo.courseCode} · ` : ""}
              Theo dõi nhanh tình hình chuyên cần, tiến độ xử lý bài tập, project và mức đạt CLO của lớp.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Báo cáo này ưu tiên cho góc nhìn điều hành nhanh: nhìn tổng quan trước, sau đó mở từng khu vực để xem chi tiết.
            </p>
          </div>

          <div className="xl:w-[180px]">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">OBE tổng quan</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {formatPercent(qualitySummary.overallProgress)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Users className="h-5 w-5" />}
          label="Sinh viên"
          value={String(attendanceSummary.totalStudents)}
          hint={`${groupCount} nhóm đang hoạt động`}
        />
        <SummaryCard
          icon={<TimerReset className="h-5 w-5" />}
          label="Tỷ lệ chuyên cần"
          value={formatPercent(attendanceSummary.averageRate)}
          hint={`${attendanceSummary.failCount} sinh viên cần theo dõi`}
        />
        <SummaryCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Bài tập chờ xử lý"
          value={String(assignmentSummary.pendingCount)}
          hint={`${assignmentSummary.overdueItems.length} bài đang quá hạn`}
        />
        <SummaryCard
          icon={<FolderKanban className="h-5 w-5" />}
          label="Project chờ xử lý"
          value={String(projectSummary.pendingCount)}
          hint={`${projectSummary.total} đầu việc project`}
        />
      </div>

      <SectionShell
        icon={<BarChart3 className="h-5 w-5" />}
        title="Biểu đồ báo cáo nhanh"
        description="Bổ sung góc nhìn trực quan về tiến độ xử lý và kết quả học tập của sinh viên trong học phần."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Khối lượng xử lý bài tập và project</p>
                <p className="mt-1 text-sm text-slate-500">
                  Biểu đồ này cho biết số lượt đang chờ xử lý và số đầu việc đã quá hạn.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <ChartContainer className="h-[280px] w-full" config={scoreChartConfig}>
                <BarChart data={workloadChartData} margin={{ left: 8, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="pending" fill="var(--color-pending)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="overdue" fill="var(--color-overdue)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Phân bố điểm tổng sinh viên</p>
                <p className="mt-1 text-sm text-slate-500">
                  Dùng dữ liệu điểm hiện có của lớp để chia theo các nhóm kết quả chính.
                </p>
              </div>
            </div>

            <div className="mt-4">
              {scoreDistributionData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
                  Chưa có dữ liệu điểm tổng để hiển thị biểu đồ.
                </div>
              ) : (
                <ChartContainer className="h-[280px] w-full" config={scoreChartConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    <Pie
                      data={scoreDistributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {scoreDistributionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Điểm tổng của từng sinh viên</p>
              <p className="mt-1 text-sm text-slate-500">
                Hiển thị nhóm sinh viên có điểm tổng cao nhất, kèm theo điểm giữa kỳ và cuối kỳ nếu hệ thống đã lưu.
              </p>
            </div>
          </div>

          <div className="mt-4">
            {topStudentScoreData.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
                Chưa có dữ liệu điểm tổng của sinh viên.
              </div>
            ) : (
              <ChartContainer className="h-[320px] w-full" config={scoreChartConfig}>
                <BarChart data={topStudentScoreData} margin={{ left: 8, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, _item, _index, payload) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span>
                              {name === "totalScore"
                                ? "Điểm tổng"
                                : name === "midtermScore"
                                  ? "Giữa kỳ"
                                  : "Cuối kỳ"}
                            </span>
                            <span className="font-mono font-semibold">{Number(value).toFixed(1)}</span>
                          </div>
                        )}
                        labelFormatter={(_value, payload) => payload?.[0]?.payload?.name as string}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="totalScore" fill="var(--color-totalScore)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="midtermScore" fill="var(--color-midtermScore)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="finalScore" fill="var(--color-finalScore)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        icon={<GraduationCap className="h-5 w-5" />}
        title="Chất lượng học tập"
        description="Tập trung vào mức đạt CLO và những điểm cần drill-down theo rubric, bài tập hoặc nhóm."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Tổng quan OBE</p>
                <p className="mt-1 text-sm text-slate-500">
                  {qualitySummary.totalClos} CLO, {qualitySummary.weakClos.length} CLO cần cảnh báo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/teacher/course/${offeringId}/obe/analytics`)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Biểu đồ
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-200">
              <div
                className={`h-3 rounded-full ${
                  qualitySummary.overallProgress >= 70
                    ? "bg-emerald-500"
                    : qualitySummary.overallProgress >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${Math.max(0, Math.min(qualitySummary.overallProgress, 100))}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tiến độ tổng</p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatPercent(qualitySummary.overallProgress)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CLO yếu</p>
                <p className="mt-2 text-xl font-bold text-rose-600">{qualitySummary.weakClos.length}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CLO cần theo dõi</p>
                <p className="mt-2 text-xl font-bold text-amber-600">{qualitySummary.watchClos.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-900">CLO cần xem kỹ</p>
            </div>

            <div className="mt-4 space-y-3">
              {qualitySummary.weakClos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  Hiện chưa có CLO nào rơi vào vùng cảnh báo.
                </div>
              ) : (
                qualitySummary.weakClos.slice(0, 4).map((item) => (
                  <button
                    key={item.cloId}
                    type="button"
                    onClick={() => navigate(`/teacher/course/${offeringId}/obe/${item.cloId}`)}
                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.cloCode || "CLO"}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.cloDescription || "Chưa có mô tả"}</p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        {formatPercent(Number(item.progressPercent || 0))}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        icon={<BookOpenCheck className="h-5 w-5" />}
        title="Lối tắt hành động"
        description="Khi cần xem danh sách đầy đủ, bằng chứng hoặc drill-down thì đi sang các trang sau."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ShortcutCard
            icon={<TimerReset className="h-5 w-5" />}
            title="Điểm danh"
            description={
              attendanceSummary.sessionsWithManyAbsences.length > 0
                ? `Buổi vắng nhiều nhất: ${attendanceSummary.sessionsWithManyAbsences[0].absentCount} sinh viên.`
                : "Mở bảng điểm danh, ma trận buổi học và danh sách nghi vấn."
            }
            onClick={() => navigate(`/teacher/course/${offeringId}/attendance`)}
          />
          <ShortcutCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Bài tập"
            description={
              assignmentSummary.overdueItems[0]
                ? `${assignmentSummary.overdueItems[0].assessmentName} đang cần xử lý trước.`
                : "Xem danh sách bài tập, tình trạng nộp và chấm bài."
            }
            onClick={() => navigate(`/teacher/course/${offeringId}/assignments`)}
          />
          <ShortcutCard
            icon={<FolderKanban className="h-5 w-5" />}
            title="Nhóm và project"
            description={
              projectSummary.overdueItems[0]
                ? `${projectSummary.overdueItems[0].assessmentName} đang trễ hạn.`
                : "Theo dõi nhóm, project và tiến độ nộp bài."
            }
            onClick={() => navigate(`/teacher/course/${offeringId}/groups`)}
          />
          <ShortcutCard
            icon={<TriangleAlert className="h-5 w-5" />}
            title="OBE và rubric"
            description="Drill-down theo CLO, rubric, bài đánh giá và chất lượng học tập."
            onClick={() => navigate(`/teacher/course/${offeringId}/obe`)}
          />
        </div>
      </SectionShell>
    </div>
  );
}
