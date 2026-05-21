import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    FileText,
    Save,
    CheckCircle2,
    CalendarDays,
    User,
    Menu,
    X,
} from "lucide-react";

import {getRubricById} from "@/api/RubricApi";
import {
    fetchSubmissionsPending,
    submitStudentGrade,
} from "@/api/GradingApi";

interface CriteriaDTO {
    criteriaId
        : string;
    cloId:string;
    criteriaName: string;
    description?: string;
    weight?: number;
    maxPoints?: number;
}

interface RubricDTO {
    id: string;
    name: string;
    description: string;
    defaultType: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}

export default function TeacherGrading() {
    const {assessmentId} = useParams<{ assessmentId: string }>();

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [rubric, setRubric] = useState<RubricDTO | null>(null);
    const [activeSubmission, setActiveSubmission] = useState<any>(null);

    const [criteriaScores, setCriteriaScores] = useState<
        Record<string, number>
    >({});

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

            // close mobile sidebar
            setShowSidebarMobile(false);

            // reset điểm cũ
            setCriteriaScores({});



            const rubricRes = await getRubricById(submission.rubricId);

            setRubric(rubricRes.data);

        } catch (error) {
            console.error("Lỗi load rubric:", error);
        }
    };

    const handleScoreChange = (
        criterionId: string,
        score: number
    ) => {
        setCriteriaScores((prev) => ({
            ...prev,
            [criterionId]: score,
        }));
    };

    const totalScore = Object.values(criteriaScores).reduce(
        (sum, value) => sum + value,
        0
    );
        console.log(rubric)
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

                {/* ================= MOBILE OVERLAY ================= */}
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
                    {/* Header */}
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
                            <X className="h-5 w-5 text-slate-500"/>
                        </button>
                    </div>

                    {/* List */}
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
                                    onClick={() =>
                                        handleSelectSubmission(sub)
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                        activeSubmission?.id === sub.id
                                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-slate-500"/>

                                            <span className="font-semibold text-slate-900">
                                                {sub.studentId}
                                            </span>
                                        </div>

                                        <span
                                            className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                                            {sub.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <CalendarDays className="h-4 w-4"/>

                                        {sub.submittedAt
                                            ? new Date(
                                                sub.submittedAt
                                            ).toLocaleString("vi-VN")
                                            : "---"}
                                    </div>

                                    {activeSubmission?.id === sub.id && (
                                        <div
                                            className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                            <CheckCircle2 className="h-4 w-4"/>
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

                    {/* ================= TOPBAR ================= */}
                    <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between">

                        {/* LEFT */}
                        <div className="flex items-center gap-3">

                            {/* MOBILE MENU */}
                            <button
                                onClick={() =>
                                    setShowSidebarMobile(true)
                                }
                                className="lg:hidden rounded-xl border border-slate-200 p-2 hover:bg-slate-100"
                            >
                                <Menu className="h-5 w-5"/>
                            </button>

                            {/* DESKTOP COLLAPSE */}
                            <button
                                onClick={() =>
                                    setShowSidebarDesktop(
                                        !showSidebarDesktop
                                    )
                                }
                                className="hidden lg:flex rounded-xl border border-slate-200 p-2 hover:bg-slate-100 transition"
                            >
                                <Menu className="h-5 w-5"/>
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

                        {/* RIGHT */}
                        {activeSubmission && (
                            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2">
                                <User className="h-4 w-4 text-slate-500"/>

                                <span className="text-sm font-semibold text-slate-700">
                                    {activeSubmission.studentId}
                                </span>
                            </div>
                        )}
                    </div>

                    {!activeSubmission ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="text-center px-4">
                                <FileText className="mx-auto h-14 w-14 text-slate-300"/>

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

                                    ${
                                    showSidebarDesktop
                                        ? "xl:w-[65%]"
                                        : "xl:w-[72%]"
                                }
                                `}
                            >
                                {/* Header */}
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

                                        <div
                                            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                            {activeSubmission.studentId}
                                        </div>
                                    </div>
                                </div>

                                {/* File */}
                                <div className="flex-1 bg-slate-100 p-3 sm:p-5 overflow-hidden">

                                    {activeSubmission.fileUrl ? (
                                        <iframe
                                            src={activeSubmission.fileUrl}
                                            title="Student Submission"
                                            className="
                                                w-full
                                                h-[45vh]
                                                xl:h-full
                                                rounded-2xl
                                                border
                                                border-slate-200
                                                bg-white
                                            "
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
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

                                    ${
                                    showSidebarDesktop
                                        ? "xl:w-[35%]"
                                        : "xl:w-[28%]"
                                }
                                `}
                            >
                                {/* Header */}
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

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                                    {rubric?.criteria?.map((criterion) => (
                                        <div
                                            key={criterion.criteriaId
                                            }
                                            className="rounded-2xl border border-slate-200 p-4"
                                        >
                                            <div className="space-y-4">

                                                <div>
                                                    <h4 className="font-semibold text-slate-900">
                                                        {criterion.cloId}
                                                    </h4>

                                                    {criterion.criteriaName && (
                                                        <p className="mt-2 text-sm text-slate-500">
                                                            {
                                                                criterion.criteriaName
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-500">
                                                        Điểm tối đa:
                                                        {" "}
                                                        {criterion.maxPoints ||
                                                            criterion.weight}
                                                    </span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={
                                                            criterion.maxPoints ||
                                                            100
                                                        }
                                                        value={
                                                            criteriaScores[
                                                                criterion.criteriaId
                                                                ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleScoreChange(
                                                                criterion.criteriaId,
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        className="
                                                            w-24
                                                            rounded-xl
                                                            border
                                                            border-slate-300
                                                            px-3
                                                            py-2
                                                            text-center
                                                            text-sm
                                                            font-semibold
                                                            outline-none
                                                            focus:border-emerald-500
                                                            focus:ring-2
                                                            focus:ring-emerald-200
                                                        "
                                                        placeholder="Điểm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">

                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-slate-600 font-medium">
                                            Tổng điểm
                                        </span>

                                        <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                                            {totalScore}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleSaveGrade}
                                        disabled={saving}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-2xl
                                            bg-slate-900
                                            px-5
                                            py-4
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-slate-800
                                            disabled:opacity-50
                                        "
                                    >
                                        <Save className="h-5 w-5"/>

                                        {saving
                                            ? "Đang lưu..."
                                            : `Lưu điểm cho ${activeSubmission.studentId}`}
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