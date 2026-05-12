import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, Search, UserPlus, Users, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { courseService } from "@/features/course/courseApi.ts";
import type { Type } from "@/features/course/student/api/type.ts";
import type { User } from "@/pages/admin/api/type.ts";
import userService from "@/pages/admin/api/userService.ts";

type EnrollmentResult = {
  identifier: string;
  status: "success" | "duplicate" | "failed";
  message: string;
  studentId?: string;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function splitIdentifiers(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[\n,;\t]+/g)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export default function TeacherCourseStudents() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<Type[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [singleIdentifier, setSingleIdentifier] = useState("");
  const [bulkIdentifiers, setBulkIdentifiers] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterDecisions, setRosterDecisions] = useState<Record<string, "accept" | "reject">>({});
  const [results, setResults] = useState<EnrollmentResult[] | null>(null);

  const refreshStudents = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await courseService.getStudentsByOffering(id);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Loi khi tai danh sach sinh vien:", error);
      toast.error("Không thể tải danh sách sinh viên của lớp.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshStudents();
  }, [refreshStudents]);

  const filtered = useMemo(
    () =>
      students.filter((student) =>
        `${student.fullName} ${student.studentId} ${student.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search, students],
  );

  const rosterFiltered = useMemo(
    () =>
      students.filter((student) =>
        `${student.fullName} ${student.studentId} ${student.email}`
          .toLowerCase()
          .includes(rosterSearch.toLowerCase()),
      ),
    [rosterSearch, students],
  );

  const resolveIdentifierToStudent = async (identifier: string) => {
    const keyword = identifier.trim();
    if (!keyword) {
      throw new Error("Thiếu MSSV hoặc email.");
    }

    const normalized = normalizeText(keyword);
    const response = await userService.getAllUser(0, 200, keyword);
    const candidates = response.content ?? [];

    const exactMatch = candidates.find((user: User) => {
      const fields = [user.studentId, user.userId, user.email, user.username]
        .filter(Boolean)
        .map((field) => normalizeText(String(field)));
      return fields.includes(normalized);
    });

    const looseMatch = exactMatch ?? candidates.find((user: User) => {
      const fields = [user.studentId, user.userId, user.email, user.username]
        .filter(Boolean)
        .map((field) => normalizeText(String(field)));
      return fields.some((field) => field.includes(normalized) || normalized.includes(field));
    });

    if (!looseMatch) {
      throw new Error(`Không tìm thấy sinh viên phù hợp với "${keyword}".`);
    }

    const studentId = looseMatch.studentId || looseMatch.userId;
    if (!studentId) {
      throw new Error(`Tài khoản "${keyword}" chưa có MSSV để ghi danh.`);
    }

    return {
      studentId,
      label: looseMatch.fullName || looseMatch.email || studentId,
    };
  };

  const handleEnrollStudents = async () => {
    if (!id) return;

    const rawIdentifiers = activeTab === "single" ? [singleIdentifier] : splitIdentifiers(bulkIdentifiers);
    const identifiers = rawIdentifiers.map((value) => value.trim()).filter(Boolean);

    if (identifiers.length === 0) {
      toast.error("Vui lòng nhập ít nhất một MSSV hoặc email.");
      return;
    }

    setIsSubmitting(true);
    setResults(null);

    const existingIds = new Set(students.map((student) => normalizeText(student.studentId)));
    const nextResults: EnrollmentResult[] = [];

    try {
      for (const identifier of identifiers) {
        try {
          const resolved = await resolveIdentifierToStudent(identifier);
          const normalizedStudentId = normalizeText(resolved.studentId);

          if (existingIds.has(normalizedStudentId)) {
            nextResults.push({
              identifier,
              studentId: resolved.studentId,
              status: "duplicate",
              message: `${resolved.studentId} đã có trong lớp.`,
            });
            continue;
          }

          await courseService.enrollCourse(resolved.studentId, id);
          existingIds.add(normalizedStudentId);
          nextResults.push({
            identifier,
            studentId: resolved.studentId,
            status: "success",
            message: `Đã thêm ${resolved.label} (${resolved.studentId}).`,
          });
        } catch (error: any) {
          nextResults.push({
            identifier,
            status: "failed",
            message: error?.response?.data?.message || error?.message || `Không thể thêm "${identifier}".`,
          });
        }
      }

      const successCount = nextResults.filter((item) => item.status === "success").length;
      const duplicateCount = nextResults.filter((item) => item.status === "duplicate").length;
      const failedCount = nextResults.filter((item) => item.status === "failed").length;

      setResults(nextResults);

      if (successCount > 0) {
        await refreshStudents();
        toast.success(`Đã thêm ${successCount} sinh viên vào lớp.`);
      } else if (duplicateCount > 0 && failedCount === 0) {
        toast.info("Danh sách bạn nhập đã có sẵn trong lớp.");
      } else if (failedCount > 0) {
        toast.error("Có sinh viên chưa thể thêm. Vui lòng kiểm tra kết quả bên dưới.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEnrollDialog = () => {
    if (isSubmitting) return;
    setIsEnrollOpen(false);
    setActiveTab("single");
    setSingleIdentifier("");
    setBulkIdentifiers("");
    setResults(null);
  };

  const handleRosterDecision = (studentId: string, decision: "accept" | "reject") => {
    setRosterDecisions((prev) => ({ ...prev, [studentId]: decision }));
    toast.success(
      decision === "accept"
        ? "Đã chấp nhận sinh viên trong danh sách."
        : "Đã đánh dấu không chấp nhận sinh viên này.",
    );
  };

  return (
    <div className="p-3 space-y-4 sm:p-4 md:p-6">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Sinh viên lớp học
              </p>
              <h4 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Danh sách lớp {id}
              </h4>
            </div>
            <Users className="h-6 w-6 shrink-0 text-emerald-600" />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm theo tên, MSSV hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white pl-9 focus:bg-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRosterOpen(true)}
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-700"
            >
              Xem danh sách đăng ký
            </Button>
            <Button
              type="button"
              onClick={() => setIsEnrollOpen(true)}
              className="h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <UserPlus className="h-4 w-4" />
              Thêm sinh viên
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {students.length} sinh viên
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {filtered.length} kết quả lọc
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Không có sinh viên nào.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <div
                key={student.id || student.studentId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 sm:text-base">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-slate-500">{student.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="break-all">{student.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isRosterOpen} onOpenChange={setIsRosterOpen}>
        <DialogContent className="flex max-h-[86vh] w-[min(92vw,50rem)] !max-w-[50rem] flex-col overflow-hidden rounded-[24px] border-slate-200 bg-white p-0 shadow-2xl">
          <div className="border-b border-slate-200 px-5 py-4 pr-14">
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="text-lg font-bold text-slate-900 sm:text-xl">
                Danh sách sinh viên đăng ký
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500">
                Xem nhanh danh sách hiện có của lớp và tìm theo tên, MSSV hoặc email.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 space-y-4 overflow-hidden px-5 py-4">
            <Input
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              placeholder="Lọc trong danh sách..."
              className="h-10 rounded-2xl border-slate-200"
            />

            <div className="min-h-0 rounded-2xl border border-slate-200 bg-slate-50/60">
              <ScrollArea className="h-[46vh]">
                {rosterFiltered.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Không tìm thấy sinh viên phù hợp.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white">
                    {rosterFiltered.map((student) => (
                      <div
                        key={student.id || student.studentId}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-500">{student.studentId}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          {rosterDecisions[student.studentId] && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                rosterDecisions[student.studentId] === "accept"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {rosterDecisions[student.studentId] === "accept" ? "Đã chấp nhận" : "Đã từ chối"}
                            </span>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-9 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                              onClick={() => handleRosterDecision(student.studentId, "accept")}
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-full border-slate-200 px-4 text-slate-700"
                              onClick={() => handleRosterDecision(student.studentId, "reject")}
                            >
                              Không
                            </Button>
                          </div>
                        </div>
                        <div className="truncate text-sm text-slate-500 sm:max-w-[16rem]">{student.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Duyệt từng sinh viên ngay trong popup. Nút này hiện chỉ lưu trạng thái giao diện.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEnrollOpen} onOpenChange={(open) => (open ? setIsEnrollOpen(true) : closeEnrollDialog())}>
        <DialogContent className="flex max-h-[88vh] w-[min(92vw,48rem)] !max-w-[48rem] flex-col overflow-hidden rounded-[24px] border-slate-200 bg-white p-0 shadow-2xl">
          <div className="border-b border-slate-200 px-5 py-4 pr-14">
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="text-lg font-bold text-slate-900 sm:text-xl">
                Thêm sinh viên vào lớp
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500">
                Nhập MSSV hoặc email. Với nhập nhiều, bạn có thể dán trực tiếp dữ liệu copy từ Excel
                theo từng dòng, từng cột hoặc phân tách bằng dấu phẩy.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 space-y-4 overflow-hidden px-5 py-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "single" | "bulk")}>
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="single" className="rounded-xl">
                  Thêm 1 sinh viên
                </TabsTrigger>
                <TabsTrigger value="bulk" className="rounded-xl">
                  Nhập hàng loạt
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    MSSV hoặc email
                  </label>
                  <Input
                    value={singleIdentifier}
                    onChange={(e) => setSingleIdentifier(e.target.value)}
                    placeholder="VD: 21130001 hoặc sv@example.edu.vn"
                    className="h-10 rounded-2xl border-slate-200 bg-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Nếu nhập email, hệ thống sẽ dò tài khoản rồi lấy MSSV để ghi danh.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Dán danh sách MSSV hoặc email
                  </label>
                  <Textarea
                    value={bulkIdentifiers}
                    onChange={(e) => setBulkIdentifiers(e.target.value)}
                    rows={8}
                    placeholder={`21130001\n21130002\nsv3@hcmuaf.edu.vn`}
                    className="rounded-2xl border-slate-200 bg-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Mỗi dòng là một sinh viên. Bạn có thể copy cả cột trong Excel rồi dán trực tiếp.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {results && (
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Kết quả xử lý</p>
                </div>
                <div className="max-h-56 overflow-auto divide-y divide-slate-100">
                  {results.map((item, index) => (
                    <div key={`${item.identifier}-${index}`} className="flex items-start gap-3 px-4 py-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          item.status === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "duplicate"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : item.status === "duplicate" ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.identifier}</p>
                        <p className="text-sm text-slate-500">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-200 bg-slate-50 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeEnrollDialog}
              disabled={isSubmitting}
              className="h-10 rounded-2xl border-slate-200"
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleEnrollStudents}
              disabled={isSubmitting}
              className="h-10 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isSubmitting ? "Đang thêm..." : "Xác nhận thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
