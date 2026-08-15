import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { fetchSubmissionStatuses, summarizeSubmissionStatuses } from "@/api/GradingApi.ts";
import { CalendarDays, Check, ChevronRight, ClipboardList, Clock3, ListFilter, Search, SlidersHorizontal, X } from "lucide-react";

interface TeacherAssessmentItem {
  assessmentId: string;
  assessmentName: string;
  assessmentType?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  submittedCount?: number | null;
  pendingCount?: number | null;
}

type SortOrder = "NEWEST" | "OLDEST";

const getAssessmentTimestamp = (assessment: TeacherAssessmentItem) => {
  const value = assessment.startTime || assessment.endTime;
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

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

const formatAssessmentType = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  const labels: Record<string, string> = {
    quiz: "Trắc nghiệm",
    upload: "Nộp tập tin",
    assignment: "Bài tập",
    project: "Đồ án",
    exam: "Bài thi",
    attendance: "Chuyên cần",
  };
  return normalized ? labels[normalized] || value || "Khác" : "Chưa phân loại";
};

export default function TeacherAssessmentList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<TeacherAssessmentItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("NEWEST");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;
    const loadAssessments = async () => {
      const data = await assessmentService.getAssessmentsByOffering(id);
      const items: TeacherAssessmentItem[] = Array.isArray(data) ? data : [];
      const itemsWithAccurateCounts = await Promise.all(
        items.map(async (assessment) => {
          try {
            const statuses = await fetchSubmissionStatuses(assessment.assessmentId);
            return {
              ...assessment,
              ...summarizeSubmissionStatuses(Array.isArray(statuses) ? statuses : []),
            };
          } catch (error) {
            console.error(`Không thể cập nhật số bài chờ chấm của ${assessment.assessmentId}:`, error);
            return assessment;
          }
        }),
      );

      if (active) setAssessments(itemsWithAccurateCounts);
    };

    void loadAssessments();
    return () => {
      active = false;
    };
  }, [id]);

  const assessmentTypes = useMemo(() =>
    [...new Set(assessments.map((item) => item.assessmentType?.trim()).filter(Boolean) as string[])]
      .sort((left, right) => formatAssessmentType(left).localeCompare(formatAssessmentType(right), "vi")),
  [assessments]);

  const filteredAssessments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const matchingAssessments = assessments.filter((assessment) => {
      const matchesKeyword =
        !normalizedKeyword ||
        assessment.assessmentName?.toLowerCase().includes(normalizedKeyword) ||
        assessment.assessmentId?.toLowerCase().includes(normalizedKeyword);

      const matchesDate = matchesDateRange(assessment.endTime, fromDate, toDate);
      const matchesType = !selectedType || assessment.assessmentType?.trim() === selectedType;

      return matchesKeyword && matchesDate && matchesType;
    });

    return matchingAssessments.sort((left, right) => {
      const leftTimestamp = getAssessmentTimestamp(left);
      const rightTimestamp = getAssessmentTimestamp(right);

      if (leftTimestamp === null && rightTimestamp === null) {
        return left.assessmentName.localeCompare(right.assessmentName, "vi");
      }
      if (leftTimestamp === null) return 1;
      if (rightTimestamp === null) return -1;

      return sortOrder === "NEWEST"
        ? rightTimestamp - leftTimestamp
        : leftTimestamp - rightTimestamp;
    });
  }, [assessments, fromDate, keyword, selectedType, sortOrder, toDate]);

  const clearFilters = () => {
    setKeyword("");
    setSelectedType("");
    setSortOrder("NEWEST");
    setShowSortOptions(false);
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
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_210px_190px_190px]">
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
                <ListFilter className="h-4 w-4 text-emerald-600" />
                Loại bài tập
              </span>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Tất cả loại</option>
                {assessmentTypes.map((type) => <option key={type} value={type}>{formatAssessmentType(type)}</option>)}
              </select>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortOptions((current) => !current)}
                  aria-label="Mở tùy chọn sắp xếp"
                  aria-expanded={showSortOptions}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                    showSortOptions || sortOrder === "OLDEST"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>

                {showSortOptions ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {([
                      { value: "NEWEST", label: "Mới nhất" },
                      { value: "OLDEST", label: "Cũ nhất" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortOrder(option.value);
                          setShowSortOptions(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          sortOrder === option.value
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {option.label}
                        {sortOrder === option.value ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
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
                  <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {formatAssessmentType(assessment.assessmentType)}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 md:text-sm">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>
                      {assessment.startTime
                        ? new Date(assessment.startTime).toLocaleString("vi-VN")
                        : "Chưa có ngày bắt đầu"}
                      {" → "}
                      {assessment.endTime
                        ? new Date(assessment.endTime).toLocaleString("vi-VN")
                        : "Chưa có ngày kết thúc"}
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
                  className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <span className="hidden md:inline">Chấm bài</span>
                  <ChevronRight className="h-5 w-5 text-white md:hidden" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
