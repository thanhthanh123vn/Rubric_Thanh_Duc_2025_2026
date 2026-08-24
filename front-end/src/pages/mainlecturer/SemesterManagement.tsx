import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, Search, UserPlus, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import lecturerService from "@/pages/admin/api/lecturerService";
import type { LecturerProfile } from "@/pages/admin/api/type";
import { teachingAssistantApi, type TeachingAssistantAssignment } from "@/api/teachingAssistantApi";

function errorMessage(error: unknown) {
  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || "Không thể thực hiện thao tác.";
}

export default function SemesterManagement() {
  const [assignments, setAssignments] = useState<TeachingAssistantAssignment[]>([]);
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [editing, setEditing] = useState<TeachingAssistantAssignment | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setLoadError("");
        const [offeringResult, lecturerResult] = await Promise.allSettled([
          teachingAssistantApi.getMyOfferings(),
          lecturerService.getAllLecturers(0, 500, ""),
        ]);
        if (offeringResult.status === "fulfilled") {
          setAssignments(offeringResult.value);
        } else {
          const message = errorMessage(offeringResult.reason);
          setLoadError(message);
          toast.error(message);
        }
        if (lecturerResult.status === "fulfilled") {
          setLecturers(lecturerResult.value.content ?? []);
        } else {
          toast.error("Không tải được danh sách giảng viên có role TEACHER.");
        }
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const years = useMemo(
    () => [...new Set(assignments.map((item) => item.academicYear).filter(Boolean))].sort().reverse(),
    [assignments],
  );
  const semesters = useMemo(
    () => [...new Set(assignments
      .filter((item) => selectedYear === "ALL" || item.academicYear === selectedYear)
      .map((item) => item.semester)
      .filter(Boolean))].sort(),
    [assignments, selectedYear],
  );
  const visibleAssignments = useMemo(
    () => assignments.filter((item) =>
      (selectedYear === "ALL" || item.academicYear === selectedYear)
      && (selectedSemester === "ALL" || item.semester === selectedSemester)),
    [assignments, selectedYear, selectedSemester],
  );
  const withAssistants = visibleAssignments.filter((item) => item.teachingAssistants.length > 0).length;

  const eligibleLecturers = useMemo(() => {
    if (!editing) return [];
    const keyword = search.trim().toLocaleLowerCase("vi");
    return lecturers.filter((lecturer) =>
      lecturer.lecturerId !== editing.mainLecturer?.lecturerId
      && ["TEACHER", "LECTURER"].includes((lecturer.role || "").toUpperCase())
      && (!editing.department || lecturer.department?.toLocaleLowerCase("vi") === editing.department.toLocaleLowerCase("vi"))
      && (!keyword
        || lecturer.fullName.toLocaleLowerCase("vi").includes(keyword)
        || lecturer.lecturerId.toLocaleLowerCase("vi").includes(keyword)));
  }, [editing, lecturers, search]);

  const openEditor = (assignment: TeachingAssistantAssignment) => {
    setEditing(assignment);
    setSelectedIds(assignment.teachingAssistants.map((item) => item.lecturerId));
    setSearch("");
  };

  const toggleLecturer = (lecturerId: string) => {
    setSelectedIds((current) => current.includes(lecturerId)
      ? current.filter((id) => id !== lecturerId)
      : [...current, lecturerId]);
  };

  const saveAssistants = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await teachingAssistantApi.updateAssistants(editing.offeringId, selectedIds);
      setAssignments((current) => current.map((item) => item.offeringId === updated.offeringId ? updated : item));
      setEditing(null);
      toast.success(selectedIds.length > 0 ? "Đã cập nhật trợ giảng." : "Lớp được đặt ở trạng thái không cần trợ giảng.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Học kỳ</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Quản lý trợ giảng</h1>
        <p className="mt-2 text-sm text-slate-500">Thêm trợ giảng cho các lớp bạn phụ trách. Lớp có thể không cần trợ giảng.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Lớp phụ trách", visibleAssignments.length, "bg-emerald-50 text-emerald-700"],
          ["Có trợ giảng", withAssistants, "bg-blue-50 text-blue-700"],
          ["Không có trợ giảng", visibleAssignments.length - withAssistants, "bg-amber-50 text-amber-700"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><UsersRound size={20} /></div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Năm học
            <select value={selectedYear} onChange={(event) => { setSelectedYear(event.target.value); setSelectedSemester("ALL"); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
              <option value="ALL">Tất cả năm học</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Học kỳ
            <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
              <option value="ALL">Tất cả học kỳ</option>
              {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Lớp học phần của tôi</h2></div>
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-emerald-700"><LoaderCircle className="animate-spin" /></div>
        ) : loadError ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-rose-700">Không tải được dữ liệu lớp học phần</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{loadError}</p>
          </div>
        ) : visibleAssignments.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-slate-700">Chưa có lớp được phân công cho bạn</p>
            <p className="mt-2 text-sm text-slate-500">Dữ liệu chỉ xuất hiện sau khi phân công thật được Lãnh đạo khoa phê duyệt.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleAssignments.map((item) => (
              <div key={item.offeringId} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{item.courseCode}</span>
                    <span className="text-xs text-slate-500">{item.semester} · {item.academicYear}</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{item.offeringName || item.courseName}</h3>
                  <p className="mt-1 text-sm text-slate-500">Giảng viên chính: {item.mainLecturer?.lecturerName || "Chưa xác định"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.teachingAssistants.length > 0 ? item.teachingAssistants.map((assistant) => (
                      <span key={assistant.lecturerId} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{assistant.lecturerName}</span>
                    )) : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Không có trợ giảng</span>}
                  </div>
                </div>
                <button type="button" onClick={() => openEditor(item)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  <UserPlus size={17} /> {item.teachingAssistants.length ? "Quản lý trợ giảng" : "Thêm trợ giảng"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && !saving && setEditing(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="assistant-dialog-title" className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 id="assistant-dialog-title" className="text-xl font-bold text-slate-900">Chọn trợ giảng</h2>
                <p className="mt-1 text-sm text-slate-500">{editing.courseCode} · {editing.offeringName || editing.courseName}</p>
              </div>
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X size={20} /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mã giảng viên" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500" />
              </div>
              <button type="button" onClick={() => setSelectedIds([])} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${selectedIds.length === 0 ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700"}`}>
                <span><strong>Không cần trợ giảng</strong><span className="mt-0.5 block text-xs font-normal text-slate-500">Có thể bổ sung sau nếu cần.</span></span>
                {selectedIds.length === 0 && <Check size={18} />}
              </button>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {eligibleLecturers.map((lecturer) => {
                  const selected = selectedIds.includes(lecturer.lecturerId);
                  return (
                    <button key={lecturer.lecturerId} type="button" onClick={() => toggleLecturer(lecturer.lecturerId)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <span><strong className="block text-sm text-slate-900">{lecturer.fullName}</strong><span className="text-xs text-slate-500">{lecturer.academicTitle || "Giảng viên"} · {lecturer.lecturerId}</span></span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>{selected && <Check size={14} />}</span>
                    </button>
                  );
                })}
                {eligibleLecturers.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Không tìm thấy giảng viên phù hợp trong cùng bộ môn.</p>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <span className="text-sm text-slate-500">Đã chọn: <strong className="text-slate-800">{selectedIds.length}</strong></span>
              <div className="flex gap-3">
                <button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</button>
                <button type="button" disabled={saving} onClick={saveAssistants} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {saving && <LoaderCircle className="animate-spin" size={16} />} Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
