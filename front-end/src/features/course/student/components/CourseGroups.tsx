import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  FolderKanban,
  Link2,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  SquarePen,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button.tsx";
import { courseApi } from "@/services/axiosConfig.ts";
import { courseService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import type {
  GroupResponse,
  GroupTaskResponse,
  MessageData,
  Type,
  UpdateTaskStatusRequest,
} from "@/features/course/student/api/type.ts";
import type { Assessment } from "@/features/course/student/assignmentSlice.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";

type ChatMessage = MessageData & {
  conversationId?: string;
  createdAt?: string;
};

function getStudentKey(student: Type) {
  return student.id || student.userId || student.studentId;
}

function getStudentName(userId: string, students: Type[]) {
  const student = students.find(
    (item) => item.id === userId || item.studentId === userId || item.userId === userId,
  );

  return student?.fullName || userId;
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAssessmentType(item: Assessment) {
  return (item.assessmentType || "").trim().toLowerCase();
}

function isProjectAssessment(item: Assessment) {
  return getAssessmentType(item) === "project";
}

function getActiveGroupStorageKey(offeringId?: string) {
  return offeringId ? `student-course-group:${offeringId}` : null;
}

function getTaskStatusLabel(status?: string | null) {
  if (status === "COMPLETED") return "Ho\u00e0n th\u00e0nh";
  if (status === "IN_PROGRESS") return "\u0110ang l\u00e0m";
  return "C\u1ea7n l\u00e0m";
}

function getTaskStatusClass(status?: string | null) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

function normalizeDeadlineValue(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeOptionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function getProjectStatus(item: Assessment) {
  if (item.calculatedScore !== null) return "\u0110\u00e3 ch\u1ea5m";
  if (item.submissionId) return "\u0110\u00e3 n\u1ed9p";
  return "Ch\u01b0a n\u1ed9p";
}

function getProjectStatusClass(item: Assessment) {
  if (item.calculatedScore !== null) return "bg-emerald-100 text-emerald-700";
  if (item.submissionId) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  widthClass = "max-w-5xl",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="\u0110\u00f3ng"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className={`relative z-10 flex max-h-[90vh] w-full ${widthClass} flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl`}>
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              {"\u0110\u00f3ng"}
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function MemberPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "leader";
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone === "leader" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

function Banner() {
  return (
    <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow-sm">
      <h2 className="text-2xl font-semibold">{"Nh\u00f3m c\u1ee7a t\u00f4i"}</h2>
      <p className="mt-1 text-sm text-emerald-50">
        {"Theo d\u00f5i nh\u00f3m, project, trao \u0111\u1ed5i v\u00e0 c\u00f4ng vi\u1ec7c trong m\u1ed9t m\u00e0n h\u00ecnh."}
      </p>
    </div>
  );
}

function GroupInfoCard({
  group,
  students,
  currentUserId,
  onGroupUpdated,
}: {
  group: GroupResponse;
  students: Type[];
  currentUserId: string;
  onGroupUpdated: (updatedGroup: GroupResponse) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNewMember, setSelectedNewMember] = useState("");
  const [showAllMembers, setShowAllMembers] = useState(false);

  const currentUserRole = group.participants.find((participant) => participant.userId === currentUserId)?.role;
  const isAdmin = currentUserRole === "ADMIN";
  const availableStudents = students.filter(
    (student) =>
      !group.participants.some(
        (participant) => participant.userId === student.id || participant.userId === student.studentId || participant.userId === student.userId,
      ),
  );

  const filteredStudents = availableStudents.filter((student) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;
    return (
      student.fullName.toLowerCase().includes(keyword) ||
      (student.studentId || "").toLowerCase().includes(keyword)
    );
  });

  const leaderId =
    group.participants.find((participant) => participant.role === "ADMIN")?.userId || group.createdById;

  const visibleMembers = showAllMembers ? group.participants : group.participants.slice(0, 5);

  const handleAddMember = async () => {
    if (!selectedNewMember) return;

    try {
      const updatedGroup = await groupService.addMember(group.id, selectedNewMember);
      setIsAdding(false);
      setSearchTerm("");
      setSelectedNewMember("");
      onGroupUpdated(updatedGroup);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 th\u00eam th\u00e0nh vi\u00ean.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("X\u00f3a th\u00e0nh vi\u00ean n\u00e0y kh\u1ecfi nh\u00f3m?")) return;

    try {
      const updatedGroup = await groupService.removeMember(group.id, userId);
      onGroupUpdated(updatedGroup);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 x\u00f3a th\u00e0nh vi\u00ean.");
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const updatedGroup = await groupService.changeRole(group.id, userId, role);
      onGroupUpdated(updatedGroup);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt quy\u1ec1n.");
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            {"Th\u00f4ng tin nh\u00f3m"}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">{group.groupName}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {group.topic || "Ch\u01b0a c\u1eadp nh\u1eadt \u0111\u1ec1 t\u00e0i"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[280px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{"Th\u00e0nh vi\u00ean"}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{group.participants.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{"Tr\u01b0\u1edfng nh\u00f3m"}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{getStudentName(leaderId, students)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-900">{"Danh s\u00e1ch th\u00e0nh vi\u00ean"}</h4>
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsAdding((prev) => !prev)}
            >
              <UserPlus className="h-4 w-4" />
              {isAdding ? "Thu g\u1ecdn" : "Th\u00eam th\u00e0nh vi\u00ean"}
            </Button>
          ) : null}
        </div>

        {isAdding && isAdmin ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <select
                value={selectedNewMember}
                onChange={(event) => setSelectedNewMember(event.target.value)}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{"Ch\u1ecdn sinh vi\u00ean"}</option>
                {filteredStudents.map((student) => {
                  const value = getStudentKey(student);
                  return (
                    <option key={value} value={value}>
                      {student.fullName} - {student.studentId || value}
                    </option>
                  );
                })}
              </select>
              <Button type="button" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={handleAddMember}>
                {"Th\u00eam"}
              </Button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={"T\u00ecm sinh vi\u00ean theo t\u00ean ho\u1eb7c MSSV..."}
              className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ) : null}

        <div className="grid gap-3">
          {visibleMembers.map((participant) => {
            const isLeader = participant.role === "ADMIN";
            const isMe = participant.userId === currentUserId;
            return (
              <div
                key={participant.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {getStudentName(participant.userId, students)}
                    {isMe ? <span className="ml-2 text-xs font-medium text-slate-400">({"B\u1ea1n"})</span> : null}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{participant.userId}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <MemberPill label={isLeader ? "Tr\u01b0\u1edfng nh\u00f3m" : "Th\u00e0nh vi\u00ean"} tone={isLeader ? "leader" : "default"} />
                  {isAdmin && !isMe ? (
                    <>
                      <select
                        value={participant.role}
                        onChange={(event) => handleChangeRole(participant.userId, event.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(participant.userId)}
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        {"X\u00f3a"}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {group.participants.length > 5 ? (
          <button
            type="button"
            onClick={() => setShowAllMembers((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {showAllMembers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAllMembers
              ? "Thu g\u1ecdn"
              : `Xem th\u00eam ${group.participants.length - 5} th\u00e0nh vi\u00ean`}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ProjectSection({
  projects,
  currentUserId,
  onOpenProject,
}: {
  projects: Assessment[];
  currentUserId: string;
  onOpenProject: (projectId: string) => void;
}) {
  const submittedProjects = useMemo(
    () => projects.filter((project) => Boolean(project.submissionId)),
    [projects],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-emerald-600" />
          <h4 className="text-base font-semibold text-slate-900">{"Project \u0111\u00e3 n\u1ed9p"}</h4>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {"C\u00e1c b\u00e0i project nh\u00f3m b\u1ea1n \u0111\u00e3 g\u1eedi trong h\u1ecdc ph\u1ea7n."}
        </p>

        <div className="mt-4 space-y-3">
          {submittedProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              {"Ch\u01b0a c\u00f3 project n\u00e0o \u0111\u00e3 n\u1ed9p."}
            </div>
          ) : (
            submittedProjects.map((project) => (
              <button
                key={project.assessmentId}
                type="button"
                onClick={() => onOpenProject(project.assessmentId)}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{project.assessmentName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {"N\u1ed9p l\u00fac"}: {formatDateTime(project.submissionAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getProjectStatusClass(project)}`}>
                    {getProjectStatus(project)}
                  </span>
                </div>
                {project.calculatedScore !== null ? (
                  <p className="mt-3 text-sm font-medium text-emerald-700">
                    {"\u0110i\u1ec3m"}: {project.calculatedScore}
                  </p>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <SquarePen className="h-5 w-5 text-emerald-600" />
          <h4 className="text-base font-semibold text-slate-900">{"B\u00e0i t\u1eadp project"}</h4>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {"Danh s\u00e1ch project c\u1ea7n theo d\u00f5i trong nh\u00f3m h\u1ecdc ph\u1ea7n n\u00e0y."}
        </p>

        <div className="mt-4 space-y-3">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              {"Ch\u01b0a c\u00f3 b\u00e0i t\u1eadp project."}
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.assessmentId} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{project.assessmentName}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span>
                        {"H\u1ea1n n\u1ed9p"}: {formatDateTime(project.endTime)}
                      </span>
                      <span>
                        {"T\u1ef7 tr\u1ecdng"}: {project.weight}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getProjectStatusClass(project)}`}>
                      {getProjectStatus(project)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => onOpenProject(project.assessmentId)}
                    >
                      {"Xem"}
                    </Button>
                  </div>
                </div>
                {project.lecturerComment ? (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {"Nh\u1eadn x\u00e9t"}: {project.lecturerComment}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPanel({
  conversationId,
  currentUserId,
  students,
  onClose,
}: {
  conversationId: string;
  currentUserId: string;
  students: Type[];
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams<{ id: string }>();
  const offeringId = id ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchHistory = async () => {
      try {
        const response = await courseApi.get(`/chat/conversation/${conversationId}/history`);
        setMessages(response.data || []);
      } catch (error) {
        console.error("Kh\u00f4ng th\u1ec3 t\u1ea3i l\u1ecbch s\u1eed chat:", error);
      }
    };

    void fetchHistory();

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8082/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat/${conversationId}`, (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, receivedMessage]);
          } catch (error) {
            console.error("L\u1ed7i parse tin nh\u1eafn:", error);
          }
        });

        client.subscribe(`/topic/chat/${conversationId}/typing`, (message) => {
          try {
            const event = JSON.parse(message.body);
            if (event.senderId !== currentUserId) {
              setTypingUsers((prev) => {
                if (event.isTyping && !prev.includes(event.senderId)) return [...prev, event.senderId];
                if (!event.isTyping) return prev.filter((id) => id !== event.senderId);
                return prev;
              });
            }
          } catch (error) {
            console.error("L\u1ed7i typing:", error);
          }
        });
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      client.deactivate();
    };
  }, [conversationId, currentUserId]);

  const publishTyping = (isTyping: boolean) => {
    if (!stompClientRef.current?.connected) return;

    stompClientRef.current.publish({
      destination: `/app/chat/${conversationId}/typing`,
      body: JSON.stringify({ senderId: currentUserId, isTyping }),
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    publishTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => publishTyping(false), 1200);
  };

  const handleSend = () => {
    if (!input.trim() || !stompClientRef.current?.connected) return;

    stompClientRef.current.publish({
      destination: `/app/chat/${conversationId}/sendMessage`,
      body: JSON.stringify({
        senderId: currentUserId,
        content: input.trim(),
        conversationId,
        offeringId,
      }),
    });

    setInput("");
    publishTyping(false);
  };

  return (
    <ModalShell
      title={"Th\u1ea3o lu\u1eadn nh\u00f3m"}
      subtitle={"Trao \u0111\u1ed5i nhanh v\u1edbi th\u00e0nh vi\u00ean trong nh\u00f3m."}
      onClose={onClose}
      widthClass="max-w-4xl"
    >
      <div className="flex h-[65vh] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-900">{"Khung chat nh\u00f3m"}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              {"Ch\u01b0a c\u00f3 tin nh\u1eafn. H\u00e3y b\u1eaft \u0111\u1ea7u th\u1ea3o lu\u1eadn."}
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={`${message.messageId || "message"}-${index}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                      isMine ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isMine ? "text-emerald-50" : "text-slate-500"}`}>
                      {isMine ? "B\u1ea1n" : getStudentName(message.senderId, students)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                    {message.createdAt ? (
                      <p className={`mt-2 text-[11px] ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                        {formatDateTime(message.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
          {typingUsers.length > 0 ? (
            <p className="text-xs italic text-emerald-600">
              {typingUsers.map((userId) => getStudentName(userId, students)).join(", ")} {"\u0111ang nh\u1eadp tin nh\u1eafn..."}
            </p>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              placeholder={"Nh\u1eadp tin nh\u1eafn..."}
              className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button type="button" className="rounded-full bg-emerald-600 px-5 hover:bg-emerald-700" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function TaskPanel({
  group,
  students,
  currentUserId,
  isAdmin,
  onClose,
}: {
  group: GroupResponse;
  students: Type[];
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<GroupTaskResponse[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [completionDrafts, setCompletionDrafts] = useState<
    Record<string, { resultNote: string; resultLink: string; file: File | null }>
  >({});
  const [completionOpenTaskId, setCompletionOpenTaskId] = useState<string | null>(null);
  const [previewTask, setPreviewTask] = useState<GroupTaskResponse | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    assignToGroup: false,
    deadline: "",
  });

  const refreshTasks = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoadingTasks(true);
      }

      const data = await groupService.getTasks(group.id);
      setTasks(data || []);
      return data || [];
    } catch (error) {
      console.error("L\u1ed7i t\u1ea3i task:", error);
      if (showLoading) {
        setTasks([]);
      }
      throw error;
    } finally {
      if (showLoading) {
        setLoadingTasks(false);
      }
    }
  };

  useEffect(() => {
    void refreshTasks(true);
  }, [group.id]);

  const getAssigneeName = (userId: string | null) => {
    if (!userId) return "--";
    const student = students.find((item) => item.id === userId || item.studentId === userId || item.userId === userId);
    return student?.fullName || userId;
  };

  const openCompletionForm = (task: GroupTaskResponse) => {
    setCompletionOpenTaskId(task.id);
    setCompletionDrafts((prev) => ({
      ...prev,
      [task.id]: {
        resultNote: task.resultNote || "",
        resultLink: task.resultLink || "",
        file: null,
      },
    }));
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert("Vui l\u00f2ng nh\u1eadp t\u00ean c\u00f4ng vi\u1ec7c.");
      return;
    }
    if (!newTask.assignToGroup && !newTask.assigneeId) {
      alert("Vui l\u00f2ng ch\u1ecdn ng\u01b0\u1eddi nh\u1eadn.");
      return;
    }

    try {
      await groupService.createTask({
        groupId: group.id,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        assigneeId: newTask.assignToGroup ? "__GROUP__" : newTask.assigneeId,
        assignToGroup: newTask.assignToGroup,
        deadline: normalizeDeadlineValue(newTask.deadline),
      });

      await refreshTasks();
      setIsCreating(false);
      setNewTask({
        title: "",
        description: "",
        assigneeId: "",
        assignToGroup: false,
        deadline: "",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kh\u00f4ng th\u1ec3 t\u1ea1o c\u00f4ng vi\u1ec7c.";
      alert(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("X\u00f3a c\u00f4ng vi\u1ec7c n\u00e0y?")) return;

    try {
      await groupService.deleteTask(taskId);
      await refreshTasks();
    } catch (error) {
      alert("Kh\u00f4ng th\u1ec3 x\u00f3a task.");
    }
  };

  const handleStatusChange = async (taskId: string, payload: UpdateTaskStatusRequest) => {
    try {
      setSubmittingTaskId(taskId);
      await groupService.updateTaskStatus(taskId, payload);
      await refreshTasks();
      if (payload.status === "COMPLETED") {
        setCompletionOpenTaskId(null);
        setCompletionDrafts((prev) => ({
          ...prev,
          [taskId]: { resultNote: "", resultLink: "", file: null },
        }));
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i.";
      alert(message);
    } finally {
      setSubmittingTaskId(null);
    }
  };

  return (
    <>
      <ModalShell
        title={"C\u00f4ng vi\u1ec7c nh\u00f3m"}
        subtitle={"Theo d\u00f5i vi\u1ec7c \u0111\u01b0\u1ee3c giao b\u00ean trong nh\u00f3m."}
        onClose={onClose}
        widthClass="max-w-5xl"
      >
        <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h4 className="text-base font-semibold text-slate-900">{"Danh s\u00e1ch c\u00f4ng vi\u1ec7c"}</h4>
          </div>
          {isAdmin ? (
            <Button
              type="button"
              variant={isCreating ? "outline" : "default"}
              className={isCreating ? "rounded-xl" : "rounded-xl bg-emerald-600 hover:bg-emerald-700"}
              onClick={() => setIsCreating((prev) => !prev)}
            >
              <Plus className="h-4 w-4" />
              {isCreating ? "Thu g\u1ecdn" : "Giao vi\u1ec7c"}
            </Button>
          ) : null}
        </div>

        {isCreating && isAdmin ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="grid gap-3">
              <input
                type="text"
                value={newTask.title}
                onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
                placeholder={"T\u00ean c\u00f4ng vi\u1ec7c"}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={newTask.description}
                onChange={(event) => setNewTask((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder={"M\u00f4 t\u1ea3 ng\u1eafn"}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={newTask.assignToGroup ? "__GROUP__" : newTask.assigneeId}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assignToGroup: event.target.value === "__GROUP__",
                      assigneeId: event.target.value === "__GROUP__" ? "__GROUP__" : event.target.value,
                    }))
                  }
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{"Ch\u1ecdn ng\u01b0\u1eddi nh\u1eadn"}</option>
                  <option value="__GROUP__">{"C\u1ea3 nh\u00f3m"}</option>
                  {group.participants.map((participant) => (
                    <option key={participant.userId} value={participant.userId}>
                      {getAssigneeName(participant.userId)}
                    </option>
                  ))}
                </select>
                <div className="relative md:col-span-2">
                  <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(event) => setNewTask((prev) => ({ ...prev, deadline: event.target.value }))}
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateTask}>
                  {"X\u00e1c nh\u1eadn giao vi\u1ec7c"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {loadingTasks ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
              {"\u0110ang t\u1ea3i c\u00f4ng vi\u1ec7c..."}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              {"Nh\u00f3m ch\u01b0a c\u00f3 c\u00f4ng vi\u1ec7c n\u00e0o."}
            </div>
          ) : (
            tasks.map((task) => {
              const isOverdue = task.deadline ? new Date(task.deadline) < new Date() && task.status !== "COMPLETED" : false;
              const canUpdate =
                Boolean(task.assignToGroup) || task.assigneeId === currentUserId || isAdmin;
              const completionDraft = completionDrafts[task.id] || {
                resultNote: task.resultNote || "",
                resultLink: task.resultLink || "",
                file: null,
              };
              const showCompletionForm = completionOpenTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`rounded-[24px] border p-4 shadow-sm ${
                    isOverdue ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-base font-semibold text-slate-900">{task.title}</h5>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTaskStatusClass(task.status)}`}>
                          {getTaskStatusLabel(task.status)}
                        </span>
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {"Qu\u00e1 h\u1ea1n"}
                          </span>
                        ) : null}
                      </div>

                      {task.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>
                          {"Ng\u01b0\u1eddi nh\u1eadn"}: {task.assignToGroup ? "C\u1ea3 nh\u00f3m" : getAssigneeName(task.assigneeId)}
                        </span>
                        <span>
                          {"Giao l\u00fac"}: {formatDateTime(task.createdAt)}
                        </span>
                        <span>
                          {"H\u1ea1n"}: {formatDateTime(task.deadline)}
                        </span>
                        {task.completedAt ? (
                          <span>
                            {"Ho\u00e0n th\u00e0nh"}: {formatDateTime(task.completedAt)}
                          </span>
                        ) : null}
                      </div>

                      {task.status === "COMPLETED" ? (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-slate-700">
                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-emerald-700">
                            <span>{"K\u1ebft qu\u1ea3 \u0111\u00e3 n\u1ed9p"}</span>
                            {task.completedById ? <span>{`B\u1edfi: ${getAssigneeName(task.completedById)}`}</span> : null}
                          </div>
                          {task.resultNote ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{task.resultNote}</p> : null}
                          <div className="mt-2 flex flex-wrap gap-3">
                            {task.resultLink ? (
                              <a
                                href={task.resultLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                              >
                                <Link2 className="h-4 w-4" />
                                {"M\u1edf link k\u1ebft qu\u1ea3"}
                              </a>
                            ) : null}
                            {task.resultFileUrl ? (
                              <a
                                href={task.resultFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                              >
                                <FileText className="h-4 w-4" />
                                {"Xem t\u1ec7p \u0111\u00ednh k\u00e8m"}
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setPreviewTask(task)}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                            >
                              <Eye className="h-4 w-4" />
                              {"Xem kết quả"}
                            </button>
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() => openCompletionForm(task)}
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                              >
                                <SquarePen className="h-4 w-4" />
                                {"C\u1eadp nh\u1eadt k\u1ebft qu\u1ea3"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canUpdate ? (
                        <select
                          value={task.status}
                          onChange={(event) => {
                            const nextStatus = event.target.value as UpdateTaskStatusRequest["status"];
                            if (nextStatus === "COMPLETED") {
                              openCompletionForm(task);
                              return;
                            }

                            setCompletionOpenTaskId((prev) => (prev === task.id ? null : prev));
                            void handleStatusChange(task.id, { status: nextStatus });
                          }}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          disabled={submittingTaskId === task.id}
                        >
                          <option value="TODO">{"C\u1ea7n l\u00e0m"}</option>
                          <option value="IN_PROGRESS">{"\u0110ang l\u00e0m"}</option>
                          <option value="COMPLETED">{"Ho\u00e0n th\u00e0nh"}</option>
                        </select>
                      ) : null}
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {canUpdate && showCompletionForm ? (
                    <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="grid gap-3">
                        <textarea
                          value={completionDraft.resultNote}
                          onChange={(event) =>
                            setCompletionDrafts((prev) => ({
                              ...prev,
                              [task.id]: { ...completionDraft, resultNote: event.target.value },
                            }))
                          }
                          rows={3}
                          placeholder={"M\u00f4 t\u1ea3 k\u1ebft qu\u1ea3 \u0111\u00e3 l\u00e0m"}
                          className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className="relative">
                          <Link2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="url"
                            value={completionDraft.resultLink}
                            onChange={(event) =>
                              setCompletionDrafts((prev) => ({
                                ...prev,
                                [task.id]: { ...completionDraft, resultLink: event.target.value },
                              }))
                            }
                            placeholder={"Link k\u1ebft qu\u1ea3 (n\u1ebfu c\u00f3)"}
                            className="w-full rounded-xl border border-emerald-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-white px-3 py-3 text-sm text-slate-600 hover:border-emerald-400">
                          <Upload className="h-4 w-4 text-emerald-600" />
                          <span className="truncate">
                            {completionDraft.file ? completionDraft.file.name : "T\u1ea3i l\u00ean t\u1ec7p k\u1ebft qu\u1ea3"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(event) =>
                              setCompletionDrafts((prev) => ({
                                ...prev,
                                [task.id]: { ...completionDraft, file: event.target.files?.[0] || null },
                              }))
                            }
                          />
                        </label>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCompletionOpenTaskId(null)}
                          >
                            {"H\u1ee7y"}
                          </Button>
                          <Button
                            type="button"
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                            disabled={submittingTaskId === task.id}
                            onClick={() =>
                              void handleStatusChange(task.id, {
                                status: "COMPLETED",
                                resultNote: normalizeOptionalText(completionDraft.resultNote),
                                resultLink: normalizeOptionalText(completionDraft.resultLink),
                                file: completionDraft.file,
                              })
                            }
                          >
                            {submittingTaskId === task.id ? "Đang lưu..." : "Lưu kết quả"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
        </div>
      </ModalShell>

      {previewTask ? (
        <ModalShell
          title={"Kết quả công việc"}
          subtitle={previewTask.title}
          onClose={() => setPreviewTask(null)}
          widthClass="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  {"Trạng thái"}: {getTaskStatusLabel(previewTask.status)}
                </span>
                <span>
                  {"Hoàn thành"}: {formatDateTime(previewTask.completedAt)}
                </span>
              </div>
            </div>

            {previewTask.resultNote || previewTask.resultLink || previewTask.resultFileUrl ? (
              <div className="space-y-3">
                {previewTask.resultNote ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {"Mô tả kết quả"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{previewTask.resultNote}</p>
                  </div>
                ) : null}

                {previewTask.resultLink ? (
                  <a
                    href={previewTask.resultLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700 hover:bg-emerald-50"
                  >
                    <Link2 className="h-4 w-4" />
                    <span className="truncate">{previewTask.resultLink}</span>
                  </a>
                ) : null}

                {previewTask.resultFileUrl ? (
                  <a
                    href={previewTask.resultFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{"Mở tệp kết quả đã nộp"}</span>
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                {"Task đã hoàn thành nhưng chưa có kết quả đính kèm."}
              </div>
            )}
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}

const CourseGroups = () => {
  const { id: offeringId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user: reduxUser } = useAppSelector((state) => state.auth);
  let currentUser = reduxUser;
  if (!currentUser) {
    const localUser = localStorage.getItem("user");
    if (localUser) currentUser = JSON.parse(localUser);
  }
  const currentUserId = currentUser?.studentId || currentUser?.userId || null;

  const [students, setStudents] = useState<Type[]>([]);
  const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
  const [projectAssessments, setProjectAssessments] = useState<Assessment[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<"chat" | "tasks" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!offeringId || !currentUserId) return;

      try {
        setIsLoading(true);
        const [studentData, groupData, assessmentData] = await Promise.all([
          courseService.getStudentsByOffering(offeringId),
          groupService.getMyGroups(offeringId, currentUserId),
          courseService.getAssessmentByOffering(offeringId),
        ]);

        setStudents(studentData || []);
        setMyGroups(groupData || []);
        setProjectAssessments((assessmentData || []).filter((item: Assessment) => isProjectAssessment(item)));

        if (groupData?.length > 0) {
          const storageKey = getActiveGroupStorageKey(offeringId);
          const savedGroupId = storageKey ? localStorage.getItem(storageKey) : null;
          const nextGroupId =
            savedGroupId && groupData.some((group: GroupResponse) => group.id === savedGroupId)
              ? savedGroupId
              : groupData[0].id;

          setActiveGroupId(nextGroupId);
        } else {
          setActiveGroupId(null);
        }
      } catch (error) {
        console.error("L\u1ed7i t\u1ea3i d\u1eef li\u1ec7u nh\u00f3m:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [offeringId, currentUserId]);

  useEffect(() => {
    const storageKey = getActiveGroupStorageKey(offeringId);
    if (!storageKey) return;

    if (activeGroupId) {
      localStorage.setItem(storageKey, activeGroupId);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [activeGroupId, offeringId]);

  const activeGroup = myGroups.find((group) => group.id === activeGroupId) || null;
  const isAdmin =
    activeGroup?.participants.find((participant) => participant.userId === currentUserId)?.role === "ADMIN";

  const handleGroupUpdated = (updatedGroup: GroupResponse) => {
    setMyGroups((prev) => prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/course/${offeringId}/evaluations?section=project&assessmentId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 pb-20 lg:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <Banner />

            {isLoading ? (
              <div className="flex flex-col items-center rounded-[28px] border border-slate-200 bg-white py-20 text-emerald-600 shadow-sm">
                <Loader2 className="mb-4 h-10 w-10 animate-spin" />
                <p>{"\u0110ang t\u1ea3i th\u00f4ng tin nh\u00f3m..."}</p>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Users className="h-10 w-10" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  {"B\u1ea1n ch\u01b0a c\u00f3 nh\u00f3m"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {"H\u00e3y t\u1ea1o nh\u00f3m m\u1edbi \u0111\u1ec3 b\u1eaft \u0111\u1ea7u trao \u0111\u1ed5i v\u00e0 l\u00e0m project c\u00f9ng c\u00e1c th\u00e0nh vi\u00ean."}
                </p>
                <Button
                  type="button"
                  className="mt-6 rounded-full bg-emerald-600 px-6 hover:bg-emerald-700"
                  onClick={() => navigate(`/course/${offeringId}/createGroup`)}
                >
                  <Plus className="h-4 w-4" />
                  {"T\u1ea1o nh\u00f3m m\u1edbi"}
                </Button>
              </div>
            ) : (
              <>
                {myGroups.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {myGroups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveGroupId(group.id)}
                        className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition ${
                          activeGroupId === group.id
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {group.groupName}
                      </button>
                    ))}
                  </div>
                ) : null}

                {activeGroup ? (
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                            {"Kh\u00f4ng gian nh\u00f3m"}
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold text-slate-900">{activeGroup.groupName}</h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {"M\u1edf chat ho\u1eb7c c\u00f4ng vi\u1ec7c khi c\u1ea7n, gi\u1eef m\u00e0n h\u00ecnh ch\u00ednh g\u1ecdn v\u00e0 d\u1ec5 theo d\u00f5i."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setActivePanel("chat")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-white"
                          >
                            <MessageSquare className="h-4 w-4 text-emerald-600" />
                            {"Chat"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePanel("tasks")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-white"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            {"C\u00f4ng vi\u1ec7c"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <GroupInfoCard
                      group={activeGroup}
                      students={students}
                      currentUserId={currentUserId as string}
                      onGroupUpdated={handleGroupUpdated}
                    />

                    <ProjectSection
                      projects={projectAssessments}
                      currentUserId={currentUserId as string}
                      onOpenProject={handleOpenProject}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {activePanel === "chat" && activeGroup ? (
        <ChatPanel
          conversationId={activeGroup.conversationId}
          currentUserId={currentUserId as string}
          students={students}
          onClose={() => setActivePanel(null)}
        />
      ) : null}

      {activePanel === "tasks" && activeGroup ? (
      <TaskPanel
          group={activeGroup}
          students={students}
          currentUserId={currentUserId as string}
          isAdmin={Boolean(isAdmin)}
          onClose={() => setActivePanel(null)}
        />
      ) : null}
    </div>
  );
};

export default CourseGroups;
