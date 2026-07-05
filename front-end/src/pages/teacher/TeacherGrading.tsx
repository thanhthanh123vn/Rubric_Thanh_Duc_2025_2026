import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Expand,
  ExternalLink,
  Loader2,
  Minimize2,
  Save,
  Search,
} from "lucide-react";
import { getRubricMatrixById } from "@/api/RubricApi";
import { fetchSubmissionStatuses, submitStudentGrade } from "@/api/GradingApi";
import type { SubmissionStatusDTO } from "@/api/type";

interface LevelDTO {
  levelId: string;
  levelName: string;
  description: string | null;
  score: number | null;
}

interface RubricRowDTO {
  cloId: string;
  criteriaId: string;
  criteriaName: string;
  weight: number;
  levels: LevelDTO[];
}

interface RubricDTO {
  id: string;
  name: string;
  description: string;
  courses: number;
  cloCount: number;
  criteriaCount: number;
  totalWeight: number;
  status: string;
  rows: RubricRowDTO[];
}

type ExpandedPane = "none" | "submission" | "rubric";
type SubmissionFilter = "ALL" | "SUBMITTED" | "NOT_SUBMITTED";

const FILTER_OPTIONS: { value: SubmissionFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "SUBMITTED", label: "Đã nộp" },
  { value: "NOT_SUBMITTED", label: "Chưa nộp" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "---";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";
  return date.toLocaleString("vi-VN");
};

const isPreviewableFile = (url?: string | null) => {
  if (!url) return false;
  const lowered = url.toLowerCase();
  return [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".txt"].some((ext) =>
    lowered.includes(ext),
  );
};

const getSubmissionBadge = (submission: SubmissionStatusDTO) => {
  if (!submission.submitted) return "Chưa nộp";
  if (submission.status && submission.status !== "SUBMITTED") return submission.status;
  return "Đã nộp";
};

