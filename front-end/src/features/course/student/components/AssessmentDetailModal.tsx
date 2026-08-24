import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ClipboardCheck, ExternalLink, FileText, MessageSquareText, NotepadTextDashed, X } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { RubricDTO } from "@/api/RubricApi.ts";
import type { CloResponse } from "@/features/rubric/rubricApi.ts";
import type { Assessment } from "@/features/course/student/assignmentSlice";
import type { AssessmentSubmission } from "@/features/course/student/api/type.ts";

type AssessmentDetailModalProps = {
  isOpen: boolean;
  detailLoading: boolean;
  selectedSummary: Assessment | null;
  selectedAssessmentDetail: AssessmentSubmission | null;
  selectedRubric: RubricDTO | null;
  rubricClos: CloResponse[];
  onClose: () => void;
};

type RubricLevelLike = {
  id?: string | null;
  levelId?: string | null;
  name?: string | null;
  levelName?: string | null;
  description?: string | null;
  score?: number | null;
  minScore?: number | null;
  maxScore?: number | null;
  orderIndex?: number | null;
};

type RubricCriterionLike = {
  id?: string | null;
  criteriaId?: string | null;
  name?: string | null;
  criteriaName?: string | null;
  cloId?: string | null;
  weight?: number | null;
  levels?: RubricLevelLike[] | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN");
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";

  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatWeight(weight?: number | null) {
  if (weight === null || weight === undefined || Number.isNaN(weight)) return "--";

  const normalized = weight <= 1 ? weight * 100 : weight;
  return `${formatNumber(normalized)}%`;
}

function getAssessmentStatus(item: { calculatedScore: number | null; submissionId: string | null }) {
  if (item.calculatedScore !== null) return "Đã chấm";
  if (item.submissionId) return "Đã nộp";
  return "Chưa nộp";
}

function getAssessmentStatusClass(status: string) {
  if (status === "Đã chấm") return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  if (status === "Đã nộp") return "border border-amber-200 bg-amber-100 text-amber-700";
  return "border border-slate-200 bg-slate-100 text-slate-700";
}

function extractFileName(url?: string | null) {
  if (!url) return null;

  try {
    const cleanUrl = url.split("?")[0];
    const segments = cleanUrl.split("/");
    return decodeURIComponent(segments[segments.length - 1] || "Tệp đính kèm");
  } catch {
    return "Tệp đính kèm";
  }
}

function normalizeText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function resolveCriterionId(criterion?: RubricCriterionLike | null) {
  return criterion?.id || criterion?.criteriaId || "";
}

function resolveCriterionName(criterion?: RubricCriterionLike | null) {
  return criterion?.name || criterion?.criteriaName || "";
}

function resolveLevelId(level?: RubricLevelLike | null) {
  return level?.levelId || level?.id || "";
}

function resolveLevelName(level?: RubricLevelLike | null) {
  return level?.levelName || level?.name || "";
}

function getLevelMinScore(level?: RubricLevelLike | null) {
  return Number(level?.minScore ?? level?.score ?? 0);
}

function getLevelMaxScore(level?: RubricLevelLike | null) {
  return Number(level?.maxScore ?? level?.score ?? 0);
}

function formatLevelRange(level?: RubricLevelLike | null) {
  if (!level) return "--";
  const min = getLevelMinScore(level);
  const max = getLevelMaxScore(level);
  return min === max ? `${formatNumber(max)}/10` : `${formatNumber(min)} - ${formatNumber(max)}/10`;
}

function normalizeCriterionWeight(weight?: number | null) {
  const value = Number(weight || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value <= 1 ? value : value / 100;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { criterion: string; score: number; maxScore: number; percentage: number } }>;
}) {
  if (!active || !payload?.length || !payload[0]?.payload) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.criterion}</p>
      <p className="mt-1 text-xs font-semibold text-emerald-700">{formatNumber(item.percentage)}%</p>
      <p className="mt-1 text-xs text-slate-600">
        {formatNumber(item.score)}/{formatNumber(item.maxScore)}
      </p>
    </div>
  );
}

