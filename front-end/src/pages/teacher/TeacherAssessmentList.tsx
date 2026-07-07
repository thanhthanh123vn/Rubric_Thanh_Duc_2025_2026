import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { CalendarDays, ChevronRight, ClipboardList, Clock3, Search, X } from "lucide-react";

interface TeacherAssessmentItem {
  assessmentId: string;
  assessmentName: string;
  endTime?: string | null;
  submittedCount?: number | null;
  pendingCount?: number | null;
}

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const matchesDateRange = (value: string | null | undefined, fromDate: string, toDate: string) => {
  if (!fromDate && !toDate) return true;
  if (!value) return false;

  const itemDate = toDateInputValue(value);
  if (!itemDate) return false;

  if (fromDate && itemDate < fromDate) return false;
  if (toDate && itemDate > toDate) return false;
  return true;
};

export default function TeacherAssessmentList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<TeacherAssessmentItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!id) return;
    assessmentService.getAssessmentsByOffering(id).then((data) => {
      setAssessments(Array.isArray(data) ? data : []);
    });
  }, [id]);

  const filteredAssessments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const matchesKeyword =
        !normalizedKeyword ||
        assessment.assessmentName?.toLowerCase().includes(normalizedKeyword) ||
        assessment.assessmentId?.toLowerCase().includes(normalizedKeyword);

      const matchesDate = matchesDateRange(assessment.endTime, fromDate, toDate);

      return matchesKeyword && matchesDate;
    });
  }, [assessments, fromDate, keyword, toDate]);

  const clearFilters = () => {
    setKeyword("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900 md:text-2xl">Danh sách bài tập</h3>
        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          Quản lý và chấm điểm bài tập của sinh viên.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Search className="h-4 w-4 text-emerald-600" />
                Tìm kiếm
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo tên bài tập hoặc mã bài tập"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Từ ngày
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Đến ngày
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 xl:flex-col xl:items-end">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-900">{filteredAssessments.length}</span> /{" "}
              {assessments.length} bài tập
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {filteredAssessments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Không có bài tập phù hợp với điều kiện tìm kiếm hoặc ngày đã chọn.
          </div>
        ) : (
          filteredAssessments.map((assessment) => (
            <div
              key={assessment.assessmentId}
              className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between md:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold leading-tight text-slate-900 md:text-lg">
                    {assessment.assessmentName}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 md:text-sm">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>
                      {assessment.endTime
                        ? new Date(assessment.endTime).toLocaleString("vi-VN")
                        : "Chưa có hạn nộp"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-4 md:border-t-0 md:pt-0">
                <div className="flex gap-4 text-center md:gap-8">
                  <div>
                    <p className="text-base font-bold text-slate-900 md:text-xl">
                      {assessment.submittedCount || 0}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 md:text-[10px]">
                      Đã nộp
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-amber-600 md:text-xl">
                      {assessment.pendingCount || 0}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 md:text-[10px]">
                      Chờ chấm
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/teacher/course/${id}/assessment/${assessment.assessmentId}/grading`)}
                  className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <span className="hidden md:inline">Chấm bài</span>
                  <ChevronRight className="h-5 w-5 md:hidden" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