export default function TeacherGrading() {
  const { assessmentId } = useParams<{ assessmentId: string }>();

  const [submissions, setSubmissions] = useState<SubmissionStatusDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [rubric, setRubric] = useState<RubricDTO | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<SubmissionStatusDTO | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [expandedPane, setExpandedPane] = useState<ExpandedPane>("none");
  const [searchStudentId, setSearchStudentId] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>("ALL");

  useEffect(() => {
    if (assessmentId) {
      void loadSubmissions();
    }
  }, [assessmentId]);

  const loadSubmissions = async () => {
    if (!assessmentId) return;
    setLoading(true);
    try {
      const data = await fetchSubmissionStatuses(assessmentId);
      const nextSubmissions = Array.isArray(data) ? data : [];
      setSubmissions(nextSubmissions);

      setActiveSubmission((current) => {
        if (!current) return null;
        return (
          nextSubmissions.find((item) => item.studentId === current.studentId) ?? null
        );
      });
    } catch (error) {
      console.error("Lỗi tải bài nộp:", error);
      setSubmissions([]);
      setActiveSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const keyword = searchStudentId.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchKeyword = !keyword || submission.studentId.toLowerCase().includes(keyword);
      const matchFilter =
        submissionFilter === "ALL" ||
        (submissionFilter === "SUBMITTED" && submission.submitted) ||
        (submissionFilter === "NOT_SUBMITTED" && !submission.submitted);

      return matchKeyword && matchFilter;
    });
  }, [searchStudentId, submissionFilter, submissions]);

  const handleSelectSubmission = async (submission: SubmissionStatusDTO) => {
    try {
      setActiveSubmission(submission);
      setCriteriaScores({});
      setSelectedLevels({});

      if (!submission.rubricId) {
        setRubric(null);
        return;
      }

      const rubricRes = await getRubricMatrixById(submission.rubricId);
      setRubric(rubricRes.data);
    } catch (error) {
      console.error("Lỗi tải rubric:", error);
      setRubric(null);
    }
  };

  const handleLevelSelect = (criteriaId: string, levelId: string, score: number | null) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [criteriaId]: levelId,
    }));
    setCriteriaScores((prev) => ({
      ...prev,
      [criteriaId]: score || 0,
    }));
  };

  const handleScoreChange = (criterionId: string, score: number) => {
    setCriteriaScores((prev) => ({
      ...prev,
      [criterionId]: score,
    }));
  };

  const totalScore = useMemo(
    () => Object.values(criteriaScores).reduce((sum, value) => sum + (value || 0), 0),
    [criteriaScores],
  );

  const hasSubmissionContent = Boolean(activeSubmission?.fileUrl || activeSubmission?.submittedLink);

  const handleSaveGrade = async () => {
    if (!assessmentId || !activeSubmission || !rubric || !activeSubmission.submitted) {
      alert("Vui lòng chọn sinh viên đã nộp bài.");
      return;
    }

    try {
      setSaving(true);
      await submitStudentGrade({
        studentId: activeSubmission.studentId,
        assessmentId,
        rubricId: rubric.id,
        scores: criteriaScores,
        totalScore,
      });
      alert("Chấm điểm thành công!");
      await loadSubmissions();
    } catch (error) {
      console.error("Lỗi khi lưu điểm:", error);
      alert("Lỗi khi lưu điểm");
    } finally {
      setSaving(false);
    }
  };

  const togglePane = (pane: Exclude<ExpandedPane, "none">) => {
    setExpandedPane((prev) => (prev === pane ? "none" : pane));
  };

  const showSubmissionPane = expandedPane === "none" || expandedPane === "submission";
  const showRubricPane = expandedPane === "none" || expandedPane === "rubric";

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="grid h-full grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Chấm điểm
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Danh sách sinh viên</h2>
            <p className="mt-1 text-sm text-slate-500">
              Lọc nhanh theo trạng thái nộp bài và tìm theo MSSV.
            </p>

            <div className="mt-4 space-y-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchStudentId}
                  onChange={(event) => setSearchStudentId(event.target.value)}
                  placeholder="Tìm theo MSSV..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const isActive = submissionFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSubmissionFilter(option.value)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Đang tải dữ liệu...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Không có sinh viên phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub) => {
                  const isActive = activeSubmission?.studentId === sub.studentId;
                  const hasFile = Boolean(sub.fileUrl);
                  const hasLink = Boolean(sub.submittedLink);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubmission(sub)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-emerald-300 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{sub.studentId}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(sub.submittedAt)}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            sub.submitted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {getSubmissionBadge(sub)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full px-2.5 py-1 font-medium ${
                            hasFile ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {hasFile ? "Có file" : "Không file"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 font-medium ${
                            hasLink ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {hasLink ? "Có link" : "Không link"}
                        </span>
                      </div>

                      {isActive ? (
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Đang xem bài làm
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <h1 className="text-xl font-bold text-slate-900">Chấm điểm bằng rubric</h1>
            <p className="mt-1 text-sm text-slate-500">
              Bạn có thể phóng to riêng phần bài làm hoặc phần rubric để xem toàn chiều ngang.
            </p>
          </div>

          {!activeSubmission ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-700">Chọn một sinh viên để bắt đầu chấm.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Danh sách bên trái đã hỗ trợ tìm theo MSSV và lọc sinh viên đã nộp hoặc chưa nộp.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`grid min-h-0 flex-1 ${
                expandedPane === "none"
                  ? "grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
                  : "grid-cols-1"
              }`}
            >
              {showSubmissionPane ? (
                <section
                  className={`flex min-h-0 flex-col bg-white ${
                    expandedPane === "none" ? "border-b border-slate-200 xl:border-b-0 xl:border-r" : ""
                  }`}
                >
                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Bài làm sinh viên</p>
                        <p className="mt-1 text-sm text-slate-500">Sinh viên: {activeSubmission.studentId}</p>
                        <p className="mt-1 text-sm text-slate-500">Nộp lúc: {formatDate(activeSubmission.submittedAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => togglePane("submission")}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {expandedPane === "submission" ? (
                            <>
                              <Minimize2 className="h-4 w-4" />
                              Thu gọn
                            </>
                          ) : (
                            <>
                              <Expand className="h-4 w-4" />
                              Toàn màn hình
                            </>
                          )}
                        </button>
                        {activeSubmission.fileUrl ? (
                          <a
                            href={activeSubmission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Mở file
                          </a>
                        ) : null}
                        {activeSubmission.submittedLink ? (
                          <a
                            href={activeSubmission.submittedLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Mở link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">Trạng thái bài nộp</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <span
                            className={`rounded-full px-3 py-1 font-medium ${
                              activeSubmission.submitted
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {activeSubmission.submitted ? "Đã nộp bài" : "Chưa nộp bài"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 font-medium ${
                              activeSubmission.fileUrl
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {activeSubmission.fileUrl ? "Đã nộp file" : "Chưa nộp file"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 font-medium ${
                              activeSubmission.submittedLink
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {activeSubmission.submittedLink ? "Đã nộp link" : "Chưa nộp link"}
                          </span>
                        </div>
                      </div>

                      {activeSubmission.submittedLink ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold text-slate-900">Link bài làm</p>
                          <a
                            href={activeSubmission.submittedLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex break-all text-sm font-medium text-emerald-700 hover:underline"
                          >
                            {activeSubmission.submittedLink}
                          </a>
                        </div>
                      ) : null}

                      {activeSubmission.fileUrl ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          {isPreviewableFile(activeSubmission.fileUrl) ? (
                            <iframe
                              src={activeSubmission.fileUrl}
                              title={`Submission ${activeSubmission.studentId}`}
                              className={`w-full rounded-xl border border-slate-200 bg-white ${
                                expandedPane === "submission" ? "h-[calc(100vh-260px)]" : "h-[680px]"
                              }`}
                            />
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                              <p className="text-sm text-slate-600">
                                Không thể xem trước trực tiếp định dạng tệp này.
                              </p>
                              <a
                                href={activeSubmission.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Mở tệp bài làm
                              </a>
                            </div>
                          )}
                        </div>
                      ) : !activeSubmission.submittedLink ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                          Sinh viên hiện chưa có file hoặc link bài làm để xem.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {showRubricPane ? (
                <section className="flex min-h-0 flex-col bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Bảng rubric chấm điểm</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {rubric?.description || "Sinh viên này chưa có rubric để chấm điểm."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePane("rubric")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {expandedPane === "rubric" ? (
                          <>
                            <Minimize2 className="h-4 w-4" />
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <Expand className="h-4 w-4" />
                            Toàn màn hình
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    {!rubric ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        {activeSubmission.submitted
                          ? "Không tải được rubric cho bài nộp này."
                          : "Sinh viên chưa nộp bài nên hiện chưa có rubric để chấm."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rubric.rows?.map((row) => (
                          <div key={row.criteriaId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {row.cloId}
                              </span>
                              <span className="text-sm font-medium text-slate-500">Trọng số: {row.weight}</span>
                            </div>

                            <p className="mt-3 font-semibold text-slate-900">{row.criteriaName}</p>

                            {row.levels && row.levels.length > 0 ? (
                              <div
                                className={`mt-4 grid gap-3 ${
                                  expandedPane === "rubric"
                                    ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                                    : "sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
                                }`}
                              >
                                {row.levels.map((level) => {
                                  const isSelected = selectedLevels[row.criteriaId] === level.levelId;

                                  return (
                                    <button
                                      key={level.levelId}
                                      type="button"
                                      onClick={() => handleLevelSelect(row.criteriaId, level.levelId, level.score)}
                                      className={`rounded-xl border p-3 text-left transition ${
                                        isSelected
                                          ? "border-emerald-400 bg-emerald-50"
                                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="font-medium text-slate-900">{level.levelName}</p>
                                          {level.description ? (
                                            <p className="mt-1 text-xs text-slate-500">{level.description}</p>
                                          ) : null}
                                        </div>
                                        <span
                                          className={`rounded-lg px-2.5 py-1 text-sm font-bold ${
                                            isSelected ? "bg-emerald-200 text-emerald-800" : "bg-white text-slate-700"
                                          }`}
                                        >
                                          {level.score ?? 0}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                                <span className="text-sm text-slate-600">Nhập điểm tay cho tiêu chí này</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={row.weight}
                                  value={criteriaScores[row.criteriaId] || ""}
                                  onChange={(event) => handleScoreChange(row.criteriaId, Number(event.target.value))}
                                  className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                  placeholder="Điểm"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Tổng điểm</span>
                      <span className="text-2xl font-bold text-emerald-600">{totalScore}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveGrade}
                      disabled={saving || !rubric || !activeSubmission || !activeSubmission.submitted}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? "Đang lưu..." : `Lưu kết quả cho ${activeSubmission.studentId}`}
                    </button>

                    {!activeSubmission.submitted ? (
                      <p className="mt-3 text-xs text-amber-700">
                        Sinh viên này chưa nộp bài, hiện chưa thể chấm điểm.
                      </p>
                    ) : !hasSubmissionContent ? (
                      <p className="mt-3 text-xs text-amber-700">
                        Bài nộp này chưa có nội dung để xem, hãy kiểm tra lại cách sinh viên nộp bài.
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
