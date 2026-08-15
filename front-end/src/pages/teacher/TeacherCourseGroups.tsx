import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Loader2,
  Search,
  Shuffle,
  SquarePlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { courseService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import type { GroupResponse, Type } from "@/features/course/student/api/type.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { fetchSubmissionStatuses, summarizeSubmissionStatuses } from "@/api/GradingApi.ts";

interface TeacherProjectAssessment {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string | null;
  description?: string | null;
  endTime?: string | null;
  submittedCount?: number | null;
  pendingCount?: number | null;
}

type ManagementPanel = "students" | "ungrouped" | "create" | "random";

function formatDate(value?: string | null) {
  if (!value) return "Ch\u01b0a \u0111\u1eb7t h\u1ea1n";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Kh\u00f4ng h\u1ee3p l\u1ec7";

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStudentKey(student: Type) {
  return student.id || student.userId || student.studentId;
}

function getStudentName(userId: string, students: Type[]) {
  const student = students.find(
    (item) => item.id === userId || item.studentId === userId || item.userId === userId,
  );

  return student?.fullName || userId;
}

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "N";
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StudentRow({
  student,
  selected = false,
  onClick,
}: {
  student: Type;
  selected?: boolean;
  onClick?: () => void;
}) {
  const key = getStudentKey(student);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
        selected
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
      } ${onClick ? "" : "cursor-default"}`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{student.fullName}</p>
        <p className="mt-1 text-xs text-slate-500">{key}</p>
      </div>
      {selected ? (
        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
          {"\u0110\u00e3 ch\u1ecdn"}
        </span>
      ) : null}
    </button>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label="\u0110\u00f3ng modal"
        className="absolute inset-0 bg-slate-900/45"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default function TeacherCourseGroups() {
  const { id: offeringId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Type[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [projectAssessments, setProjectAssessments] = useState<TeacherProjectAssessment[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ManagementPanel | null>(null);
  const [manualGroupName, setManualGroupName] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [manualSelectedMembers, setManualSelectedMembers] = useState<string[]>([]);
  const [manualLeaderId, setManualLeaderId] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [creatingRandom, setCreatingRandom] = useState(false);
  const [randomGroupSize, setRandomGroupSize] = useState("4");
  const [randomNamePrefix, setRandomNamePrefix] = useState("Nh\u00f3m");

  const loadGroupPageData = async (nextActiveGroupId?: string | null) => {
    if (!offeringId) return;

    setLoadingPage(true);
    try {
      const [studentData, groupData] = await Promise.all([
        courseService.getStudentsByOffering(offeringId),
        groupService.getGroupsByOffering(offeringId),
      ]);

      setStudents(studentData || []);
      setGroups(groupData || []);
      setActiveGroupId((prev) => {
        const preferredId = nextActiveGroupId ?? prev;
        if (!groupData?.length) return null;
        if (preferredId && groupData.some((group: GroupResponse) => group.id === preferredId)) {
          return preferredId;
        }
        return null;
      });
    } catch (error) {
      console.error("L\u1ed7i khi t\u1ea3i danh s\u00e1ch nh\u00f3m:", error);
      toast.error("Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch nh\u00f3m.");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    void loadGroupPageData();
  }, [offeringId]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!offeringId) return;

      setLoadingProjects(true);
      try {
        const data = await assessmentService.getAssessmentsByOffering(offeringId);
        const projects = (Array.isArray(data) ? data : []).filter(
          (item: TeacherProjectAssessment) => (item.assessmentType || "").trim().toLowerCase() === "project",
        );
        const projectsWithAccurateCounts = await Promise.all(
          projects.map(async (project: TeacherProjectAssessment) => {
            try {
              const statuses = await fetchSubmissionStatuses(project.assessmentId);
              return {
                ...project,
                ...summarizeSubmissionStatuses(Array.isArray(statuses) ? statuses : []),
              };
            } catch (error) {
              console.error(`Không thể cập nhật số bài chờ chấm của ${project.assessmentId}:`, error);
              return project;
            }
          }),
        );
        setProjectAssessments(projectsWithAccurateCounts);
      } catch (error) {
        console.error("L\u1ed7i khi t\u1ea3i danh s\u00e1ch project:", error);
        toast.error("Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch project.");
        setProjectAssessments([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    void fetchProjects();
  }, [offeringId]);

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? null;

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return groups;

    return groups.filter((group) => {
      const memberNames = group.participants
        .map((participant) => getStudentName(participant.userId, students))
        .join(" ")
        .toLowerCase();

      return (
        group.groupName.toLowerCase().includes(keyword) ||
        (group.topic || "").toLowerCase().includes(keyword) ||
        memberNames.includes(keyword)
      );
    });
  }, [groups, search, students]);

  const allGroupedStudentIds = useMemo(
    () =>
      new Set(
        groups.flatMap((group) => group.participants.map((participant) => participant.userId)),
      ),
    [groups],
  );

  const ungroupedStudents = useMemo(
    () => students.filter((student) => !allGroupedStudentIds.has(getStudentKey(student))),
    [allGroupedStudentIds, students],
  );

  const totalPendingProjects = useMemo(
    () => projectAssessments.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0),
    [projectAssessments],
  );

  const toggleManualStudent = (studentId: string) => {
    setManualSelectedMembers((prev) => {
      if (prev.includes(studentId)) {
        const next = prev.filter((item) => item !== studentId);
        if (manualLeaderId === studentId) {
          setManualLeaderId(next[0] || "");
        }
        return next;
      }

      const next = [...prev, studentId];
      if (!manualLeaderId) {
        setManualLeaderId(studentId);
      }
      return next;
    });
  };

  const resetCreateForm = () => {
    setManualGroupName("");
    setManualTopic("");
    setManualSelectedMembers([]);
    setManualLeaderId("");
  };

  const closePanel = () => setActivePanel(null);

  const handleCreateGroup = async () => {
    if (!offeringId) return;
    if (!manualGroupName.trim()) {
      toast.error("Nh\u1eadp t\u00ean nh\u00f3m tr\u01b0\u1edbc khi t\u1ea1o.");
      return;
    }
    if (manualSelectedMembers.length === 0) {
      toast.error("Ch\u1ecdn \u00edt nh\u1ea5t m\u1ed9t sinh vi\u00ean.");
      return;
    }
    if (!manualLeaderId || !manualSelectedMembers.includes(manualLeaderId)) {
      toast.error("Ch\u1ecdn tr\u01b0\u1edfng nh\u00f3m h\u1ee3p l\u1ec7.");
      return;
    }

    setCreatingGroup(true);
    try {
      const response = await groupService.createGroup({
        offeringId,
        createdById: manualLeaderId,
        groupName: manualGroupName.trim(),
        topic: manualTopic.trim(),
        memberIds: manualSelectedMembers,
      });

      const createdGroupId = response?.data?.id || null;
      toast.success(response?.message || "\u0110\u00e3 t\u1ea1o nh\u00f3m.");
      resetCreateForm();
      closePanel();
      await loadGroupPageData(createdGroupId);
    } catch (error) {
      console.error("L\u1ed7i khi t\u1ea1o nh\u00f3m:", error);
      toast.error("Kh\u00f4ng th\u1ec3 t\u1ea1o nh\u00f3m.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCreateRandomGroups = async () => {
    if (!offeringId) return;

    const size = Number(randomGroupSize);
    if (!Number.isInteger(size) || size < 1) {
      toast.error("S\u1ed1 l\u01b0\u1ee3ng m\u1ed7i nh\u00f3m ph\u1ea3i t\u1eeb 1 tr\u1edf l\u00ean.");
      return;
    }
    if (ungroupedStudents.length === 0) {
      toast.error("Kh\u00f4ng c\u00f2n sinh vi\u00ean n\u00e0o ch\u01b0a c\u00f3 nh\u00f3m.");
      return;
    }

    const source = [...ungroupedStudents];
    for (let index = source.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [source[index], source[randomIndex]] = [source[randomIndex], source[index]];
    }

    const chunks: Type[][] = [];
    for (let start = 0; start < source.length; start += size) {
      chunks.push(source.slice(start, start + size));
    }

    setCreatingRandom(true);
    try {
      for (let index = 0; index < chunks.length; index += 1) {
        const memberIds = chunks[index].map((student) => getStudentKey(student));
        if (memberIds.length === 0) continue;

        await groupService.createGroup({
          offeringId,
          createdById: memberIds[0],
          groupName: `${randomNamePrefix.trim() || "Nh\u00f3m"} ${groups.length + index + 1}`,
          topic: "",
          memberIds,
        });
      }

      toast.success(`\u0110\u00e3 t\u1ea1o ${chunks.length} nh\u00f3m.`);
      closePanel();
      await loadGroupPageData();
    } catch (error) {
      console.error("L\u1ed7i khi t\u1ea1o nh\u00f3m ng\u1eabu nhi\u00ean:", error);
      toast.error("Kh\u00f4ng th\u1ec3 t\u1ea1o nh\u00f3m ng\u1eabu nhi\u00ean.");
    } finally {
      setCreatingRandom(false);
    }
  };

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-3 sm:p-4 md:p-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 md:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Nhóm &amp; đồ án</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActivePanel("random")}
              className="h-11 rounded-xl border-slate-200 px-4"
            >
              <Shuffle className="h-4 w-4" />
              Chia nhóm ngẫu nhiên
            </Button>
            <Button
              type="button"
              onClick={() => setActivePanel("create")}
              className="h-11 rounded-xl bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <SquarePlus className="h-4 w-4" />
              Tạo nhóm
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50/70 p-4 md:grid-cols-4 md:p-5">
          {[
            {
              label: "Sinh viên",
              value: students.length,
              cardClass: "border-sky-100 bg-sky-50/80",
              valueClass: "text-sky-700",
            },
            {
              label: "Nhóm học tập",
              value: groups.length,
              cardClass: "border-emerald-100 bg-emerald-50/80",
              valueClass: "text-emerald-700",
            },
            {
              label: "Chưa có nhóm",
              value: ungroupedStudents.length,
              cardClass: "border-amber-100 bg-amber-50/80",
              valueClass: "text-amber-700",
            },
            {
              label: "Bài chờ chấm",
              value: totalPendingProjects,
              cardClass: "border-violet-100 bg-violet-50/80",
              valueClass: "text-violet-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border px-4 py-4 shadow-sm md:px-5 ${item.cardClass}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className={`mt-2 text-2xl font-bold md:text-3xl ${item.valueClass}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên nhóm, đề tài hoặc thành viên..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setActivePanel("students")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tất cả sinh viên
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("ungrouped")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Chưa có nhóm ({ungroupedStudents.length})
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-5">
        <section className="order-2 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Danh sách nhóm</h2>
              <p className="mt-1 text-sm text-slate-500">{filteredGroups.length} nhóm trong học phần</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{groups.length} nhóm</span>
          </div>

          <div className="p-4 md:p-5">
            {loadingPage ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                Đang tải dữ liệu nhóm...
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="font-semibold text-slate-700">Chưa tìm thấy nhóm phù hợp</p>
                <p className="mt-1 text-sm text-slate-500">Tạo nhóm mới hoặc thử một từ khóa khác.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredGroups.map((group) => {
                  const leaderId = group.participants.find((participant) => participant.role === "ADMIN")?.userId || group.createdById;
                  const leaderName = getStudentName(leaderId, students);

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroupId(group.id)}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                            {getInitials(group.groupName)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">{group.groupName}</h3>
                            <p className="mt-0.5 truncate text-xs text-slate-500">Trưởng nhóm: {leaderName}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                      </div>

                      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                        {group.topic || "Chưa cập nhật đề tài"}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex -space-x-2">
                          {group.participants.slice(0, 4).map((participant) => (
                            <span
                              key={participant.id}
                              title={getStudentName(participant.userId, students)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600"
                            >
                              {getInitials(getStudentName(participant.userId, students))}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{group.participants.length} thành viên</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="order-1 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">Đồ án học phần</h2>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{totalPendingProjects} chờ chấm</span>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {loadingProjects ? (
              <div className="flex min-h-32 items-center justify-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                Đang tải đồ án...
              </div>
            ) : projectAssessments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                Chưa có đồ án nào trong học phần.
              </div>
            ) : (
              projectAssessments.map((project) => {
                const expanded = expandedProjectId === project.assessmentId;

                return (
                  <article
                    key={project.assessmentId}
                    className={`overflow-hidden rounded-2xl border transition ${
                      expanded ? "border-violet-200 bg-violet-50/30" : "border-slate-200 bg-white hover:border-violet-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedProjectId(expanded ? null : project.assessmentId)}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <h3 className="truncate text-sm font-bold text-slate-900 md:text-base">{project.assessmentName}</h3>
                        <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase text-violet-700">Project</span>
                      </div>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180 text-violet-600" : ""}`} />
                    </button>

                    {expanded ? (
                      <div className="border-t border-violet-100 bg-white px-4 py-4">
                        <p className="text-sm leading-6 text-slate-600">{project.description || "Chưa có mô tả."}</p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          Hạn nộp: {formatDate(project.endTime)}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <div className="grid grid-cols-2 gap-2 sm:w-72">
                            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Đã nộp</p>
                              <p className="mt-1 text-lg font-bold text-slate-900">{project.submittedCount || 0}</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Chờ chấm</p>
                              <p className="mt-1 text-lg font-bold text-amber-700">{project.pendingCount || 0}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/course/${offeringId}/assessment/${project.assessmentId}/grading`)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Mở trang chấm bài
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {activeGroup ? (
        <ModalShell
          title={activeGroup.groupName}
          description={activeGroup.topic || "Chưa cập nhật đề tài cho nhóm."}
          onClose={() => setActiveGroupId(null)}
        >
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              <InfoCard
                icon={<Users className="h-4 w-4 text-emerald-600" />}
                label="Thành viên"
                value={`${activeGroup.participants.length}`}
              />
              <InfoCard
                icon={<UserRound className="h-4 w-4 text-emerald-600" />}
                label="Trưởng nhóm"
                value={getStudentName(
                  activeGroup.participants.find((participant) => participant.role === "ADMIN")?.userId || activeGroup.createdById,
                  students,
                )}
              />
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ClipboardList className="h-4 w-4 text-emerald-600" />
                  Đề tài
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activeGroup.topic || "Chưa cập nhật đề tài"}</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Danh sách thành viên</h4>
                <span className="text-xs font-semibold text-slate-500">{activeGroup.participants.length} sinh viên</span>
              </div>
              <div className="space-y-2">
                {activeGroup.participants.map((participant) => {
                  const name = getStudentName(participant.userId, students);
                  return (
                    <div key={participant.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{getInitials(name)}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{participant.userId}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${participant.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {participant.role === "ADMIN" ? "Trưởng nhóm" : "Thành viên"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {activePanel === "students" ? (
        <ModalShell
          title={"Sinh vi\u00ean"}
          description={"To\u00e0n b\u1ed9 sinh vi\u00ean trong h\u1ecdc ph\u1ea7n."}
          onClose={closePanel}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {students.map((student) => (
              <StudentRow key={getStudentKey(student)} student={student} />
            ))}
          </div>
        </ModalShell>
      ) : null}

      {activePanel === "ungrouped" ? (
        <ModalShell
          title={"Ch\u01b0a c\u00f3 nh\u00f3m"}
          description={"Sinh vi\u00ean c\u00f3 th\u1ec3 x\u1ebfp v\u00e0o nh\u00f3m m\u1edbi."}
          onClose={closePanel}
        >
          {ungroupedStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              {"T\u1ea5t c\u1ea3 sinh vi\u00ean \u0111\u00e3 c\u00f3 nh\u00f3m."}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {ungroupedStudents.map((student) => (
                <StudentRow key={getStudentKey(student)} student={student} />
              ))}
            </div>
          )}
        </ModalShell>
      ) : null}

      {activePanel === "create" ? (
        <ModalShell
          title={"T\u1ea1o nh\u00f3m"}
          description={"Ch\u1ecdn th\u00e0nh vi\u00ean v\u00e0 tr\u01b0\u1edfng nh\u00f3m."}
          onClose={closePanel}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{"T\u00ean nh\u00f3m"}</label>
                <input
                  type="text"
                  value={manualGroupName}
                  onChange={(event) => setManualGroupName(event.target.value)}
                  placeholder={"VD: Nh\u00f3m 1"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{"\u0110\u1ec1 t\u00e0i"}</label>
                <textarea
                  value={manualTopic}
                  onChange={(event) => setManualTopic(event.target.value)}
                  rows={3}
                  placeholder={"Nh\u1eadp \u0111\u1ec1 t\u00e0i n\u1ebfu c\u00f3"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{"Tr\u01b0\u1edfng nh\u00f3m"}</label>
                <select
                  value={manualLeaderId}
                  onChange={(event) => setManualLeaderId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{"Ch\u1ecdn tr\u01b0\u1edfng nh\u00f3m"}</option>
                  {manualSelectedMembers.map((studentId) => (
                    <option key={studentId} value={studentId}>
                      {getStudentName(studentId, students)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {"\u0110\u00e3 ch\u1ecdn"} {manualSelectedMembers.length} {"sinh vi\u00ean"}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl" onClick={closePanel}>
                  {"\u0110\u00f3ng"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={creatingGroup}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <SquarePlus className="h-4 w-4" />}
                  {"T\u1ea1o nh\u00f3m"}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">{"Sinh vi\u00ean ch\u01b0a c\u00f3 nh\u00f3m"}</p>
              {ungroupedStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  {"Kh\u00f4ng c\u00f2n sinh vi\u00ean n\u00e0o \u0111\u1ec3 th\u00eam."}
                </div>
              ) : (
                <div className="grid gap-3">
                  {ungroupedStudents.map((student) => {
                    const studentId = getStudentKey(student);
                    return (
                      <StudentRow
                        key={studentId}
                        student={student}
                        selected={manualSelectedMembers.includes(studentId)}
                        onClick={() => toggleManualStudent(studentId)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ModalShell>
      ) : null}

      {activePanel === "random" ? (
        <ModalShell
          title={"T\u1ea1o random"}
          description={"Chia sinh vi\u00ean ch\u01b0a c\u00f3 nh\u00f3m theo s\u1ed1 l\u01b0\u1ee3ng b\u1ea1n ch\u1ecdn."}
          onClose={closePanel}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{"T\u00ean nh\u00f3m"}</label>
              <input
                type="text"
                value={randomNamePrefix}
                onChange={(event) => setRandomNamePrefix(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{"M\u1ed7i nh\u00f3m"}</label>
              <input
                type="number"
                min="1"
                value={randomGroupSize}
                onChange={(event) => setRandomGroupSize(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{"Ch\u01b0a c\u00f3 nh\u00f3m"}</p>
              <p className="mt-2 text-base font-bold text-slate-900">{ungroupedStudents.length}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button type="button" variant="outline" className="rounded-xl" onClick={closePanel}>
              {"\u0110\u00f3ng"}
            </Button>
            <Button
              type="button"
              onClick={handleCreateRandomGroups}
              disabled={creatingRandom || ungroupedStudents.length === 0}
              className="rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              {creatingRandom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
              {"T\u1ea1o random"}
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
