import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    ArrowLeft,
    Expand,
    ExternalLink,
    Loader2,
    MessageSquareText,
    Minimize2,
    Plus,
    Save,
    Search,
} from "lucide-react";
import { getRubricMatrixById } from "@/api/RubricApi";
import {
    createFeedbackTemplate,
    deleteFeedbackTemplate,
    fetchAssessmentEvidence,
    fetchFeedbackTemplates,
    fetchSubmissionStatuses,
    submitStudentGrade,
} from "@/api/GradingApi";
import type { AssessmentEvidenceDTO, FeedbackTemplateDTO, SubmissionStatusDTO } from "@/api/type";

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
    rows: RubricRowDTO[];
}

interface CriteriaGradePayload {
    criteriaId: string;
    levelId: string | null;
    scoreAchieved: number;
}

type ExpandedPane = "none" | "submission" | "rubric";
type SubmissionFilter = "ALL" | "SUBMITTED" | "NOT_SUBMITTED";
type GradingView = "grading" | "feedback";
type GradingMode = "RUBRIC" | "MANUAL";

const FILTER_OPTIONS: { value: SubmissionFilter; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "SUBMITTED", label: "Đã nộp" },
    { value: "NOT_SUBMITTED", label: "Chưa nộp" },
];

const FEEDBACK_LIBRARY_KEY = "teacher-grading-feedback-library";
const DEFAULT_FEEDBACK_LIBRARY = [
    "Cần bổ sung trích dẫn.",
    "Lập luận chưa chặt chẽ.",
    "Phân tích tốt.",
    "Cần làm rõ ví dụ minh họa.",
    "Trình bày rõ ràng, dễ theo dõi.",
];

const formatDate = (value?: string | null) => {
    if (!value) return "---";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "---";
    return date.toLocaleString("vi-VN");
};

const roundToSingleDecimal = (value?: number | null) => {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue)) return 0;
    return Math.round(numericValue * 10) / 10;
};

const formatScore = (value?: number | null) => {
    if (value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return null;
    return roundToSingleDecimal(numericValue).toFixed(1);
};

const isPreviewableFile = (url?: string | null) => {
    if (!url) return false;
    const lowered = url.toLowerCase();
    return [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".txt"].some((ext) =>
        lowered.includes(ext),
    );
};

const normalizeCriterionWeight = (weight?: number | null) => {
    const numericWeight = Number(weight ?? 0);
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) return 0;
    return numericWeight > 1 ? numericWeight / 100 : numericWeight;
};

