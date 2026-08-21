import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Columns2,
    Download,
    Expand,
    ExternalLink,
    Flag,
    Loader2,
    MessageSquareText,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { getRubricMatrixById } from "@/api/RubricApi";
import { getAllClo, type CloResponse } from "@/features/rubric/rubricApi.ts";
import {
    createFeedbackTemplate,
    deleteFeedbackTemplate,
    fetchAssessmentEvidence,
    fetchFeedbackTemplates,
    fetchSubmissionStatuses,
    submitStudentGrade,
    updateFeedbackTemplate,
} from "@/api/GradingApi";
import type { AssessmentEvidenceDTO, FeedbackTemplateDTO, SubmissionStatusDTO } from "@/api/type";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import type { GroupResponse } from "@/features/course/student/api/type.ts";

interface AssessmentSummary {
    assessmentId: string;
    assessmentName: string;
    assessmentType?: string | null;
}

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

type SubmissionFilter = "ALL" | "PENDING" | "GRADED" | "NOT_SUBMITTED";
type GradingView = "grading" | "feedback";
type GradingMode = "RUBRIC" | "MANUAL";
type GradingScope = "INDIVIDUAL" | "GROUP";

const FILTER_OPTIONS: { value: SubmissionFilter; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ chấm" },
    { value: "GRADED", label: "Đã chấm" },
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
                title="Mở tệp"
                aria-label="Mở tệp"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-emerald-700 hover:bg-emerald-50"
            >
                <ExternalLink className="h-4 w-4" />
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

    const normalizedStatus = submission.status?.toUpperCase();
    if (
        normalizedStatus === "GRADED" ||
        (submission.totalScore !== null && submission.totalScore !== undefined)
    ) return "Đã chấm";
    if (normalizedStatus === "NOT_SUBMITTED") return "Chưa nộp";

    return "Chờ chấm";
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
    const [assessment, setAssessment] = useState<AssessmentSummary | null>(null);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [rubric, setRubric] = useState<RubricDTO | null>(null);
    const [clos, setClos] = useState<CloResponse[]>([]);
    const [activeSubmission, setActiveSubmission] = useState<SubmissionStatusDTO | null>(null);
    const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
    const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});
    const [manualScore, setManualScore] = useState("");
    const [generalComment, setGeneralComment] = useState("");
    const [feedbackLibrary, setFeedbackLibrary] = useState<FeedbackTemplateDTO[]>([]);
    const [newFeedback, setNewFeedback] = useState("");
    const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null);
    const [editingFeedbackContent, setEditingFeedbackContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [previewSplitPercent, setPreviewSplitPercent] = useState(50);
    const previewSplitRef = useRef<HTMLDivElement>(null);
    const [searchStudentId, setSearchStudentId] = useState("");
    const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>("PENDING");
    const [gradingView, setGradingView] = useState<GradingView>("grading");
    const [assessmentEvidence, setAssessmentEvidence] = useState<AssessmentEvidenceDTO | null>(null);
    const [loadingEvidence, setLoadingEvidence] = useState(false);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [gradingScope, setGradingScope] = useState<GradingScope>("INDIVIDUAL");
    const gradingMode: GradingMode = activeSubmission?.rubricId ? "RUBRIC" : "MANUAL";
    const isProjectAssessment = assessment?.assessmentType?.trim().toLowerCase() === "project";

    useEffect(() => {
        if (assessmentId) {
            void loadSubmissions();
        }
    }, [assessmentId]);

    useEffect(() => {
        if (!offeringId || !assessmentId) {
            setAssessment(null);
            return;
        }

        let active = true;
        const loadAssessment = async () => {
            try {
                const data = await assessmentService.getAssessmentsByOffering(offeringId);
                const items: AssessmentSummary[] = Array.isArray(data) ? data : [];
                if (active) {
                    setAssessment(items.find((item) => item.assessmentId === assessmentId) ?? null);
                }
            } catch (error) {
                console.error("Không thể tải thông tin bài đánh giá:", error);
                if (active) setAssessment(null);
            }
        };

        void loadAssessment();
        return () => {
            active = false;
        };
    }, [assessmentId, offeringId]);

    useEffect(() => {
        if (!offeringId || !isProjectAssessment) {
            setGroups([]);
            setGradingScope("INDIVIDUAL");
            return;
        }

        let active = true;
        const loadGroups = async () => {
            try {
                const data = await groupService.getGroupsByOffering(offeringId);
                if (active) setGroups(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Không thể tải danh sách nhóm để chấm đồ án:", error);
                if (active) setGroups([]);
            }
        };

        void loadGroups();
        return () => {
            active = false;
        };
    }, [isProjectAssessment, offeringId]);

    useEffect(() => {
        void loadFeedbackLibrary();
    }, []);

    useEffect(() => {
        let active = true;

        const loadClos = async () => {
            try {
                const response = await getAllClo();
                if (active) setClos(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Không thể tải danh sách CLO:", error);
                if (active) setClos([]);
            }
        };

        void loadClos();
        return () => {
            active = false;
        };
    }, []);

    const cloNameById = useMemo(
        () => new Map(clos.map((clo) => [clo.cloId, clo.cloName])),
        [clos],
    );

    const getCloName = (cloId: string) => {
        if (!cloId) return "Chưa gắn CLO";
        return cloNameById.get(cloId) || "CLO không xác định";
    };

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

    useEffect(() => {
        if (!isProjectAssessment || !activeSubmission?.submitted) {
            setAssessmentEvidence(null);
            setLoadingEvidence(false);
            return;
        }

        void loadAssessmentEvidence(activeSubmission.studentId, activeSubmission.submittedAt);
    }, [activeSubmission?.studentId, activeSubmission?.submitted, activeSubmission?.submittedAt, isProjectAssessment]);

    const filteredSubmissions = useMemo(() => {
        const keyword = searchStudentId.trim().toLowerCase();

        return submissions.filter((submission) => {
            const matchKeyword = !keyword || submission.studentId.toLowerCase().includes(keyword);
            const graded = isSubmissionGraded(submission);
            const matchFilter =
                submissionFilter === "ALL" ||
                (submissionFilter === "PENDING" && submission.submitted && !graded) ||
                (submissionFilter === "GRADED" && graded) ||
                (submissionFilter === "NOT_SUBMITTED" && !submission.submitted);

            return matchKeyword && matchFilter;
        });
    }, [searchStudentId, submissionFilter, submissions]);

    const submissionStats = useMemo(() => {
        const submitted = submissions.filter((item) => item.submitted);
        const graded = submitted.filter((item) => isSubmissionGraded(item)).length;
        return {
            total: submissions.length,
            submitted: submitted.length,
            pending: submitted.length - graded,
            graded,
        };
    }, [submissions]);

    const activeGroup = useMemo(
        () => groups.find((group) =>
            group.participants.some((participant) => participant.userId === activeSubmission?.studentId),
        ) ?? null,
        [activeSubmission?.studentId, groups],
    );

    const activeParticipant = activeGroup?.participants.find(
        (participant) => participant.userId === activeSubmission?.studentId,
    );
    const activeStudentIsLeader = activeParticipant?.role === "ADMIN" ||
        activeGroup?.createdById === activeSubmission?.studentId;

    useEffect(() => {
        if (gradingScope === "GROUP" && !activeGroup) {
            setGradingScope("INDIVIDUAL");
        }
    }, [activeGroup, gradingScope]);

    const getStudentGroup = (studentId: string) => groups.find((group) =>
        group.participants.some((participant) => participant.userId === studentId),
    );

    const isStudentGroupLeader = (studentId: string, group?: GroupResponse) => Boolean(
        group && (
            group.createdById === studentId ||
            group.participants.some((participant) => participant.userId === studentId && participant.role === "ADMIN")
        )
    );

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
    const canShowFeedback = isSubmissionGraded(activeSubmission);
    const activeFiles = activeSubmission
        ? [
            ...(activeSubmission.attachments
                ?.filter((item) => item.type === "FILE")
                .map((item) => ({ id: item.id, name: item.originalName || "Tệp bài nộp", url: item.url })) || []),
            ...(
                activeSubmission.fileUrl && !activeSubmission.attachments?.some((item) => item.type === "FILE")
                    ? [{ id: "legacy-file", name: "Tệp bài nộp", url: activeSubmission.fileUrl }]
                    : []
            ),
        ]
        : [];
    const activeLinks = activeSubmission
        ? [
            ...(activeSubmission.attachments
                ?.filter((item) => item.type === "LINK")
                .map((item) => ({ id: item.id, url: item.url })) || []),
            ...(
                activeSubmission.submittedLink && !activeSubmission.attachments?.some((item) => item.type === "LINK")
                    ? [{ id: "legacy-link", url: activeSubmission.submittedLink }]
                    : []
            ),
        ]
        : [];

    const handleSelectSubmission = async (submission: SubmissionStatusDTO) => {
        try {
            setShowEvidenceModal(false);
            setShowSubmissionModal(false);
            setActiveSubmission(submission);
            setCriteriaScores({});
            setSelectedLevels({});
            setManualScore(formatScore(submission.totalScore) ?? "");
            setGradingView(isSubmissionGraded(submission) ? "feedback" : "grading");
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
        if (!window.confirm("Xóa nhận xét mẫu này?")) return;

        try {
            await deleteFeedbackTemplate(template.id, userId);
            setFeedbackLibrary((current) => current.filter((item) => item.id !== template.id));
        } catch (error) {
            console.error("Lỗi xóa nhận xét mẫu:", error);
            alert("Lỗi khi xóa nhận xét mẫu");
        }
    };

    const handleStartEditFeedbackTemplate = (template: FeedbackTemplateDTO) => {
        setEditingFeedbackId(template.id);
        setEditingFeedbackContent(template.content);
    };

    const handleUpdateFeedbackTemplate = async () => {
        const userId = readCurrentUserId();
        const content = editingFeedbackContent.trim();
        if (!userId || editingFeedbackId === null || !content) return;

        try {
            const updatedTemplate = await updateFeedbackTemplate(editingFeedbackId, { userId, content });
            setFeedbackLibrary((current) => [
                updatedTemplate,
                ...current.filter((item) => item.id !== editingFeedbackId),
            ]);
            setEditingFeedbackId(null);
            setEditingFeedbackContent("");
        } catch (error) {
            console.error("Lỗi cập nhật nhận xét mẫu:", error);
            alert("Không thể cập nhật nhận xét mẫu");
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
            const groupStudentIds = new Set(
                activeGroup?.participants.map((participant) => participant.userId) ?? [],
            );
            const targetSubmissions = isProjectAssessment && gradingScope === "GROUP" && activeGroup
                ? submissions.filter((submission) => submission.submitted && groupStudentIds.has(submission.studentId))
                : [activeSubmission];

            if (targetSubmissions.length === 0) {
                alert("Nhóm này chưa có thành viên nào đã nộp bài để chấm.");
                return;
            }

            if (
                targetSubmissions.length > 1 &&
                !window.confirm(`Áp dụng cùng kết quả cho ${targetSubmissions.length} thành viên đã nộp bài trong ${activeGroup?.groupName || "nhóm"}?`)
            ) {
                return;
            }

            const criteriaGrades = gradingMode === "RUBRIC" ? buildCriteriaGradesPayload() : [];
            await Promise.all(targetSubmissions.map((submission) => submitStudentGrade({
                submissionId: submission.id,
                studentId: submission.studentId,
                assessmentId,
                rubricId: gradingMode === "RUBRIC" ? rubric?.id ?? submission.rubricId ?? null : null,
                scores: gradingMode === "RUBRIC" ? criteriaScores : {},
                criteriaGrades,
                totalScore: displayedTotalScore,
                generalComment: generalComment.trim(),
            })));
            alert(
                targetSubmissions.length > 1
                    ? `Đã chấm ${targetSubmissions.length} thành viên trong ${activeGroup?.groupName || "nhóm"}.`
                    : "Chấm điểm thành công!",
            );
            await loadSubmissions();
            setGradingView("feedback");
        } catch (error) {
            console.error("Lỗi khi lưu điểm:", error);
            alert("Lỗi khi lưu điểm");
        } finally {
            setSaving(false);
        }
    };

    const handlePreviewDividerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId) || !previewSplitRef.current) return;

        const bounds = previewSplitRef.current.getBoundingClientRect();
        const nextPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
        setPreviewSplitPercent(Math.min(70, Math.max(30, nextPercent)));
    };

    const feedbackTemplatePicker = (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Thư viện nhận xét mẫu</p>
                <span className="text-xs font-semibold text-slate-400">{feedbackLibrary.length} mẫu</span>
            </div>

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {feedbackLibrary.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">Chưa có nhận xét mẫu.</p>
                ) : feedbackLibrary.map((feedback) => (
                    editingFeedbackId === feedback.id ? (
                        <div key={feedback.id} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2">
                            <input
                                value={editingFeedbackContent}
                                onChange={(event) => setEditingFeedbackContent(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") void handleUpdateFeedbackTemplate();
                                    if (event.key === "Escape") setEditingFeedbackId(null);
                                }}
                                autoFocus
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500"
                            />
                            <button type="button" onClick={() => void handleUpdateFeedbackTemplate()} aria-label="Lưu chỉnh sửa" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><Check className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setEditingFeedbackId(null)} aria-label="Hủy chỉnh sửa" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></button>
                        </div>
                    ) : (
                        <div key={feedback.id} className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition hover:border-emerald-200">
                            <button type="button" onClick={() => handleAppendFeedback(feedback.content)} className="min-w-0 flex-1 px-1 text-left text-xs font-medium leading-5 text-slate-700 hover:text-emerald-700">{feedback.content}</button>
                            <button type="button" onClick={() => handleStartEditFeedbackTemplate(feedback)} aria-label={`Sửa ${feedback.content}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-sky-600"><Pencil className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => void handleRemoveFeedbackTemplate(feedback)} aria-label={`Xóa ${feedback.content}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                    )
                ))}
            </div>

            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <input
                    value={newFeedback}
                    onChange={(event) => setNewFeedback(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") void handleAddFeedbackTemplate();
                    }}
                    placeholder="Thêm nhận xét mẫu..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                />
                <button
                    type="button"
                    onClick={() => void handleAddFeedbackTemplate()}
                    disabled={!newFeedback.trim()}
                    aria-label="Thêm nhận xét mẫu"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-11rem)] min-h-[680px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid h-full grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/70">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Chấm điểm</p>
                                <h2 className="mt-1 text-lg font-bold text-slate-900">Sinh viên</h2>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                                {submissionStats.total}
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchStudentId}
                                    onChange={(event) => setSearchStudentId(event.target.value)}
                                    placeholder="Tìm theo MSSV..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                                        className={`w-full rounded-xl border bg-white p-3.5 text-left transition ${
                                            activeSubmission?.studentId === sub.studentId
                                                ? "border-emerald-300 bg-emerald-50 shadow-sm"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{sub.studentId}</p>
                                                <p className="mt-1 text-xs text-slate-500">{formatDate(sub.submittedAt)}</p>
                                                {isProjectAssessment && getStudentGroup(sub.studentId) ? (
                                                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                                                        {isStudentGroupLeader(sub.studentId, getStudentGroup(sub.studentId)) ? (
                                                            <Flag className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                                        ) : null}
                                                        {getStudentGroup(sub.studentId)?.groupName}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    !sub.submitted
                                                        ? "bg-slate-100 text-slate-600"
                                                        : isSubmissionGraded(sub)
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

                <main className="flex min-h-0 flex-col overflow-hidden bg-white">
                    <div className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="truncate text-xl font-bold text-slate-900 md:text-2xl">
                                        {assessment?.assessmentName || "Chấm bài sinh viên"}
                                    </h1>
                                    {assessment?.assessmentType ? (
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                            isProjectAssessment
                                                ? "bg-violet-100 text-violet-700"
                                                : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                            {assessment.assessmentType}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                                {[
                                    { label: "Đã nộp", value: submissionStats.submitted, tone: "text-sky-700" },
                                    { label: "Chờ chấm", value: submissionStats.pending, tone: "text-amber-700" },
                                    { label: "Đã chấm", value: submissionStats.graded, tone: "text-emerald-700" },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                                        <p className={`text-lg font-bold ${item.tone}`}>{item.value}</p>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {!activeSubmission ? (
                        <div className="flex flex-1 items-center justify-center bg-slate-50/50 px-6 text-center">
                            <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-10">
                                <p className="text-lg font-bold text-slate-800">Chọn một sinh viên để bắt đầu</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Sử dụng danh sách bên trái để lọc bài chờ chấm, bài đã chấm hoặc tìm theo MSSV.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col">
                                <section
                                    className="contents"
                                >
                                    {showSubmissionModal ? createPortal(
                                        <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm md:p-5">
                                            <button
                                                type="button"
                                                aria-label="Đóng bài nộp"
                                                className="absolute inset-0"
                                                onClick={() => setShowSubmissionModal(false)}
                                            />
                                            <div className="relative z-10 flex h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl">
                                                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 md:px-6">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-bold text-slate-900">Bài làm</h3>
                                                            <span className="text-sm font-semibold text-slate-500">{activeSubmission.studentId}</span>
                                                            {isProjectAssessment && activeGroup ? (
                                                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{activeGroup.groupName}</span>
                                                            ) : null}
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-slate-400">{formatDate(activeSubmission.submittedAt)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewSplitPercent(50)}
                                                            title="Đặt lại tỷ lệ 50:50"
                                                            aria-label="Đặt lại tỷ lệ 50:50"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                        >
                                                            <Columns2 className="h-4 w-4" />
                                                        </button>
                                                        {activeSubmission.submittedLink ? (
                                                            <a
                                                                href={activeSubmission.submittedLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Liên kết
                                                            </a>
                                                        ) : null}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSubmissionModal(false)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    ref={previewSplitRef}
                                                    className="grid min-h-0 flex-1"
                                                    style={{ gridTemplateColumns: `${previewSplitPercent}% 8px minmax(0, 1fr)` }}
                                                >
                                                    <div className="min-w-0 overflow-y-auto bg-slate-50 p-4">
                                                        <div className="space-y-4">
                                                            {activeSubmission.attachments
                                                                ?.filter((item) => item.type === "FILE")
                                                                .map((file, index) => (
                                                                    <SubmissionFilePreview
                                                                        key={file.id || `${file.url}-modal-${index}`}
                                                                        url={file.url}
                                                                        name={file.originalName || `Tệp bài làm ${index + 1}`}
                                                                        title={`Submission ${activeSubmission.studentId} - modal file ${index + 1}`}
                                                                        expanded
                                                                    />
                                                                ))}

                                                            {!activeSubmission.attachments?.some((item) => item.type === "FILE") && activeSubmission.fileUrl ? (
                                                                isPreviewableFile(activeSubmission.fileUrl) ? (
                                                                    <iframe
                                                                        src={activeSubmission.fileUrl}
                                                                        title={`Submission ${activeSubmission.studentId}`}
                                                                        className="h-[calc(94vh-110px)] w-full rounded-2xl border border-slate-200 bg-white"
                                                                    />
                                                                ) : (
                                                                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                                                        <p className="text-sm text-slate-500">Không thể xem trước định dạng tệp này.</p>
                                                                        <a href={activeSubmission.fileUrl} target="_blank" rel="noreferrer" className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Mở tệp</a>
                                                                    </div>
                                                                )
                                                            ) : null}

                                                            {!activeSubmission.attachments?.some((item) => item.type === "FILE") && !activeSubmission.fileUrl ? (
                                                                <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                                                                    Bài nộp không có tệp để xem trước.
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        aria-label="Kéo để thay đổi kích thước"
                                                        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                                                        onPointerMove={handlePreviewDividerMove}
                                                        onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
                                                        className="group relative cursor-col-resize bg-slate-200 transition hover:bg-emerald-300"
                                                    >
                                                        <span className="absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 transition group-hover:bg-emerald-600" />
                                                    </button>

                                                    <div className="flex min-w-0 flex-col overflow-hidden bg-white">
                                                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-900">Chấm điểm</h4>
                                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                                                    {gradingMode === "MANUAL" ? "Thủ công" : "Rubric"}
                                                                </span>
                                                            </div>
                                                            {isProjectAssessment ? (
                                                                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                                                                    <button type="button" onClick={() => setGradingScope("INDIVIDUAL")} className={`rounded-md px-2.5 py-1 text-xs font-bold ${gradingScope === "INDIVIDUAL" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>Cá nhân</button>
                                                                    <button type="button" onClick={() => setGradingScope("GROUP")} disabled={!activeGroup} className={`rounded-md px-2.5 py-1 text-xs font-bold disabled:opacity-40 ${gradingScope === "GROUP" ? "bg-violet-600 text-white" : "text-slate-500"}`}>Cả nhóm</button>
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4">
                                                            {gradingMode === "MANUAL" ? (
                                                                <div className="space-y-4">
                                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                                        <label htmlFor="modal-manual-score" className="text-sm font-bold text-slate-800">Điểm</label>
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                            <input id="modal-manual-score" type="number" min="0" max="10" step="0.1" value={manualScore} onChange={(event) => setManualScore(event.target.value)} className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-lg font-bold outline-none focus:border-emerald-500" />
                                                                            <span className="font-semibold text-slate-400">/ 10</span>
                                                                        </div>
                                                                    </div>
                                                                    <textarea value={generalComment} onChange={(event) => setGeneralComment(event.target.value)} placeholder="Nhận xét..." className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-emerald-500" />
                                                                    {feedbackTemplatePicker}
                                                                </div>
                                                            ) : !rubric ? (
                                                                <div className="flex min-h-52 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải rubric...</div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {rubric.rows.map((row) => (
                                                                        <div key={row.criteriaId} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                                            <div className="flex items-start justify-between gap-3">
                                                                                <div><span className="text-xs font-bold text-emerald-700">{getCloName(row.cloId)}</span><p className="mt-1 text-sm font-bold text-slate-900">{row.criteriaName}</p></div>
                                                                                <span className="text-xs font-semibold text-slate-500">{row.weight}</span>
                                                                            </div>
                                                                            {row.levels?.length ? (
                                                                                <div className="mt-3 grid gap-2 xl:grid-cols-2">
                                                                                    {row.levels.map((level) => {
                                                                                        const selected = selectedLevels[row.criteriaId] === level.levelId;
                                                                                        const matched = gradedCriteriaById[row.criteriaId]?.levelId === level.levelId;
                                                                                        return <button key={level.levelId} type="button" onClick={() => handleLevelSelect(row.criteriaId, level.levelId, level.score)} className={`rounded-xl border p-3 text-left transition ${selected ? "border-emerald-500 bg-emerald-50" : matched ? "border-amber-300 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}><div className="flex justify-between gap-2"><span className="text-sm font-semibold text-slate-800">{level.levelName}</span><span className="text-sm font-bold text-emerald-700">{formatScore(level.score) ?? "0.0"}</span></div>{level.description ? <p className="mt-1 text-xs text-slate-500">{level.description}</p> : null}</button>;
                                                                                    })}
                                                                                </div>
                                                                            ) : (
                                                                                <input type="number" min="0" step="0.1" value={criteriaScores[row.criteriaId] ?? gradedCriteriaById[row.criteriaId]?.score ?? ""} onChange={(event) => handleScoreChange(row.criteriaId, Number(event.target.value))} className="mt-3 w-28 rounded-xl border border-slate-300 px-3 py-2 text-center font-bold outline-none focus:border-emerald-500" placeholder="Điểm" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <textarea value={generalComment} onChange={(event) => setGeneralComment(event.target.value)} placeholder="Nhận xét..." className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-emerald-500" />
                                                                    {feedbackTemplatePicker}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                                                            <div><span className="text-xs font-semibold text-slate-500">Tổng điểm</span><p className="text-xl font-bold text-emerald-600">{formatScore(displayedTotalScore) ?? "0.0"}</p></div>
                                                            <button type="button" onClick={handleSaveGrade} disabled={saving || !activeSubmission.submitted || (gradingMode === "RUBRIC" && !rubric)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300"><Save className="h-4 w-4" />{saving ? "Đang lưu..." : gradingScope === "GROUP" && isProjectAssessment ? "Lưu cả nhóm" : "Lưu điểm"}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>,
                                        document.body,
                                    ) : null}

                                    {showEvidenceModal ? <div className="hidden">
                                        <div className="grid gap-4">
                                            {isProjectAssessment && activeSubmission.submitted ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEvidenceModal(true)}
                                                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/30"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Minh chứng đánh giá cá nhân</p>
                                                            <p className="mt-1 text-xs text-slate-500">Xem tiến độ và công việc được giao của sinh viên.</p>
                                                        </div>
                                                        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                                            {loadingEvidence
                                                                ? "Đang tải..."
                                                                : assessmentEvidence
                                                                    ? `${assessmentEvidence.completionRate.toFixed(1)}% hoàn thành`
                                                                    : "Xem minh chứng"}
                                                        </span>
                                                    </button>

                                                    {showEvidenceModal ? createPortal(
                                                        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
                                                            <button
                                                                type="button"
                                                                aria-label="Đóng minh chứng"
                                                                className="absolute inset-0"
                                                                onClick={() => setShowEvidenceModal(false)}
                                                            />
                                                            <div className="relative z-10 flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                                                                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-6">
                                                                    <div>
                                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Đồ án · {activeGroup?.groupName || "Chưa có nhóm"}</p>
                                                                        <h3 className="mt-1 text-xl font-bold text-slate-900">Minh chứng cá nhân — {activeSubmission.studentId}</h3>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowEvidenceModal(false)}
                                                                        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="overflow-y-auto p-5 md:p-6">
                                                                    {loadingEvidence ? (
                                                                        <div className="flex min-h-52 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tổng hợp minh chứng...</div>
                                                                    ) : assessmentEvidence ? (
                                                                        <div className="space-y-5">
                                                                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                                                                {[
                                                                                    { label: "Task được giao", value: assessmentEvidence.totalAssignedTasks, tone: "text-slate-900" },
                                                                                    { label: "Đã hoàn thành", value: assessmentEvidence.completedTasks, tone: "text-emerald-700" },
                                                                                    { label: "Hoàn thành trễ", value: assessmentEvidence.completedLateTasks, tone: "text-amber-700" },
                                                                                    { label: "Quá hạn chưa xong", value: assessmentEvidence.overdueTasks, tone: "text-rose-700" },
                                                                                ].map((item) => <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.tone}`}>{item.value}</p></div>)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="mb-2 flex justify-between text-xs text-slate-500"><span>Tiến độ hoàn thành</span><span>{assessmentEvidence.completedOnTimeTasks} đúng hạn · {assessmentEvidence.completedLateTasks} trễ hạn</span></div>
                                                                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, assessmentEvidence.completionRate))}%` }} /></div>
                                                                            </div>
                                                                            {assessmentEvidence.tasks.length ? (
                                                                                <div className="space-y-2">
                                                                                    {assessmentEvidence.tasks.map((task) => <div key={task.taskId} className="flex flex-col gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{task.title}</p><p className="mt-0.5 text-xs text-slate-500">{task.groupName || "Nhóm"} · Hạn: {formatDate(task.deadline)}</p></div><span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${task.completedLate ? "bg-amber-100 text-amber-700" : task.overdue ? "bg-rose-100 text-rose-700" : task.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{task.completedLate ? "Hoàn thành trễ" : task.overdue ? "Đang quá hạn" : task.status === "COMPLETED" ? "Đúng hạn" : task.status === "IN_PROGRESS" ? "Đang làm" : "Chưa làm"}</span></div>)}
                                                                                </div>
                                                                            ) : <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">Sinh viên chưa có task cá nhân để tổng hợp.</p>}
                                                                        </div>
                                                                    ) : <p className="rounded-xl bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">Không tải được dữ liệu minh chứng.</p>}
                                                                </div>
                                                            </div>
                                                        </div>,
                                                        document.body,
                                                    ) : null}
                                                </>
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
                                                        expanded={false}
                                                    />
                                                ))}

                                            {!activeSubmission.attachments?.some((item) => item.type === "FILE") && activeSubmission.fileUrl ? (
                                                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                                    {isPreviewableFile(activeSubmission.fileUrl) ? (
                                                        <iframe
                                                            src={activeSubmission.fileUrl}
                                                            title={`Submission ${activeSubmission.studentId}`}
                                                            className="h-[680px] w-full rounded-xl border border-slate-200 bg-white"
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
                                    </div> : null}
                                </section>

                                <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-6">
                                    <div className="mx-auto max-w-4xl space-y-4">
                                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-xl font-bold text-slate-900">{activeSubmission.studentId}</h3>
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                            isSubmissionGraded(activeSubmission)
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-amber-100 text-amber-700"
                                                        }`}>
                                                            {getDisplaySubmissionBadge(activeSubmission)}
                                                        </span>
                                                    </div>

                                                    {isProjectAssessment && activeGroup ? (
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{activeGroup.groupName}</span>
                                                            {activeStudentIsLeader ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                                    <Flag className="h-3.5 w-3.5 fill-amber-400" />
                                                                    Trưởng nhóm
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    ) : null}

                                                    <p className="mt-3 text-sm text-slate-500">Nộp lúc {formatDate(activeSubmission.submittedAt)}</p>
                                                </div>

                                                <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Điểm hiện tại</p>
                                                    <p className="mt-1 text-3xl font-bold text-emerald-700">{formatScore(activeSubmission.totalScore) ?? "--"}</p>
                                                </div>
                                            </div>

                                            {activeFiles.length > 0 || activeLinks.length > 0 ? (
                                                <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                                                    {activeFiles.length > 0 ? (
                                                        <div>
                                                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Tệp bài nộp ({activeFiles.length})</p>
                                                            <div className="space-y-2">
                                                                {activeFiles.map((file) => (
                                                                    <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                                        <p className="min-w-0 truncate text-sm font-semibold text-slate-700">{file.name}</p>
                                                                        <a
                                                                            href={file.url}
                                                                            download
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                            Tải xuống
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {activeLinks.length > 0 ? (
                                                        <div>
                                                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Liên kết bài nộp ({activeLinks.length})</p>
                                                            <div className="space-y-2">
                                                                {activeLinks.map((link) => (
                                                                    <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                                                        <p className="min-w-0 truncate text-sm text-slate-600">{link.url}</p>
                                                                        <a
                                                                            href={link.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                                                                        >
                                                                            <ExternalLink className="h-4 w-4" />
                                                                            Mở
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <p className="text-sm font-bold text-slate-900">Nhận xét gần nhất</p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {activeSubmission.comment?.trim() || "Chưa có nhận xét."}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-end gap-2">
                                            {isProjectAssessment && activeSubmission.submitted ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEvidenceModal(true)}
                                                    className="inline-flex h-11 items-center rounded-xl border border-indigo-200 bg-white px-4 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                                                >
                                                    Minh chứng cá nhân
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => setShowSubmissionModal(true)}
                                                disabled={!activeSubmission.submitted}
                                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                            >
                                                <Expand className="h-4 w-4" />
                                                Chấm bài
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            {false ? (
                                <section className="flex min-h-0 flex-col bg-white">
                                    <div className="flex min-h-24 items-center border-b border-slate-200 px-4 py-3 md:px-5">
                                        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900">Chấm điểm</p>
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                                    {gradingMode === "MANUAL" ? "Thủ công" : "Rubric"}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {isProjectAssessment ? (
                                                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setGradingScope("INDIVIDUAL")}
                                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                                                gradingScope === "INDIVIDUAL"
                                                                    ? "bg-emerald-600 text-white shadow-sm"
                                                                    : "text-slate-500 hover:text-slate-700"
                                                            }`}
                                                        >
                                                            Cá nhân
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setGradingScope("GROUP")}
                                                            disabled={!activeGroup}
                                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                gradingScope === "GROUP"
                                                                    ? "bg-violet-600 text-white shadow-sm"
                                                                    : "text-slate-500 hover:text-slate-700"
                                                            }`}
                                                        >
                                                            Cả nhóm{activeGroup ? ` (${activeGroup.participants.length})` : ""}
                                                        </button>
                                                    </div>
                                                ) : null}
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
                                {getCloName(row.cloId)}
                              </span>
                                                            <span className="text-sm font-medium text-slate-500">
                                Trọng số: {row.weight}
                              </span>
                                                        </div>

                                                        <p className="mt-3 font-semibold text-slate-900">{row.criteriaName}</p>

                                                        {row.levels && row.levels.length > 0 ? (
                                                            <div
                                                                className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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

                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            {gradingMode === "RUBRIC" && gradingView === "grading" && canShowFeedback ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setGradingView("feedback")}
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                                >
                                                    <MessageSquareText className="h-4 w-4" />
                                                    Nhận xét
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
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                            >
                                                <Save className="h-4 w-4" />
                                                {saving
                                                    ? "Đang lưu..."
                                                    : isProjectAssessment && gradingScope === "GROUP" && activeGroup
                                                        ? "Lưu cả nhóm"
                                                    : gradingMode === "MANUAL"
                                                        ? "Lưu điểm"
                                                        : "Lưu rubric"}
                                            </button>
                                        </div>

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
