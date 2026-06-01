import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    FileText,
    Save,
    CheckCircle2,
    CalendarDays,
    User,
    Menu,
    X,
} from "lucide-react";

import {getRubricById, getRubricMatrixById} from "@/api/RubricApi";
import {
    fetchSubmissionsPending,
    submitStudentGrade,
} from "@/api/GradingApi";

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

export default function TeacherGrading() {
    const { assessmentId } = useParams<{ assessmentId: string }>();

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [rubric, setRubric] = useState<RubricDTO | null>(null);
    const [activeSubmission, setActiveSubmission] = useState<any>(null);

    const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});

    // Trạng thái theo dõi level nào đang được chọn cho mỗi tiêu chí (để highlight)
    const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({});

    const [saving, setSaving] = useState(false);

    // mobile drawer
    const [showSidebarMobile, setShowSidebarMobile] = useState(false);

    // desktop collapse
    const [showSidebarDesktop, setShowSidebarDesktop] = useState(true);

    useEffect(() => {
        if (assessmentId) {
            loadSubmissions();
        }
    }, [assessmentId]);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const data = await fetchSubmissionsPending(assessmentId);
            setSubmissions(data);
        } catch (error) {
            console.error("Lỗi load submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSubmission = async (submission: any) => {
        try {
            setActiveSubmission(submission);
            setShowSidebarMobile(false);


            setCriteriaScores({});
            setSelectedLevels({});

            const rubricRes = await getRubricMatrixById(submission.rubricId);
            setRubric(rubricRes.data);
        } catch (error) {
            console.error("Lỗi load rubric:", error);
        }
    };

    // Xử lý khi click vào 1 level
    const handleLevelSelect = (criteriaId: string, levelId: string, score: number | null) => {
        setSelectedLevels((prev) => ({
            ...prev,
            [criteriaId]: levelId,
        }));
        setCriteriaScores((prev) => ({
            ...prev,
            [criteriaId]: score || 0, // Fallback về 0 nếu score = null
        }));
    };

    // Vẫn giữ fallback nhập tay nếu tiêu chí không có levels
    const handleScoreChange = (criterionId: string, score: number) => {
        setCriteriaScores((prev) => ({
            ...prev,
            [criterionId]: score,
        }));
    };

    const totalScore = Object.values(criteriaScores).reduce(
        (sum, value) => sum + (value || 0),
        0
    );

    const handleSaveGrade = async () => {
        if (!activeSubmission || !rubric) {
            alert("Vui lòng chọn bài nộp");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                studentId: activeSubmission.studentId,
                assessmentId,
                rubricId: rubric.id,
                scores: criteriaScores,
                totalScore,
            };

            await submitStudentGrade(payload);
            alert("Chấm điểm thành công!");
            loadSubmissions();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu điểm");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-100">
            <div className="flex h-full">


                {showSidebarMobile && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={() => setShowSidebarMobile(false)}
                    />
                )}

                {/* ================= SIDEBAR ================= */}
                <div
                    className={`
                        fixed lg:static z-50
                        h-full
                        bg-white
                        border-r border-slate-200
                        transition-all duration-300
                        overflow-hidden
                        flex flex-col

                        ${
                        showSidebarMobile
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }

                        ${
                        showSidebarDesktop
                            ? "lg:w-[320px] w-[300px]"
                            : "lg:w-0"
                    }
                    `}
                >
                    <div className="border-b border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                                Submission List
                            </p>
                            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                                Danh sách bài nộp
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowSidebarMobile(false)}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            <div className="text-center text-sm text-slate-500 py-10">
                                Đang tải dữ liệu...
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center text-sm text-slate-500 py-10">
                                Không có bài nộp nào
                            </div>
                        ) : (
                            submissions.map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => handleSelectSubmission(sub)}
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                        activeSubmission?.id === sub.id
                                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-slate-500" />
                                            <span className="font-semibold text-slate-900">
                                                {sub.studentId}
                                            </span>
                                        </div>
                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                            {sub.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <CalendarDays className="h-4 w-4" />
                                        {sub.submittedAt
                                            ? new Date(sub.submittedAt).toLocaleString("vi-VN")
                                            : "---"}
                                    </div>

                                    {activeSubmission?.id === sub.id && (
                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Đang chấm
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ================= MAIN ================= */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSidebarMobile(true)}
                                className="lg:hidden rounded-xl border border-slate-200 p-2 hover:bg-slate-100"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowSidebarDesktop(!showSidebarDesktop)}
                                className="hidden lg:flex rounded-xl border border-slate-200 p-2 hover:bg-slate-100 transition"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Chấm bài bằng Rubric
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Split View Grading Interface
                                </p>
                            </div>
                        </div>

                        {activeSubmission && (
                            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700">
                                    {activeSubmission.studentId}
                                </span>
                            </div>
                        )}
                    </div>

                    {!activeSubmission ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="text-center px-4">
                                <FileText className="mx-auto h-14 w-14 text-slate-300" />
                                <p className="mt-4 text-base sm:text-lg font-semibold text-slate-600">
                                    Chọn một bài nộp để bắt đầu chấm điểm
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                            {/* ================= FILE VIEW ================= */}
                            <div
                                className={`
                                    flex flex-col bg-white border-r border-slate-200
                                    transition-all duration-300
                                    ${showSidebarDesktop ? "xl:w-[50%]" : "xl:w-[60%]"}
                                `}
                            >
                                <div className="border-b border-slate-200 p-4 sm:p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                                                Student Submission
                                            </p>
                                            <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">
                                                Bài làm sinh viên
                                            </h3>
                                        </div>
                                        <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                            {activeSubmission.studentId}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-slate-100 p-3 sm:p-5 overflow-hidden">
                                    {activeSubmission.fileUrl ? (
                                        <iframe
                                            src={activeSubmission.fileUrl}
                                            title="Student Submission"
                                            className="w-full h-[45vh] xl:h-full rounded-2xl border border-slate-200 bg-white"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
                                            Không có file bài nộp
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ================= RUBRIC ================= */}
                            <div
                                className={`
                                    flex flex-col bg-white
                                    transition-all duration-300
                                    ${showSidebarDesktop ? "xl:w-[50%]" : "xl:w-[40%]"}
                                `}
                            >
                                <div className="border-b border-slate-200 p-4 sm:p-5">
                                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                                        Rubric Grading
                                    </p>
                                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">
                                        Bảng Rubric chấm điểm
                                    </h3>
                                    {rubric && (
                                        <p className="mt-2 text-sm text-slate-500">
                                            {rubric.description}
                                        </p>
                                    )}
                                </div>

                                {/* Body - Render rows and CLICKABLE levels */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                                    {rubric?.rows?.map((row) => (
                                        <div
                                            key={row.criteriaId}
                                            className="rounded-2xl border border-slate-200 p-4 lg:p-5 bg-white shadow-sm"
                                        >
                                            {/* Info Tiêu chí */}
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                                                        {row.cloId}
                                                    </span>
                                                    <span className="text-sm font-medium text-emerald-600">
                                                        Trọng số: {row.weight}
                                                    </span>
                                                </div>
                                                {row.criteriaName && (
                                                    <p className="font-bold text-slate-900 text-base">
                                                        {row.criteriaName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Hiển thị Levels dạng Grid Card để chọn */}
                                            {row.levels && row.levels.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {row.levels.map((level) => {
                                                        const isSelected = selectedLevels[row.criteriaId] === level.levelId;

                                                        return (
                                                            <div
                                                                key={level.levelId}
                                                                onClick={() => handleLevelSelect(row.criteriaId, level.levelId, level.score)}
                                                                className={`
                                                                    cursor-pointer rounded-xl border-2 p-3 transition-all flex flex-col justify-between
                                                                    ${
                                                                    isSelected
                                                                        ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-100"
                                                                        : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm hover:bg-slate-50"
                                                                }
                                                                `}
                                                            >
                                                                <div>
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <span className={`font-bold text-sm ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                                                                            {level.levelName}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                                        )}
                                                                    </div>

                                                                    {level.description && (
                                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-4" title={level.description}>
                                                                            {level.description}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Điểm của level */}
                                                                <div className="mt-3 border-t border-slate-100 pt-2 flex justify-between items-center">
                                                                    <span className="text-xs font-medium text-slate-500">Điểm</span>
                                                                    <span className={`rounded-lg px-2 py-1 text-sm font-bold ${
                                                                        isSelected ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-700"
                                                                    }`}>
                                                                        {level.score !== null ? level.score : "0"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                /* Fallback nếu API trả về không có levels -> hiển thị ô input tự nhập */
                                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Chấm điểm tay (0 - {row.weight})
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={row.weight}
                                                        value={criteriaScores[row.criteriaId] || ""}
                                                        onChange={(e) => handleScoreChange(row.criteriaId, Number(e.target.value))}
                                                        className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                                        placeholder="Điểm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-slate-600 font-medium">
                                            Tổng điểm tự động tính:
                                        </span>
                                        <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                                            {totalScore}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleSaveGrade}
                                        disabled={saving}
                                        className="
                                            flex w-full items-center justify-center gap-2 rounded-2xl
                                            bg-slate-900 px-5 py-4 text-sm font-bold text-white transition
                                            hover:bg-slate-800 disabled:opacity-50
                                        "
                                    >
                                        <Save className="h-5 w-5" />
                                        {saving
                                            ? "Đang lưu..."
                                            : `Lưu kết quả chấm cho ${activeSubmission.studentId}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}