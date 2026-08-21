import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, BarChart3, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { courseService } from "@/features/course/courseApi.ts";

type StudentCLOScore = {
  studentId?: string;
  fullName?: string;
  score?: number | null;
};

type AssessmentMapping = {
  assessmentId?: string;
  assessmentName?: string;
  weight?: number | null;
};

type CLODetail = {
  cloId?: string;
  cloCode?: string;
  cloDescription?: string;
  students?: StudentCLOScore[];
  assessments?: AssessmentMapping[];
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
const STUDENTS_PER_PAGE = 5;

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const formatPercent = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value);

const getProgressColor = (score: number) => {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

export default function TeacherOBEDetail() {
  const { id: offeringId, cloId } = useParams();
  const [data, setData] = useState<CLODetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentSearch, setStudentSearch] = useState("");
  const [scoreSort, setScoreSort] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    let active = true;

    if (!offeringId || !cloId) {
      setError("Không tìm thấy thông tin CLO.");
      setLoading(false);
      return undefined;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await courseService.getCLoDetail(offeringId, cloId);
        if (active) setData(response);
      } catch (fetchError) {
        console.error("Lỗi tải chi tiết OBE:", fetchError);
        if (active) setError("Chưa thể tải chi tiết tiến độ OBE. Vui lòng thử lại sau.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      active = false;
    };
  }, [offeringId, cloId]);

  const students = data?.students ?? [];
  const assessments = data?.assessments ?? [];

  const summary = useMemo(() => {
    const scores = students.map((student) => clampPercent(Number(student.score ?? 0)));
    const total = scores.length;
    const passCount = scores.filter((score) => score >= 50).length;
    const average = total > 0 ? scores.reduce((sum, score) => sum + score, 0) / total : 0;

    return { total, passCount, failCount: total - passCount, average };
  }, [students]);

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: "Dưới 40%", students: 0, color: "#f43f5e" },
      { label: "40–49%", students: 0, color: "#f59e0b" },
      { label: "50–69%", students: 0, color: "#0ea5e9" },
      { label: "70–100%", students: 0, color: "#10b981" },
    ];

    students.forEach((student) => {
      const score = clampPercent(Number(student.score ?? 0));
      if (score < 40) ranges[0].students += 1;
      else if (score < 50) ranges[1].students += 1;
      else if (score < 70) ranges[2].students += 1;
      else ranges[3].students += 1;
    });

    return ranges;
  }, [students]);

  const passFailData = useMemo(
    () => [
      { name: "Đạt", value: summary.passCount, color: "#10b981" },
      { name: "Chưa đạt", value: summary.failCount, color: "#f43f5e" },
    ],
    [summary.failCount, summary.passCount],
  );

  const passRate = summary.total > 0 ? Math.round((summary.passCount / summary.total) * 100) : 0;

  const filteredStudents = useMemo(() => {
    const keyword = normalizeSearchText(studentSearch);
    return students
      .filter((student) => {
        if (!keyword) return true;
        return normalizeSearchText(`${student.fullName ?? ""} ${student.studentId ?? ""}`).includes(keyword);
      })
      .sort((first, second) => {
        const firstScore = clampPercent(Number(first.score ?? 0));
        const secondScore = clampPercent(Number(second.score ?? 0));
        const scoreDifference = scoreSort === "desc" ? secondScore - firstScore : firstScore - secondScore;
        return scoreDifference || (first.fullName ?? "").localeCompare(second.fullName ?? "", "vi");
      });
  }, [scoreSort, studentSearch, students]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
  }, [currentPage, filteredStudents]);

  const visiblePages = useMemo(() => {
    const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const lastPage = Math.min(totalPages, firstPage + 4);
    return Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [cloId, scoreSort, studentSearch]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="space-y-5 p-4 md:p-6">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 md:m-6">{error}</div>;
  }

  return (
    <div className="space-y-6 p-4 font-sans text-sm text-slate-900 md:p-6">
      <header>
        <h2 className="text-xl font-bold leading-7 text-slate-900 md:text-2xl">
          {data.cloCode || "CLO"} - {data.cloDescription || "Chưa có mô tả"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">Phân tích kết quả học tập theo chuẩn đầu ra</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Trung bình" value={`${formatPercent(summary.average)}%`} valueClass="text-slate-900" />
        <SummaryCard label="Đạt" value={`${summary.passCount}/${summary.total}`} valueClass="text-emerald-600" />
        <SummaryCard label="Không đạt" value={`${summary.failCount}/${summary.total}`} valueClass="text-rose-600" />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex shrink-0 items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <h3 className="font-semibold text-slate-900">Danh sách sinh viên</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {studentSearch ? `${filteredStudents.length}/${summary.total}` : summary.total} sinh viên
            </span>
            <label className="relative block min-w-0 flex-1 lg:ml-auto">
              <span className="sr-only">Tìm kiếm sinh viên</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc MSSV..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="relative block shrink-0 lg:w-[200px]">
              <span className="sr-only">Sắp xếp theo điểm</span>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={scoreSort}
                onChange={(event) => setScoreSort(event.target.value as "desc" | "asc")}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="desc">Điểm cao đến thấp</option>
                <option value="asc">Điểm thấp đến cao</option>
              </select>
            </label>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">Chưa có dữ liệu điểm sinh viên cho CLO này.</p>
        ) : filteredStudents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">Không tìm thấy sinh viên phù hợp.</p>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {paginatedStudents.map((student, index) => {
                const score = clampPercent(Number(student.score ?? 0));
                const isWeak = score < 50;

                return (
                  <div key={student.studentId || index} className={`px-4 py-3.5 ${isWeak ? "bg-rose-50/60" : "bg-white"}`}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{student.fullName || "Chưa có tên"}</p>
                        {student.studentId ? <p className="mt-0.5 text-xs text-slate-500">{student.studentId}</p> : null}
                      </div>
                      <span className={`shrink-0 text-sm font-bold ${isWeak ? "text-rose-600" : "text-slate-700"}`}>
                        {formatPercent(score)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${getProgressColor(score)}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Hiển thị {(currentPage - 1) * STUDENTS_PER_PAGE + 1}–{Math.min(currentPage * STUDENTS_PER_PAGE, filteredStudents.length)} trong {filteredStudents.length} sinh viên
              </p>
              <nav className="flex items-center gap-1" aria-label="Phân trang danh sách sinh viên">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Nguồn đánh giá (Mapping)</h3>
            <p className="mt-1 text-xs text-slate-500">Tỷ trọng của từng bài đánh giá đóng góp vào CLO này.</p>
          </div>
          <BarChart3 className="h-5 w-5 shrink-0 text-slate-400" />
        </div>

        {assessments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Chưa có bài đánh giá được mapping với CLO này.</p>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              // Backend trả clo_weight theo thang phần trăm 0–100; không nhân thêm 100.
              const weight = clampPercent(Number(assessment.weight ?? 0));
              return (
                <div key={assessment.assessmentId || index}>
                  <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-700">{assessment.assessmentName || "Bài đánh giá"}</span>
                    <span className="shrink-0 font-semibold text-slate-900">{formatPercent(weight)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900">Sơ đồ đánh giá</h3>
          <p className="mt-1 text-xs text-slate-500">Tổng hợp kết quả của toàn bộ sinh viên trong CLO hiện tại.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Phân bố mức điểm</h4>
            <p className="mt-1 text-xs text-slate-500">Số sinh viên trong từng khoảng tiến độ</p>
            {summary.total === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu để hiển thị.</div>
            ) : (
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Bar dataKey="students" name="Sinh viên" radius={[6, 6, 0, 0]} maxBarSize={58}>
                      {scoreDistribution.map((range) => <Cell key={range.label} fill={range.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Tỷ lệ đạt chuẩn</h4>
            <p className="mt-1 text-xs text-slate-500">Ngưỡng đạt được tính từ 50% trở lên</p>
            {summary.total === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu để hiển thị.</div>
            ) : (
              <div className="relative mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={passFailData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3}>
                      {passFailData.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{passRate}%</span>
                  <span className="text-xs text-slate-500">Tỷ lệ đạt</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-600">
              {passFailData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
