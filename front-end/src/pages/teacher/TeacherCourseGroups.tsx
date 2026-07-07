import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Loader2,
  Shuffle,
  SquarePlus,
  UserRound,
  UserSearch,
  Users,
  UsersRound,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { courseService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import type { GroupResponse, Type } from "@/features/course/student/api/type.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";

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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
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

function ActionIconButton({
  icon,
  label,
  onClick,
  count,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  count?: number | string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-50 p-2 text-emerald-600">{icon}</div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
      </div>
      {count !== undefined ? (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {count}
        </span>
      ) : null}
    </button>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {"\u0110\u00f3ng"}
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
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
        return groupData[0].id;
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
        setProjectAssessments(projects);
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
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {"Nh\u00f3m v\u00e0 d\u1ef1 \u00e1n"}
              </p>
              <h4 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                {"Qu\u1ea3n l\u00fd nh\u00f3m h\u1ecdc ph\u1ea7n"}
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                {"Xem nh\u00f3m, sinh vi\u00ean v\u00e0 t\u1ea1o nh\u00f3m nhanh."}
              </p>
            </div>
            <Workflow className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-[280px]">
            <StatCard label={"S\u1ed1 nh\u00f3m"} value={groups.length} />
            <StatCard label="Project" value={projectAssessments.length} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <ActionIconButton
            icon={<UsersRound className="h-5 w-5" />}
            label={"Sinh vi\u00ean"}
            count={students.length}
            onClick={() => setActivePanel("students")}
          />
          <ActionIconButton
            icon={<UserSearch className="h-5 w-5" />}
            label={"Ch\u01b0a c\u00f3 nh\u00f3m"}
            count={ungroupedStudents.length}
            onClick={() => setActivePanel("ungrouped")}
          />
          <ActionIconButton
            icon={<SquarePlus className="h-5 w-5" />}
            label={"T\u1ea1o nh\u00f3m"}
            onClick={() => setActivePanel("create")}
          />
          <ActionIconButton
            icon={<Shuffle className="h-5 w-5" />}
            label="Random"
            onClick={() => setActivePanel("random")}
          />
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={"T\u00ecm t\u00ean nh\u00f3m, \u0111\u1ec1 t\u00e0i, th\u00e0nh vi\u00ean..."}
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loadingPage ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm">{"\u0110ang t\u1ea3i d\u1eef li\u1ec7u nh\u00f3m..."}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4">
              <h5 className="font-semibold text-slate-900">{"Danh s\u00e1ch nh\u00f3m"}</h5>
              <p className="mt-1 text-sm text-slate-500">{filteredGroups.length} {"nh\u00f3m"}</p>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-3">
              {filteredGroups.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  {"Ch\u01b0a c\u00f3 nh\u00f3m n\u00e0o. C\u00f3 th\u1ec3 t\u1ea1o nh\u00f3m m\u1edbi ho\u1eb7c random."}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGroups.map((group) => {
                    const selected = activeGroupId === group.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveGroupId(group.id)}
                        className={`block w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-emerald-300 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{group.groupName}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {group.topic || "Ch\u01b0a c\u1eadp nh\u1eadt \u0111\u1ec1 t\u00e0i"}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {group.participants.length} TV
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {activeGroup ? (
              <>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                          {"Th\u00f4ng tin nh\u00f3m"}
                        </p>
                        <h5 className="mt-1 text-xl font-bold text-slate-900">{activeGroup.groupName}</h5>
                        <p className="mt-2 text-sm text-slate-500">
                          {activeGroup.topic || "Ch\u01b0a c\u1eadp nh\u1eadt \u0111\u1ec1 t\u00e0i"}
                        </p>
                      </div>
                      <ClipboardList className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoCard
                        icon={<Users className="h-4 w-4 text-emerald-600" />}
                        label={"Th\u00e0nh vi\u00ean"}
                        value={`${activeGroup.participants.length}`}
                      />
                      <InfoCard
                        icon={<UserRound className="h-4 w-4 text-emerald-600" />}
                        label={"Tr\u01b0\u1edfng nh\u00f3m"}
                        value={
                          getStudentName(
                            activeGroup.participants.find((participant) => participant.role === "ADMIN")?.userId ||
                              activeGroup.createdById,
                            students,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-emerald-600" />
                      <h5 className="font-semibold text-slate-900">{"Th\u00e0nh vi\u00ean nh\u00f3m"}</h5>
                    </div>

                    <div className="mt-4 space-y-3">
                      {activeGroup.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {getStudentName(participant.userId, students)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{participant.userId}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              participant.role === "ADMIN"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {participant.role === "ADMIN" ? "Tr\u01b0\u1edfng nh\u00f3m" : "Th\u00e0nh vi\u00ean"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-900">Project</h5>
                      <p className="mt-1 text-sm text-slate-500">{"Danh s\u00e1ch b\u00e0i project c\u1ee7a h\u1ecdc ph\u1ea7n."}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {"Ch\u1edd ch\u1ea5m"}: {totalPendingProjects}
                    </div>
                  </div>

                  <div className="p-4">
                    {loadingProjects ? (
                      <div className="flex items-center justify-center py-14 text-sm text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                        {"\u0110ang t\u1ea3i danh s\u00e1ch project..."}
                      </div>
                    ) : projectAssessments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        {"Ch\u01b0a c\u00f3 b\u00e0i t\u1eadp project n\u00e0o."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projectAssessments.map((project) => (
                          <div
                            key={project.assessmentId}
                            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h6 className="text-base font-semibold text-slate-900">{project.assessmentName}</h6>
                                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                    Project
                                  </span>
                                </div>

                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                  {project.description || "Ch\u01b0a c\u00f3 m\u00f4 t\u1ea3."}
                                </p>

                                <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                                  <p>{"H\u1ea1n n\u1ed9p"}: {formatDate(project.endTime)}</p>
                                  <p>{"\u0110\u00e3 n\u1ed9p"}: {project.submittedCount || 0}</p>
                                  <p>{"Ch\u1edd ch\u1ea5m"}: {project.pendingCount || 0}</p>
                                  <p>{"Lo\u1ea1i"}: {(project.assessmentType || "project").toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row lg:w-[220px] lg:flex-col">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/teacher/course/${offeringId}/assessment/${project.assessmentId}/grading`)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  {"Ch\u1ea5m b\u00e0i"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/teacher/course/${offeringId}/assessment/${project.assessmentId}/grading`)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  {"M\u1edf project"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                {"Ch\u01b0a c\u00f3 nh\u00f3m n\u00e0o \u0111\u01b0\u1ee3c ch\u1ecdn."}
              </div>
            )}
          </div>
        </div>
      )}

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
