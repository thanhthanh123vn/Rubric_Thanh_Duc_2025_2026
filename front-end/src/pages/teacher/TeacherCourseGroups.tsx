import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Loader2,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { courseService } from "@/features/course/courseApi.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import type { GroupResponse, Type } from "@/features/course/student/api/type.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";

interface TeacherProjectAssessment {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string | null;
  description?: string | null;
  endTime?: string | null;
  submittedCount?: number | null;
  pendingCount?: number | null;
}

function formatDate(value?: string | null) {
  if (!value) return "Chua dat han";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Khong hop le";

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  useEffect(() => {
    const fetchData = async () => {
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
          if (!groupData?.length) return null;
          if (prev && groupData.some((group: GroupResponse) => group.id === prev)) return prev;
          return groupData[0].id;
        });
      } catch (error) {
        console.error("Loi khi tai danh sach nhom:", error);
        toast.error("Khong the tai danh sach nhom.");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchData();
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
        console.error("Loi khi tai danh sach project:", error);
        toast.error("Khong the tai danh sach project.");
        setProjectAssessments([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
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

  const totalMembers = useMemo(
    () => groups.reduce((sum, group) => sum + (group.participants?.length || 0), 0),
    [groups],
  );

  const totalSubmittedProjects = useMemo(
    () => projectAssessments.reduce((sum, item) => sum + Number(item.submittedCount || 0), 0),
    [projectAssessments],
  );

  const totalPendingProjects = useMemo(
    () => projectAssessments.reduce((sum, item) => sum + Number(item.pendingCount || 0), 0),
    [projectAssessments],
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Nhom va du an
              </p>
              <h4 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Quan ly nhom va bai project trong hoc phan
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Ben giang vien, task duoc hieu la cac bai tap co loai project. Task noi bo se do nhom truong quan ly ben sinh vien.
              </p>
            </div>
            <Workflow className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="So nhom" value={groups.length} />
            <StatCard label="Thanh vien" value={totalMembers} />
            <StatCard label="Project" value={projectAssessments.length} />
            <StatCard label="Da nop" value={totalSubmittedProjects} />
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tim theo ten nhom, de tai hoac thanh vien..."
          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loadingPage ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm">Dang tai du lieu nhom...</p>
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <h5 className="mt-4 text-lg font-semibold text-slate-900">Chua co nhom nao</h5>
          <p className="mt-2 text-sm text-slate-500">
            Sinh vien trong hoc phan nay chua tao nhom hoac chua tham gia nhom.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4">
              <h5 className="font-semibold text-slate-900">Danh sach nhom</h5>
              <p className="mt-1 text-sm text-slate-500">{filteredGroups.length} nhom dang hien thi</p>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-3">
              {filteredGroups.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Khong tim thay nhom phu hop.
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
                              {group.topic || "Chua cap nhat de tai"}
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
                          Thong tin nhom
                        </p>
                        <h5 className="mt-1 text-xl font-bold text-slate-900">{activeGroup.groupName}</h5>
                        <p className="mt-2 text-sm text-slate-500">
                          {activeGroup.topic || "Chua cap nhat de tai"}
                        </p>
                      </div>
                      <ClipboardList className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoCard
                        icon={<Users className="h-4 w-4 text-emerald-600" />}
                        label="Tong thanh vien"
                        value={`${activeGroup.participants.length} sinh vien`}
                      />
                      <InfoCard
                        icon={<UserRound className="h-4 w-4 text-emerald-600" />}
                        label="Nhom truong"
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
                      <h5 className="font-semibold text-slate-900">Thanh vien nhom</h5>
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
                            {participant.role === "ADMIN" ? "Nhom truong" : "Thanh vien"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-900">Danh sach bai project</h5>
                      <p className="mt-1 text-sm text-slate-500">
                        Day la cac bai tap co loai project cua hoc phan. Task noi bo cua nhom se duoc nhom truong tao ben phia sinh vien.
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Cho cham: {totalPendingProjects}
                    </div>
                  </div>

                  <div className="p-4">
                    {loadingProjects ? (
                      <div className="flex items-center justify-center py-14 text-sm text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                        Dang tai danh sach project...
                      </div>
                    ) : projectAssessments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        Chua co bai tap project nao trong hoc phan nay.
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
                                  {project.description || "Chua co mo ta cho bai project nay."}
                                </p>

                                <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                                  <p>Han nop: {formatDate(project.endTime)}</p>
                                  <p>Da nop: {project.submittedCount || 0}</p>
                                  <p>Cho cham: {project.pendingCount || 0}</p>
                                  <p>Loai: {(project.assessmentType || "project").toUpperCase()}</p>
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
                                  Cham bai
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/teacher/course/${offeringId}/assessment/${project.assessmentId}/grading`)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Mo project
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
                Chon mot nhom de xem chi tiet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