const SubmissionFilePreview = ({
    url,
    name,
    title,
    expanded,
}: {
    url: string;
    name: string;
    title: string;
    expanded: boolean;
}) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{name}</p>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
            >
                <ExternalLink className="h-4 w-4" />
                Mở tệp
            </a>
        </div>

        {isPreviewableFile(url) ? (
            <iframe
                src={url}
                title={title}
                className={`w-full rounded-xl border border-slate-200 bg-white ${
                    expanded ? "h-[calc(100vh-300px)]" : "h-[680px]"
                }`}
            />
        ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">Không thể xem trước định dạng tệp này.</p>
                <a
                    href={url}
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
);

const sumWeightedScores = (
    gradedCriteria?: SubmissionStatusDTO["gradedCriteria"],
) => {
    if (!gradedCriteria?.length) return null;

    const total = gradedCriteria.reduce((sum, criterion) => {
        const score = Number(criterion.score ?? 0);
        return Number.isFinite(score) ? sum + score : sum;
    }, 0);

    return roundToSingleDecimal(total);
};

const getDisplaySubmissionBadge = (submission: SubmissionStatusDTO) => {
    if (!submission.submitted) return "Chưa nộp";
    if (!submission.status || submission.status === "SUBMITTED") return "Đã nộp";

    const normalizedStatus = submission.status.toUpperCase();
    if (normalizedStatus === "GRADED") return "Đã chấm";
    if (normalizedStatus === "NOT_SUBMITTED") return "Chưa nộp";

    return submission.status;
};

const isSubmissionGraded = (submission?: SubmissionStatusDTO | null) => {
    if (!submission?.submitted) return false;
    if (submission.status?.toUpperCase() === "GRADED") return true;
    return submission.totalScore !== null && submission.totalScore !== undefined;
};

const readFeedbackLibrary = () => {
    if (typeof window === "undefined") return DEFAULT_FEEDBACK_LIBRARY;

    try {
        const rawValue = window.localStorage.getItem(FEEDBACK_LIBRARY_KEY);
        if (!rawValue) return DEFAULT_FEEDBACK_LIBRARY;

        const parsedValue = JSON.parse(rawValue);
        if (!Array.isArray(parsedValue)) return DEFAULT_FEEDBACK_LIBRARY;

        const normalized = parsedValue
            .map((item) => String(item).trim())
            .filter(Boolean);

        return normalized.length > 0 ? normalized : DEFAULT_FEEDBACK_LIBRARY;
    } catch {
        return DEFAULT_FEEDBACK_LIBRARY;
    }
};

const readCurrentUserId = () => {
    if (typeof window === "undefined") return null;

    try {
        const rawValue = window.localStorage.getItem("user");
        if (!rawValue) return null;

        const parsedValue = JSON.parse(rawValue);
        return typeof parsedValue?.userId === "string" && parsedValue.userId.trim()
            ? parsedValue.userId.trim()
            : null;
    } catch {
        return null;
    }
};

export default function TeacherGrading() {
    const { id: offeringId, assessmentId } = useParams<{ id: string; assessmentId: string }>();

    const [submissions, setSubmissions] = useState<SubmissionStatusDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [rubric, setRubric] = useState<RubricDTO | null>(null);
    const [activeSubmission, setActiveSubmission] = useState<SubmissionStatusDTO | null>(null);
    const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
    const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});
    const [manualScore, setManualScore] = useState("");
    const [generalComment, setGeneralComment] = useState("");
    const [feedbackLibrary, setFeedbackLibrary] = useState<FeedbackTemplateDTO[]>([]);
    const [newFeedback, setNewFeedback] = useState("");
    const [saving, setSaving] = useState(false);
    const [expandedPane, setExpandedPane] = useState<ExpandedPane>("none");
    const [searchStudentId, setSearchStudentId] = useState("");
    const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>("ALL");
    const [gradingView, setGradingView] = useState<GradingView>("grading");
    const [assessmentEvidence, setAssessmentEvidence] = useState<AssessmentEvidenceDTO | null>(null);
    const [loadingEvidence, setLoadingEvidence] = useState(false);
    const gradingMode: GradingMode = activeSubmission?.rubricId ? "RUBRIC" : "MANUAL";

    useEffect(() => {
        if (assessmentId) {
            void loadSubmissions();
        }
    }, [assessmentId]);

    useEffect(() => {
        void loadFeedbackLibrary();
    }, []);

    useEffect(() => {
        if (!activeSubmission) {
            setManualScore("");
            setGeneralComment("");
            setGradingView("grading");
            return;
        }

        setManualScore(formatScore(activeSubmission.totalScore) ?? "");
        setGeneralComment(activeSubmission.comment ?? "");
        setGradingView(isSubmissionGraded(activeSubmission) ? "feedback" : "grading");
    }, [activeSubmission]);

    const loadSubmissions = async () => {
        if (!assessmentId) return;
        setLoading(true);
        try {
            const data = await fetchSubmissionStatuses(assessmentId);
            const nextSubmissions = Array.isArray(data)
                ? data.map((submission) => ({
                    ...submission,
                    gradedCriteria: submission.gradedCriteria?.map((criterion) => ({
                        ...criterion,
                        score:
                            criterion.score === null || criterion.score === undefined
                                ? criterion.score
                                : roundToSingleDecimal(criterion.score),
                    })),
                    totalScore: (() => {
                        const roundedTotal =
                            submission.totalScore === null || submission.totalScore === undefined
                                ? submission.totalScore
                                : roundToSingleDecimal(submission.totalScore);
                        const rubricWeightedTotal = sumWeightedScores(submission.gradedCriteria);

                        if (
                            roundedTotal !== null &&
                            roundedTotal !== undefined &&
                            roundedTotal > 10 &&
                            rubricWeightedTotal !== null &&
                            rubricWeightedTotal <= 10
                        ) {
                            return rubricWeightedTotal;
                        }

                        return roundedTotal ?? rubricWeightedTotal;
                    })(),
                }))
                : [];

            setSubmissions(nextSubmissions);
            setActiveSubmission((current) =>
                current ? nextSubmissions.find((item) => item.studentId === current.studentId) ?? null : null,
            );
        } catch (error) {
            console.error("Lỗi tải bài nộp:", error);
            setSubmissions([]);
            setActiveSubmission(null);
        } finally {
            setLoading(false);
        }
    };

    const loadFeedbackLibrary = async () => {
        const userId = readCurrentUserId();
        if (!userId) {
            setFeedbackLibrary([]);
            return;
        }

        try {
            const templates = await fetchFeedbackTemplates(userId);
            setFeedbackLibrary(Array.isArray(templates) ? templates : []);
        } catch (error) {
            console.error("Lỗi tải thư viện nhận xét mẫu:", error);
            setFeedbackLibrary([]);
        }
    };

    const loadAssessmentEvidence = async (studentId: string, submittedAt?: string | null) => {
        if (!offeringId) {
            setAssessmentEvidence(null);
            return;
        }
        setLoadingEvidence(true);
        try {
            setAssessmentEvidence(await fetchAssessmentEvidence(offeringId, studentId, submittedAt));
        } catch (error) {
            console.error("Không thể tải minh chứng đánh giá:", error);
            setAssessmentEvidence(null);
        } finally {
            setLoadingEvidence(false);
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

    const gradedCriteriaById = useMemo(() => {
        if (!activeSubmission?.gradedCriteria?.length) return {};

        return activeSubmission.gradedCriteria.reduce<
            Record<
                string,
                {
                    levelId?: string | null;
                    score?: number | null;
                }
            >
        >((accumulator, criterion) => {
            accumulator[criterion.criteriaId] = {
                levelId: criterion.levelId,
                score: criterion.score,
            };
            return accumulator;
        }, {});
    }, [activeSubmission]);

    const totalScore = useMemo(() => {
        if (!rubric?.rows?.length) {
            return Object.values(criteriaScores).reduce((sum, value) => sum + (value || 0), 0);
        }

        return rubric.rows.reduce((sum, row) => {
            const editedScore = criteriaScores[row.criteriaId];
            if (editedScore !== undefined) {
                return sum + Number(editedScore || 0) * normalizeCriterionWeight(row.weight);
            }

            const existingWeightedScore = Number(gradedCriteriaById[row.criteriaId]?.score ?? 0);
            return sum + (Number.isFinite(existingWeightedScore) ? existingWeightedScore : 0);
        }, 0);
    }, [criteriaScores, gradedCriteriaById, rubric]);

    const hasEditedScores = Object.keys(criteriaScores).length > 0;
    const parsedManualScore = manualScore.trim() === "" ? null : Number(manualScore);
    const displayedTotalScore = gradingMode === "MANUAL"
        ? roundToSingleDecimal(parsedManualScore ?? 0)
        : hasEditedScores
            ? roundToSingleDecimal(totalScore)
            : roundToSingleDecimal(activeSubmission?.totalScore ?? 0);

    const hasSubmissionContent = Boolean(
        activeSubmission?.attachments?.length ||
        activeSubmission?.fileUrl ||
        activeSubmission?.submittedLink,
    );
    const showSubmissionPane = expandedPane === "none" || expandedPane === "submission";
    const showRubricPane = expandedPane === "none" || expandedPane === "rubric";
    const canShowFeedback = isSubmissionGraded(activeSubmission);

    const handleSelectSubmission = async (submission: SubmissionStatusDTO) => {
        try {
            setActiveSubmission(submission);
            setCriteriaScores({});
            setSelectedLevels({});
            setManualScore(formatScore(submission.totalScore) ?? "");
            setGradingView(isSubmissionGraded(submission) ? "feedback" : "grading");
            void loadAssessmentEvidence(submission.studentId, submission.submittedAt);

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

    const handleAppendFeedback = (feedback: string) => {
        const trimmedFeedback = feedback.trim();
        if (!trimmedFeedback) return;

        setGeneralComment((current) =>
            current.trim() ? `${current.trim()}\n${trimmedFeedback}` : trimmedFeedback,
        );
    };

    const handleAddFeedbackTemplate = async () => {
        const userId = readCurrentUserId();
        const trimmedFeedback = newFeedback.trim();
        if (!trimmedFeedback || !userId) return;

        if (feedbackLibrary.some((item) => item.content.toLowerCase() === trimmedFeedback.toLowerCase())) {
            setNewFeedback("");
            return;
        }

        try {
            const savedTemplate = await createFeedbackTemplate({
                userId,
                content: trimmedFeedback,
            });
            setFeedbackLibrary((current) => [savedTemplate, ...current]);
            setNewFeedback("");
        } catch (error) {
            console.error("Lỗi lưu nhận xét mẫu:", error);
            alert("Lỗi khi lưu nhận xét mẫu");
        }
    };

    const handleRemoveFeedbackTemplate = async (template: FeedbackTemplateDTO) => {
        const userId = readCurrentUserId();
        if (!userId) return;

        try {
            await deleteFeedbackTemplate(template.id, userId);
            setFeedbackLibrary((current) => current.filter((item) => item.id !== template.id));
        } catch (error) {
            console.error("Lỗi xóa nhận xét mẫu:", error);
            alert("Lỗi khi xóa nhận xét mẫu");
        }
    };

    const buildCriteriaGradesPayload = (): CriteriaGradePayload[] => {
        if (!rubric?.rows?.length) return [];

        return rubric.rows.flatMap((row) => {
            const hasLevels = Array.isArray(row.levels) && row.levels.length > 0;
            const selectedLevelId = selectedLevels[row.criteriaId] ?? gradedCriteriaById[row.criteriaId]?.levelId ?? null;
            const editedScore = criteriaScores[row.criteriaId];
            const existingWeightedScore = gradedCriteriaById[row.criteriaId]?.score;

            let calculatedScore: number | null = null;

            if (editedScore !== undefined) {
                calculatedScore = hasLevels
                    ? roundToSingleDecimal(Number(editedScore || 0) * normalizeCriterionWeight(row.weight))
                    : roundToSingleDecimal(Number(editedScore || 0));
            } else if (existingWeightedScore !== null && existingWeightedScore !== undefined) {
                calculatedScore = roundToSingleDecimal(Number(existingWeightedScore || 0));
            }

            if (calculatedScore === null || !Number.isFinite(calculatedScore)) {
                return [];
            }

            return [{
                criteriaId: row.criteriaId,
                levelId: selectedLevelId ?? null,
                scoreAchieved: calculatedScore,
            }];
        });
    };

    const handleSaveGrade = async () => {
        if (!assessmentId || !activeSubmission || !activeSubmission.submitted) {
            alert("Vui lòng chọn sinh viên đã nộp bài.");
            return;
        }

        if (gradingMode === "RUBRIC" && !rubric) {
            alert("Không tải được rubric của bài đánh giá. Vui lòng thử tải lại trước khi chấm điểm.");
            return;
        }

        if (
            gradingMode === "MANUAL" &&
            (parsedManualScore === null || !Number.isFinite(parsedManualScore) || parsedManualScore < 0 || parsedManualScore > 10)
        ) {
            alert("Vui lòng nhập điểm hợp lệ từ 0 đến 10.");
            return;
        }

        try {
            setSaving(true);
            await submitStudentGrade({
                submissionId: activeSubmission.id,
                studentId: activeSubmission.studentId,
                assessmentId,
                rubricId: gradingMode === "RUBRIC" ? rubric?.id ?? null : null,
                scores: gradingMode === "RUBRIC" ? criteriaScores : {},
                criteriaGrades: gradingMode === "RUBRIC" ? buildCriteriaGradesPayload() : [],
                totalScore: displayedTotalScore,
                generalComment: generalComment.trim(),
            });
            alert("Chấm điểm thành công!");
            await loadSubmissions();
            setGradingView("feedback");
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

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <div className="grid h-full grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            Chấm điểm
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-slate-900">Danh sách sinh viên</h2>
                        <p className="mt-1 text-sm text-slate-500">Lọc theo trạng thái hoặc MSSV.</p>

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
                                Đang tải...
                            </div>
                        ) : filteredSubmissions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                                Không có sinh viên phù hợp với bộ lọc hiện tại.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredSubmissions.map((sub) => (
                                    <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => handleSelectSubmission(sub)}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${
                                            activeSubmission?.studentId === sub.studentId
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
                        {getDisplaySubmissionBadge(sub)}
                      </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span
                          className={`rounded-full px-2.5 py-1 font-medium ${
                              sub.totalScore !== null && sub.totalScore !== undefined
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {sub.totalScore !== null && sub.totalScore !== undefined
                            ? `Điểm ${formatScore(sub.totalScore)}`
                            : "Chưa có điểm"}
                      </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 font-medium ${
                                                    (sub.attachments?.some((item) => item.type === "FILE") || sub.fileUrl)
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                        {sub.attachments?.some((item) => item.type === "FILE") || sub.fileUrl ? "Có file" : "Không file"}
                      </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 font-medium ${
                                                    sub.attachments?.some((item) => item.type === "LINK") || sub.submittedLink
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                        {sub.attachments?.some((item) => item.type === "LINK") || sub.submittedLink ? "Có link" : "Không link"}
                      </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex min-h-0 flex-col overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-5 py-4">
                        <h1 className="text-xl font-bold text-slate-900">Chấm bài sinh viên</h1>
                    </div>

                    {!activeSubmission ? (
                        <div className="flex flex-1 items-center justify-center px-6 text-center">
                            <div>
                                <p className="text-lg font-semibold text-slate-700">Chọn một sinh viên để bắt đầu chấm.</p>
                                <p className="mt-2 text-sm text-slate-500">Danh sách bên trái hỗ trợ lọc theo trạng thái và MSSV.</p>
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
                                                <p className="text-sm font-semibold text-slate-900">Bài làm</p>
                                                <p className="mt-1 text-sm text-slate-500">MSSV: {activeSubmission.studentId}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Nộp lúc: {formatDate(activeSubmission.submittedAt)}
                                                </p>
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
                                                <p className="text-sm font-semibold text-slate-900">Trạng thái</p>
                                                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <span
                              className={`rounded-full px-3 py-1 font-medium ${
                                  activeSubmission.submitted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {activeSubmission.submitted ? "Đã nộp" : "Chưa nộp"}
                          </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-medium ${
                                                            activeSubmission.attachments?.some((item) => item.type === "FILE") || activeSubmission.fileUrl
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                            {activeSubmission.attachments?.some((item) => item.type === "FILE") || activeSubmission.fileUrl ? "Có file" : "Không file"}
                          </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 font-medium ${
                                                            activeSubmission.attachments?.some((item) => item.type === "LINK") || activeSubmission.submittedLink
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                            {activeSubmission.attachments?.some((item) => item.type === "LINK") || activeSubmission.submittedLink ? "Có link" : "Không link"}
                          </span>
                                                </div>
                                            </div>

                                            {activeSubmission.submitted ? (
                                                <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">Minh chứng đánh giá cá nhân</p>
                                                            <p className="mt-1 text-xs text-slate-500">Tự động tổng hợp từ công việc nhóm để hỗ trợ chấm rubric cá nhân hóa.</p>
                                                        </div>
                                                        {assessmentEvidence ? <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Hoàn thành {assessmentEvidence.completionRate.toFixed(1)}%</span> : null}
                                                    </div>

                                                    {loadingEvidence ? (
                                                        <div className="flex min-h-28 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tổng hợp minh chứng...</div>
                                                    ) : assessmentEvidence ? (
                                                        <div className="mt-4 space-y-4">
                                                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                                                {[
                                                                    { label: "Task được giao", value: assessmentEvidence.totalAssignedTasks, tone: "text-slate-900" },
                                                                    { label: "Đã hoàn thành", value: assessmentEvidence.completedTasks, tone: "text-emerald-700" },
                                                                    { label: "Hoàn thành trễ", value: assessmentEvidence.completedLateTasks, tone: "text-amber-700" },
                                                                    { label: "Quá hạn chưa xong", value: assessmentEvidence.overdueTasks, tone: "text-rose-700" },
                                                                ].map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{item.label}</p><p className={`mt-1 text-xl font-bold ${item.tone}`}>{item.value}</p></div>)}
                                                            </div>
                                                            <div>
                                                                <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Tiến độ hoàn thành</span><span>{assessmentEvidence.completedOnTimeTasks} đúng hạn · {assessmentEvidence.completedLateTasks} trễ hạn</span></div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, assessmentEvidence.completionRate))}%` }} /></div>
                                                            </div>
                                                            {assessmentEvidence.tasks.length ? (
                                                                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                                                    {assessmentEvidence.tasks.map((task) => <div key={task.taskId} className="flex flex-col gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{task.title}</p><p className="mt-0.5 text-xs text-slate-500">{task.groupName || "Nhóm"} · Hạn: {formatDate(task.deadline)}</p></div><span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${task.completedLate ? "bg-amber-100 text-amber-700" : task.overdue ? "bg-rose-100 text-rose-700" : task.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{task.completedLate ? "Hoàn thành trễ" : task.overdue ? "Đang quá hạn" : task.status === "COMPLETED" ? "Đúng hạn" : task.status === "IN_PROGRESS" ? "Đang làm" : "Chưa làm"}</span></div>)}
                                                                </div>
                                                            ) : <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">Sinh viên chưa có task cá nhân để tổng hợp.</p>}
                                                        </div>
                                                    ) : <p className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">Không tải được dữ liệu minh chứng.</p>}
                                                </div>
                                            ) : null}

                                            {activeSubmission.attachments?.length ? (
                                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                    <p className="text-sm font-semibold text-slate-900">Tệp và liên kết đã nộp</p>
                                                    <div className="mt-3 space-y-2">
                                                        {activeSubmission.attachments.map((item) => (
                                                            <a
                                                                key={item.id}
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex w-full break-all rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-emerald-700 hover:bg-slate-50"
                                                            >
                                                                {item.type === "FILE" ? item.originalName || item.url : item.url}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

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

                                            {activeSubmission.attachments
                                                ?.filter((item) => item.type === "FILE")
                                                .map((file, index) => (
                                                    <SubmissionFilePreview
                                                        key={file.id || `${file.url}-${index}`}
                                                        url={file.url}
                                                        name={file.originalName || `Tệp bài làm ${index + 1}`}
                                                        title={`Submission ${activeSubmission.studentId} - file ${index + 1}`}
                                                        expanded={expandedPane === "submission"}
                                                    />
                                                ))}

                                            {!activeSubmission.attachments?.some((item) => item.type === "FILE") && activeSubmission.fileUrl ? (
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
                                                                Không thể xem trước định dạng tệp này.
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
                                                    Sinh viên chưa có file hoặc link để xem.
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
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {gradingMode === "MANUAL" ? "Chấm điểm thông thường" : "Bảng chấm rubric"}
                                                </p>
                                                {gradingMode === "RUBRIC" && rubric?.description ? (
                                                    <p className="mt-1 text-sm text-slate-500">{rubric.description}</p>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
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
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5">
                                        {gradingMode === "MANUAL" ? (
                                            <div className="mx-auto max-w-3xl space-y-5">
                                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <label htmlFor="manual-score" className="text-sm font-semibold text-slate-900">
                                                        Điểm bài làm <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <input
                                                            id="manual-score"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="0.1"
                                                            value={manualScore}
                                                            onChange={(event) => setManualScore(event.target.value)}
                                                            placeholder="0.0"
                                                            className="w-36 rounded-xl border border-slate-300 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                        />
                                                        <span className="font-semibold text-slate-500">/ 10 điểm</span>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <label htmlFor="manual-comment" className="text-sm font-semibold text-slate-900">
                                                        Nhận xét của giảng viên
                                                    </label>
                                                    <textarea
                                                        id="manual-comment"
                                                        value={generalComment}
                                                        onChange={(event) => setGeneralComment(event.target.value)}
                                                        placeholder="Nhập nhận xét, góp ý hoặc hướng dẫn cải thiện..."
                                                        className="mt-3 min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                                    />
                                                    {feedbackLibrary.length > 0 ? (
                                                        <div className="mt-4">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                Nhận xét nhanh
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {feedbackLibrary.map((feedback) => (
                                                                    <button
                                                                        key={feedback.id}
                                                                        type="button"
                                                                        onClick={() => handleAppendFeedback(feedback.content)}
                                                                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                                    >
                                                                        {feedback.content}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : !rubric ? (
                                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                                {activeSubmission.submitted
                                                    ? "Không tải được rubric cho bài nộp này."
                                                    : "Sinh viên chưa nộp bài nên chưa có rubric để chấm."}
                                            </div>
                                        ) : gradingView === "feedback" ? (
                                            <>
                                                <div className="mx-auto max-w-3xl space-y-4">
                                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                                        <p className="text-sm font-semibold text-emerald-800">Đã lưu kết quả chấm</p>
                                                        <p className="mt-1 text-sm text-emerald-700">
                                                            Tổng điểm hiện tại: {formatScore(displayedTotalScore) ?? "0.0"} điểm
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Nhận xét</p>
                                                                <p className="mt-1 text-sm text-slate-500">
                                                                    Phần nhận xét chỉ hiển thị sau khi chấm xong.
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setGradingView("grading")}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <ArrowLeft className="h-4 w-4" />
                                                                Quay lại bảng chấm
                                                            </button>
                                                        </div>

                                                        <textarea
                                                            value={generalComment}
                                                            onChange={(event) => setGeneralComment(event.target.value)}
                                                            placeholder="Nhập nhận xét cho sinh viên..."
                                                            className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                        />

                                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                                            <p className="text-sm font-semibold text-slate-900">Thư viện nhận xét mẫu</p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Chọn để chèn nhanh vào phần nhận xét.
                                                            </p>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {feedbackLibrary.map((feedback) => (
                                                                    <div
                                                                        key={feedback.id}
                                                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAppendFeedback(feedback.content)}
                                                                            className="text-left hover:text-emerald-700"
                                                                        >
                                                                            {feedback.content}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveFeedbackTemplate(feedback)}
                                                                            className="text-slate-400 hover:text-rose-500"
                                                                            aria-label={`Xóa nhận xét mẫu ${feedback.content}`}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                                <input
                                                                    value={newFeedback}
                                                                    onChange={(event) => setNewFeedback(event.target.value)}
                                                                    placeholder="Tạo nhận xét mẫu mới..."
                                                                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddFeedbackTemplate}
                                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                    Lưu mẫu
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden mx-auto max-w-3xl space-y-4">
                                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                                    <p className="text-sm font-semibold text-emerald-800">ÄÃ£ lÆ°u káº¿t quáº£ cháº¥m</p>
                                                    <p className="mt-1 text-sm text-emerald-700">
                                                        Tá»•ng Ä‘iá»ƒm hiá»‡n táº¡i: {formatScore(displayedTotalScore) ?? "0.0"} Ä‘iá»ƒm
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Nháº­n xÃ©t</p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                Pháº§n nháº­n xÃ©t chá»‰ hiá»‡n thá»‹ sau khi cháº¥m xong.
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setGradingView("grading")}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                            Quay lại bảng chấm
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        value={generalComment}
                                                        onChange={(event) => setGeneralComment(event.target.value)}
                                                        placeholder="Nháº­p nháº­n xÃ©t cho sinh viÃªn..."
                                                        className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                    />

                                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-sm font-semibold text-slate-900">ThÆ° viá»‡n nháº­n xÃ©t máº«u</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Chọn để chèn nhanh vào phần nhận xét.
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                                {feedbackLibrary.map((feedback) => (
                                                                    <div
                                                                        key={feedback.id}
                                                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAppendFeedback(feedback.content)}
                                                                            className="text-left hover:text-emerald-700"
                                                                        >
                                                                            {feedback.content}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveFeedbackTemplate(feedback)}
                                                                            className="text-slate-400 hover:text-rose-500"
                                                                            aria-label={`XÃ³a nháº­n xÃ©t máº«u ${feedback.content}`}
                                                                        >
                                                                            Ã—
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                        </div>

                                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                            <input
                                                                value={newFeedback}
                                                                onChange={(event) => setNewFeedback(event.target.value)}
                                                                placeholder="Táº¡o nháº­n xÃ©t máº«u má»›i..."
                                                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddFeedbackTemplate}
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                LÆ°u máº«u
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                {rubric.rows?.map((row) => (
                                                    <div
                                                        key={row.criteriaId}
                                                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {row.cloId}
                              </span>
                                                            <span className="text-sm font-medium text-slate-500">
                                Trọng số: {row.weight}
                              </span>
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
                                                                    const matchedLevelId = gradedCriteriaById[row.criteriaId]?.levelId;
                                                                    const isSelected = selectedLevels[row.criteriaId] === level.levelId;
                                                                    const isMatched = matchedLevelId === level.levelId;

                                                                    return (
                                                                        <button
                                                                            key={level.levelId}
                                                                            type="button"
                                                                            onClick={() => handleLevelSelect(row.criteriaId, level.levelId, level.score)}
                                                                            className={`rounded-xl border p-3 text-left transition ${
                                                                                isSelected
                                                                                    ? "border-emerald-500 bg-emerald-100 shadow-sm"
                                                                                    : isMatched
                                                                                        ? "border-amber-300 bg-amber-50"
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
                                                                                        isSelected
                                                                                            ? "bg-emerald-200 text-emerald-800"
                                                                                            : isMatched
                                                                                                ? "bg-amber-100 text-amber-800"
                                                                                                : "bg-white text-slate-700"
                                                                                    }`}
                                                                                >
                                          {formatScore(level.score) ?? "0.0"}
                                        </span>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                                                                <span className="text-sm text-slate-600">Nhập điểm tay</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={row.weight}
                                                                    step="0.1"
                                                                    value={
                                                                        criteriaScores[row.criteriaId] ??
                                                                        gradedCriteriaById[row.criteriaId]?.score ??
                                                                        ""
                                                                    }
                                                                    onChange={(event) => handleScoreChange(row.criteriaId, Number(event.target.value))}
                                                                    className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                                                    placeholder="Điểm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Nhận xét</p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                Có thể nhập tay hoặc chọn nhanh từ thư viện mẫu.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        value={generalComment}
                                                        onChange={(event) => setGeneralComment(event.target.value)}
                                                        placeholder="Nhập nhận xét cho sinh viên..."
                                                        className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                    />

                                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-sm font-semibold text-slate-900">Thư viện nhận xét mẫu</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Chọn để chèn nhanh vào phần nhận xét.
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {feedbackLibrary.map((feedback) => (
                                                                <div
                                                                    key={feedback.id}
                                                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAppendFeedback(feedback.content)}
                                                                        className="text-left hover:text-emerald-700"
                                                                    >
                                                                        {feedback.content}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFeedbackTemplate(feedback)}
                                                                        className="text-slate-400 hover:text-rose-500"
                                                                        aria-label={`Xóa nhận xét mẫu ${feedback.content}`}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                                            <input
                                                                value={newFeedback}
                                                                onChange={(event) => setNewFeedback(event.target.value)}
                                                                placeholder="Tạo nhận xét mẫu mới..."
                                                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddFeedbackTemplate}
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Lưu mẫu
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">Tổng điểm</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                        {formatScore(displayedTotalScore) ?? "0.0"}
                      </span>
                                        </div>

                                        {gradingMode === "RUBRIC" && gradingView === "grading" && canShowFeedback ? (
                                            <button
                                                type="button"
                                                onClick={() => setGradingView("feedback")}
                                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-[0px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                            >
                                                <MessageSquareText className="h-4 w-4" />
                                                <span className="text-sm">Xem nhận xét đã lưu</span>
                                                Xem nháº­n xÃ©t Ä‘Ã£ lÆ°u
                                            </button>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={handleSaveGrade}
                                            disabled={
                                                saving ||
                                                !activeSubmission ||
                                                !activeSubmission.submitted ||
                                                (gradingMode === "RUBRIC" && !rubric)
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Save className="h-5 w-5" />
                                            {saving
                                                ? "Đang lưu..."
                                                : gradingMode === "MANUAL"
                                                    ? `Lưu điểm và nhận xét cho ${activeSubmission.studentId}`
                                                    : `Lưu kết quả rubric cho ${activeSubmission.studentId}`}
                                        </button>

                                        {!activeSubmission.submitted ? (
                                            <p className="mt-3 text-xs text-amber-700">
                                                Sinh viên này chưa nộp bài nên chưa thể chấm điểm.
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