export default function AssessmentDetailModal({
  isOpen,
  detailLoading,
  selectedSummary,
  selectedAssessmentDetail,
  selectedRubric,
  rubricClos,
  onClose,
}: AssessmentDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rubricDetailRows = selectedAssessmentDetail?.rubricDetails || [];
  const cloEntries = Object.entries(selectedAssessmentDetail?.clos || {}).filter(([code]) => Boolean(code?.trim()));
  const rawCriteria = ((selectedRubric?.criteria || []) as RubricCriterionLike[]).filter(Boolean);
  const cloNameById = new Map(
    rubricClos.map((clo) => [String(clo.cloId), clo.cloName?.trim() || clo.cloCode?.trim() || "CLO không xác định"]),
  );
  const rubricCriteriaById = new Map(
    rawCriteria
      .map((criterion) => [String(resolveCriterionId(criterion)), criterion] as const)
      .filter(([criterionId]) => Boolean(criterionId)),
  );
  const rubricCriteriaByName = new Map(
    rawCriteria
      .map((criterion) => [normalizeText(resolveCriterionName(criterion)), criterion] as const)
      .filter(([criterionName]) => Boolean(criterionName)),
  );
  const rubricTitle =
    (selectedRubric as (RubricDTO & { name?: string }) | null)?.rubricName ||
    (selectedRubric as (RubricDTO & { name?: string }) | null)?.name ||
    "Rubric áp dụng";
  const status = selectedSummary ? getAssessmentStatus(selectedSummary) : "Chưa nộp";

  const rubricDetailDisplayRows = rubricDetailRows.map((item) => {
    const matchedCriterion =
      (item.criteriaId ? rubricCriteriaById.get(String(item.criteriaId)) : undefined) ||
      rubricCriteriaByName.get(normalizeText(item.criteriaName)) ||
      rawCriteria.find((criterion) => {
        const criterionName = normalizeText(resolveCriterionName(criterion));
        const detailName = normalizeText(item.criteriaName);
        return Boolean(criterionName && detailName) && (criterionName.includes(detailName) || detailName.includes(criterionName));
      });
    const criterionWeight = normalizeCriterionWeight(matchedCriterion?.weight);
    const weightedMaxScore = criterionWeight > 0 ? criterionWeight * 10 : item.maxScore;
    const storedRawScore = item.rawScore === null || item.rawScore === undefined ? null : Number(item.rawScore);
    const scoreOnTenPointScale = storedRawScore !== null && Number.isFinite(storedRawScore)
      ? Math.min(10, Math.max(0, storedRawScore))
      : criterionWeight > 0
        ? Math.min(10, Math.max(0, Number(item.score || 0) / criterionWeight))
        : Number(item.score || 0);

    return {
      ...item,
      matchedCriterion,
      weightedMaxScore,
      scoreOnTenPointScale,
    };
  });

  const rubricDetailTotal = rubricDetailDisplayRows.reduce((sum, item) => sum + (item.score || 0), 0);
  const rubricDetailMax = rubricDetailDisplayRows.reduce((sum, item) => sum + (item.weightedMaxScore || 0), 0);
  const rubricRadarData = rubricDetailDisplayRows.map((item, index) => {
    const score = Number(item.score || 0);
    const maxScore = Number(item.weightedMaxScore || 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    return {
      criterion: item.criteriaName || resolveCriterionName(item.matchedCriterion) || `Tiêu chí ${index + 1}`,
      score,
      maxScore,
      percentage,
      fullMark: 100,
    };
  });
  const rubricDetailByCriterionId = new Map(
    rubricDetailDisplayRows
      .filter((item) => Boolean(item.criteriaId))
      .map((item) => [String(item.criteriaId), item] as const),
  );
  const rubricDetailByCriterionName = new Map(
    rubricDetailDisplayRows.map((item) => [normalizeText(item.criteriaName), item] as const),
  );
  const matrixLevelNames = Array.from(
    new Map(
      rawCriteria.flatMap((criterion) => criterion.levels || []).map((level) => [normalizeText(resolveLevelName(level)), resolveLevelName(level)]),
    ).values(),
  ).filter(Boolean).sort((left, right) => {
    const findMaxScore = (levelName: string) => {
      const level = rawCriteria
        .flatMap((criterion) => criterion.levels || [])
        .find((item) => normalizeText(resolveLevelName(item)) === normalizeText(levelName));
      return getLevelMaxScore(level);
    };
    return findMaxScore(right) - findMaxScore(left);
  });
  const displayedRubricTotal = selectedAssessmentDetail?.calculatedScore ?? rubricDetailTotal;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Đóng chi tiết đánh giá"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4 md:px-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Chi tiết đánh giá</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-slate-900">
              {selectedSummary?.assessmentName || "Bài tập"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
          {detailLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Đang tải chi tiết đánh giá...</div>
          ) : !selectedAssessmentDetail || !selectedSummary ? (
            <div className="py-16 text-center text-sm text-slate-500">Không thể tải chi tiết bài này.</div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getAssessmentStatusClass(status)}`}>
                        {status}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        Trọng số {formatNumber(Number(selectedAssessmentDetail.weight))}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {selectedAssessmentDetail.description || "Chưa có mô tả chi tiết cho bài đánh giá này."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-center md:min-w-[170px]">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Điểm</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-700">
                      {selectedAssessmentDetail.calculatedScore !== null
                        ? `${formatNumber(selectedAssessmentDetail.calculatedScore)}/10`
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Hạn nộp" value={formatDateTime(selectedAssessmentDetail.endTime)} />
                <InfoCard label="Đã nộp lúc" value={formatDateTime(selectedAssessmentDetail.submissionAt)} />
                <InfoCard label="CLO" value={cloEntries.length > 0 ? `${cloEntries.length} CLO` : "Chưa gắn CLO"} />
                <InfoCard label="Trạng thái" value={status} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold">CLO liên quan</h4>
                </div>

                <div className="mt-4">
                  {cloEntries.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {cloEntries.map(([code, description]) => (
                        <div key={code} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{code}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {description || "Chưa có mô tả CLO."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                      Chưa có CLO nào được gắn cho bài đánh giá này.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MessageSquareText className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Nhận xét</h4>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-600">
                      {selectedAssessmentDetail.lecturerComment || "Chưa có nhận xét từ giảng viên."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Bài nộp</h4>
                  </div>

                  <div className="mt-4 space-y-4">
                    {Array.isArray(selectedAssessmentDetail.submittedAttachments) &&
                      selectedAssessmentDetail.submittedAttachments.length > 0 && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Tất cả tệp và liên kết</p>
                          <div className="mt-2 space-y-2">
                            {selectedAssessmentDetail.submittedAttachments.map((item: any) => (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <span className="truncate pr-4 font-medium">
                                  {item.type === "FILE"
                                    ? item.originalName || extractFileName(item.url)
                                    : item.url}
                                </span>
                                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Tệp</p>
                      <div className="mt-2">
                        {selectedAssessmentDetail.submittedFileUrl ? (
                          <a
                            href={selectedAssessmentDetail.submittedFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
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
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Liên kết</p>
                      <div className="mt-2">
                        {selectedAssessmentDetail.submittedLink ? (
                          <a
                            href={selectedAssessmentDetail.submittedLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
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

              {!selectedRubric && rubricDetailDisplayRows.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-sm font-semibold">Chi tiết rubric</h4>
                    </div>
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      Tổng {formatNumber(rubricDetailTotal)}/{formatNumber(rubricDetailMax || selectedAssessmentDetail.calculatedScore || 0)}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900">Biểu đồ mạng nhện</h5>
                        <p className="mt-1 text-xs text-slate-500">So sánh tỷ lệ hoàn thành theo từng tiêu chí rubric.</p>
                      </div>
                    </div>

                    <div className="mt-4 h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={rubricRadarData} outerRadius="72%">
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis
                            dataKey="criterion"
                            tick={{ fill: "#334155", fontSize: 12 }}
                            tickLine={false}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            tickCount={5}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip content={<RadarTooltip />} />
                          <Radar
                            name="Tỷ lệ đạt"
                            dataKey="percentage"
                            stroke="#059669"
                            fill="#10b981"
                            fillOpacity={0.35}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          <th className="px-4 py-3">Tiêu chí</th>
                          <th className="px-4 py-3">Mức đạt</th>
                          <th className="px-4 py-3 text-right">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {rubricDetailDisplayRows.map((item) => (
                          <tr key={`${item.criteriaId || "criterion"}-${item.levelId || "level"}`} className="align-top text-slate-700">
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                  {item.matchedCriterion?.cloId || "CLO N/A"}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                  Trọng số: {formatWeight(item.matchedCriterion?.weight)}
                                </span>
                              </div>
                              <p className="mt-3 font-medium text-slate-900">
                                {item.criteriaName || resolveCriterionName(item.matchedCriterion) || "Chưa có tên tiêu chí"}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {item.levelName || "Chưa xác định"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="font-semibold text-slate-900">{formatNumber(item.score)}</span>
                              <span className="text-slate-400">/{formatNumber(item.weightedMaxScore ?? 0)}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 text-slate-900">
                          <td className="px-4 py-4 font-semibold">Tổng</td>
                          <td className="px-4 py-4" />
                          <td className="px-4 py-4 text-right font-semibold">
                            {formatNumber(rubricDetailTotal)}/{formatNumber(rubricDetailMax || selectedAssessmentDetail.calculatedScore || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRubric ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold">Rubric áp dụng</h4>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{rubricTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedRubric.description || "Rubric này chưa có mô tả tổng quan."}
                    </p>
                  </div>

                  {rawCriteria.length > 0 ? (
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="min-w-[980px] w-full border-collapse text-sm">
                        <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          <tr>
                            <th className="sticky left-0 z-10 min-w-52 border-b border-r border-slate-200 bg-slate-100 px-4 py-3">Tiêu chí / CLO</th>
                            <th className="w-24 border-b border-r border-slate-200 px-3 py-3 text-center">Trọng số</th>
                            {matrixLevelNames.map((levelName) => (
                              <th key={levelName} className="min-w-44 border-b border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
                                {levelName}
                              </th>
                            ))}
                            <th className="w-28 border-b border-slate-200 px-3 py-3 text-center">Điểm /10</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {rawCriteria.map((criterion, criterionIndex) => {
                            const criterionId = String(resolveCriterionId(criterion));
                            const detail = rubricDetailByCriterionId.get(criterionId)
                              || rubricDetailByCriterionName.get(normalizeText(resolveCriterionName(criterion)));
                            const selectedLevelId = String(detail?.levelId || "");
                            const selectedLevelName = normalizeText(detail?.levelName);

                            return (
                              <tr key={criterionId || `criterion-${criterionIndex}`} className="align-top">
                                <td className="sticky left-0 z-[1] border-r border-slate-200 bg-white px-4 py-4">
                                  <p className="font-semibold text-slate-900">{resolveCriterionName(criterion) || `Tiêu chí ${criterionIndex + 1}`}</p>
                                  <span className="mt-2 inline-flex rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                                    {criterion.cloId ? cloNameById.get(String(criterion.cloId)) || "CLO không xác định" : "Chưa gắn CLO"}
                                  </span>
                                </td>
                                <td className="border-r border-slate-200 px-3 py-4 text-center font-semibold text-slate-700">
                                  {formatWeight(criterion.weight)}
                                </td>
                                {matrixLevelNames.map((levelName) => {
                                  const level = (criterion.levels || []).find(
                                    (item) => normalizeText(resolveLevelName(item)) === normalizeText(levelName),
                                  );
                                  const isSelected = Boolean(level) && (
                                    (selectedLevelId && resolveLevelId(level) === selectedLevelId)
                                    || (selectedLevelName && normalizeText(resolveLevelName(level)) === selectedLevelName)
                                  );

                                  return (
                                    <td
                                      key={`${criterionId || criterionIndex}-${levelName}`}
                                      className={`border-r border-slate-200 px-3 py-4 last:border-r-0 ${isSelected ? "bg-emerald-50 ring-2 ring-inset ring-emerald-400" : "bg-white"}`}
                                    >
                                      {level ? (
                                        <div>
                                          <div className="flex items-center justify-between gap-2">
                                            <span className={`font-semibold ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                                              {isSelected && detail ? `${formatNumber(detail.scoreOnTenPointScale)}/10` : formatLevelRange(level)}
                                            </span>
                                            {isSelected ? <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">Điểm chấm</span> : null}
                                          </div>
                                          {isSelected ? (
                                            <p className="mt-1 text-[11px] font-medium text-emerald-700">
                                              Thuộc mức {resolveLevelName(level)} ({formatLevelRange(level)})
                                            </p>
                                          ) : null}
                                          <p className="mt-2 text-xs leading-5 text-slate-600">{level.description || "Chưa có mô tả mức đánh giá."}</p>
                                        </div>
                                      ) : (
                                        <span className="text-slate-300">--</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="bg-slate-50 px-3 py-4 text-center">
                                  <span className="text-base font-bold text-emerald-700">
                                    {detail ? formatNumber(detail.scoreOnTenPointScale) : "--"}
                                  </span>
                                  <span className="text-slate-400">/10</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="border-t border-slate-200 bg-slate-50">
                          <tr>
                            <td colSpan={2 + matrixLevelNames.length} className="px-4 py-4 text-right font-semibold text-slate-700">Tổng điểm đã chấm</td>
                            <td className="px-3 py-4 text-center text-lg font-bold text-emerald-700">
                              {displayedRubricTotal !== null && displayedRubricTotal !== undefined ? formatNumber(displayedRubricTotal) : "--"}/10
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : null}

                  <div className="hidden mt-4 grid gap-3">
                    {rawCriteria.length ? (
                      rawCriteria.map((criterion, index) => (
                        <div
                          key={resolveCriterionId(criterion) || `${resolveCriterionName(criterion) || "criterion"}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                  {criterion.cloId || "CLO N/A"}
                                </span>
                              </div>
                              <p className="mt-3 font-medium text-slate-900">
                                {resolveCriterionName(criterion) || "Chưa có tên tiêu chí"}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {formatWeight(criterion.weight)}
                            </span>
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
                    <span className="font-medium">Bài này chưa có rubric để hiển thị.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
