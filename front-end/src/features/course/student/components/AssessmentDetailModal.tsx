import { ClipboardCheck, ExternalLink, FileText, MessageSquareText, NotepadTextDashed, X } from "lucide-react";

import type { RubricDTO } from "@/api/RubricApi.ts";
import type { Assessment } from "@/features/course/student/assignmentSlice";
import type { AssessmentSubmission } from "@/features/course/student/api/type.ts";

type AssessmentDetailModalProps = {
  isOpen: boolean;
  detailLoading: boolean;
  selectedSummary: Assessment | null;
  selectedAssessmentDetail: AssessmentSubmission | null;
  selectedRubric: RubricDTO | null;
  onClose: () => void;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("vi-VN");
}

function getAssessmentStatus(item: { calculatedScore: number | null; submissionId: string | null }) {
  if (item.calculatedScore !== null) {
    return "Đã chấm";
  }

  if (item.submissionId) {
    return "Đã nộp";
  }

  return "Chưa nộp";
}

function getAssessmentStatusClass(status: string) {
  if (status === "Đã chấm") {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  }

  if (status === "Đã nộp") {
    return "border border-amber-200 bg-amber-100 text-amber-700";
  }

  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function extractFileName(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/");
    return decodeURIComponent(segments[segments.length - 1] || "Tệp đính kèm");
  } catch {
    return "Tệp đính kèm";
  }
}

export default function AssessmentDetailModal({
  isOpen,
  detailLoading,
  selectedSummary,
  selectedAssessmentDetail,
  selectedRubric,
  onClose,
}: AssessmentDetailModalProps) {
  if (!isOpen) {
    return null;
  }

  const rubricDetailRows = selectedAssessmentDetail?.rubricDetails || [];
  const rubricDetailTotal = rubricDetailRows.reduce((sum, item) => sum + (item.score || 0), 0);
  const rubricDetailMax = rubricDetailRows.reduce((sum, item) => sum + (item.maxScore || 0), 0);
  const status = selectedSummary ? getAssessmentStatus(selectedSummary) : "Chưa nộp";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Chi tiết đánh giá</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedSummary?.assessmentName || "Bài tập"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-80px)] overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          {detailLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Đang tải chi tiết đánh giá...</div>
          ) : !selectedAssessmentDetail || !selectedSummary ? (
            <div className="py-16 text-center text-sm text-slate-500">Không thể tải chi tiết bài tập này.</div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50">
                <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_260px] md:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getAssessmentStatusClass(status)}`}>
                        {status}
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500">
                        Trọng số {selectedAssessmentDetail.weight} điểm
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {selectedAssessmentDetail.description || "Giảng viên chưa bổ sung mô tả chi tiết cho bài tập này."}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-lg shadow-slate-950/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Tổng quan kết quả</p>
                    <p className="mt-4 text-4xl font-bold">
                      {selectedAssessmentDetail.calculatedScore !== null ? `${selectedAssessmentDetail.calculatedScore}/10` : "--"}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">Điểm hiện tại của bạn cho bài đánh giá này.</p>

                    <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm text-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Đã nộp lúc</span>
                        <span className="text-right font-medium text-white">
                          {formatDateTime(selectedAssessmentDetail.submissionAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Hạn nộp</span>
                        <span className="text-right font-medium text-white">
                          {formatDateTime(selectedAssessmentDetail.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Hạn nộp</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                    {formatDateTime(selectedAssessmentDetail.endTime)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Đã nộp lúc</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                    {formatDateTime(selectedAssessmentDetail.submissionAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">CLO</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                    {Object.keys(selectedAssessmentDetail.clos || {}).length > 0
                      ? Object.keys(selectedAssessmentDetail.clos).join(", ")
                      : "Chưa gắn CLO"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Trạng thái</p>
                  <div className="mt-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAssessmentStatusClass(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MessageSquareText className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Nhận xét từ giảng viên</h4>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm leading-7 text-slate-600">
                      {selectedAssessmentDetail.lecturerComment || "Giảng viên chưa để lại nhận xét cho bài tập này."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Bài nộp của bạn</h4>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tệp đính kèm</p>
                      <div className="mt-2">
                        {selectedAssessmentDetail.submittedFileUrl ? (
                          <a
                            href={selectedAssessmentDetail.submittedFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                          >
                            <span className="truncate pr-4 font-medium">
                              {extractFileName(selectedAssessmentDetail.submittedFileUrl)}
                            </span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                          </a>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                            Không có tệp đính kèm.
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Liên kết bài nộp</p>
                      <div className="mt-2">
                        {selectedAssessmentDetail.submittedLink ? (
                          <a
                            href={selectedAssessmentDetail.submittedLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
                          >
                            <span className="truncate pr-4 font-medium">{selectedAssessmentDetail.submittedLink}</span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                          </a>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                            Không có liên kết đính kèm.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {rubricDetailRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-sm font-semibold">Chi tiết Rubric</h4>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      Tổng {rubricDetailTotal}/{rubricDetailMax || selectedAssessmentDetail.calculatedScore || 0}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <th className="px-4 py-3">Tiêu chí</th>
                          <th className="px-4 py-3">Mức đạt</th>
                          <th className="px-4 py-3 text-right">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {rubricDetailRows.map((item) => (
                          <tr key={`${item.criteriaId || "criterion"}-${item.levelId || "level"}`} className="align-top text-slate-700">
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">{item.criteriaName || "Chưa có tên tiêu chí"}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {item.levelName || "Chưa xác định"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-base font-bold text-slate-900">{item.score ?? 0}</span>
                              <span className="text-slate-400">/{item.maxScore ?? 0}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 text-slate-900">
                          <td className="px-4 py-4 text-base font-bold">Tổng</td>
                          <td className="px-4 py-4" />
                          <td className="px-4 py-4 text-right text-base font-bold text-emerald-700">
                            {rubricDetailTotal}/{rubricDetailMax || selectedAssessmentDetail.calculatedScore || 0}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRubric ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Rubric áp dụng</h4>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-lg font-semibold text-slate-900">{selectedRubric.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedRubric.description || "Rubric này chưa có mô tả tổng quan."}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {selectedRubric.criteria?.length ? (
                      selectedRubric.criteria.map((criterion) => (
                        <div key={criterion.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{criterion.name}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                {criterion.cloId ? `Liên kết CLO: ${criterion.cloId}` : "Tiêu chí này chưa có mô tả chi tiết."}
                              </p>
                            </div>
                            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                              {criterion.weight ? `${criterion.weight}%` : "--"}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                        Rubric chưa có tiêu chí hiển thị.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                  <div className="flex items-center gap-2 text-slate-700">
                    <NotepadTextDashed className="h-4 w-4" />
                    <span className="font-medium">Bài tập này chưa có rubric để hiển thị.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
