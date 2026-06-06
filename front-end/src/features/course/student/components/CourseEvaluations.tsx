import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    ClipboardList,
    FileText,
    Target,
    TimerReset,
    Trophy,
    Workflow,
    ChevronDown,
} from "lucide-react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "@/features/course/courseApi";
import type { Assessment } from "@/features/course/student/assignmentSlice";
import StudentAttendanceCheckIn from "@/features/course/student/components/StudentAttendanceCheckIn.tsx";

type EvaluationItem = {
    title: string;
    value: number;
    weight: number;
    summary: string;
    icon: React.ElementType;
};

type RubricCriterion = {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
};

const getTone = (value: number) => {
    if (value >= 85) {
        return {
            badge: "bg-emerald-100 text-emerald-700",
            fill: "bg-emerald-500",
            label: "Rất tốt",
        };
    }

    if (value >= 70) {
        return {
            badge: "bg-amber-100 text-amber-700",
            fill: "bg-amber-500",
            label: "Đạt",
        };
    }

    return {
        badge: "bg-rose-100 text-rose-700",
        fill: "bg-rose-500",
        label: "Cần cải thiện",
    };
};

const SectionCard = ({
    title,
    icon: Icon,
    description,
    children,
}: {
    title: string;
    icon: React.ElementType;
    description: string;
    children: React.ReactNode;
}) => (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    {title}
                </p>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>
            <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-5">{children}</div>
    </section>
);

const AccordionSection = ({
    title,
    summary,
    icon: Icon,
    accent,
    open,
    onToggle,
    children,
}: {
    title: string;
    summary: string;
    icon: React.ElementType;
    accent: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
        >
            <div className="flex items-center gap-4">
                <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{summary}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {open ? "Đang mở" : "Bấm để xem"}
                </span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </div>
        </button>
        {open && <div className="border-t border-slate-200 bg-slate-50 p-5 md:p-6">{children}</div>}
    </div>
);

export default function CourseEvaluations() {
    const { id: offeringId } = useParams();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("attendance");

    const evaluationItems: EvaluationItem[] = [
        {
            title: "Chuyên cần",
            value: 92,
            weight: 10,
            summary: "Điểm danh, đúng giờ và thái độ học tập.",
            icon: TimerReset,
        },
        {
            title: "Bài tập",
            value: 88,
            weight: 30,
            summary: "Bài nộp ngắn, quiz và bài tập thực hành.",
            icon: ClipboardList,
        },
        {
            title: "Dự án",
            value: 84,
            weight: 30,
            summary: "Tiến độ nhóm, demo và phản biện.",
            icon: Workflow,
        },
        {
            title: "Bài cuối kỳ",
            value: 90,
            weight: 30,
            summary: "Tổng hợp theo rubric và nhận xét của giảng viên.",
            icon: FileText,
        },
    ];

    const rubricCriteria: RubricCriterion[] = [
        {
            name: "Chuyên cần và thái độ",
            score: 9.2,
            maxScore: 10,
            feedback: "Tham gia ổn định, chủ động thảo luận và đúng thời hạn.",
        },
        {
            name: "Nội dung và lập luận",
            score: 8.8,
            maxScore: 10,
            feedback: "Đáp ứng yêu cầu, phần phân tích rõ nhưng còn có thể sâu hơn.",
        },
        {
            name: "Kỹ thuật và triển khai",
            score: 8.4,
            maxScore: 10,
            feedback: "Hoàn thành đúng chức năng, cần tối ưu thêm phần trình bày.",
        },
        {
            name: "Phản biện và trình bày",
            score: 9.0,
            maxScore: 10,
            feedback: "Trình bày tốt, trả lời câu hỏi rõ ràng và đúng trọng tâm.",
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (!offeringId) return;

            try {
                setLoading(true);
                const [courseData, assessmentData] = await Promise.all([
                    courseService.getCourseById(offeringId),
                    courseService.getAssessmentByOffering(offeringId),
                ]);
                setCourse(courseData);
                setAssessments(assessmentData || []);
            } catch (error) {
                console.error("Lỗi khi tải trang đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [offeringId]);

    const courseTitle =
        course?.course?.courseName ||
        course?.courseName ||
        "Học phần";

    const totalWeightedScore = Math.round(
        evaluationItems.reduce((sum, item) => sum + item.value * (item.weight / 100), 0)
    );
    const totalTone = getTone(totalWeightedScore);
    const scoredAssessments = assessments.filter((item) => item.calculatedScore !== null || item.submissionId);

    const sections = [
        {
            key: "attendance",
            title: "Chuyên cần",
            icon: TimerReset,
            summary: "Điểm danh, đúng giờ và thái độ học tập.",
            accent: "from-emerald-500 to-emerald-600",
            body: (
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Tỷ lệ tham gia</p>
                        <p className="mt-2 text-3xl font-black text-slate-900">92%</p>
                        <p className="mt-2 text-sm text-slate-500">Đi học đầy đủ, ít vắng mặt.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Đúng giờ</p>
                        <p className="mt-2 text-3xl font-black text-slate-900">89%</p>
                        <p className="mt-2 text-sm text-slate-500">Phần lớn buổi học có mặt đúng giờ.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Thái độ</p>
                        <p className="mt-2 text-3xl font-black text-slate-900">Tốt</p>
                        <p className="mt-2 text-sm text-slate-500">Tích cực trao đổi và hợp tác trong lớp.</p>
                    </div>
                </div>
            ),
        },
        {
            key: "assignments",
            title: "Bài tập",
            icon: ClipboardList,
            summary: "Danh sách bài nộp, trạng thái và điểm hiện tại.",
            accent: "from-cyan-500 to-blue-600",
            body: (
                <div className="space-y-3">
                    {scoredAssessments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                            Chưa có bài tập nào được chấm trong học phần này.
                        </div>
                    ) : (
                        scoredAssessments.map((item) => {
                            const status =
                                item.calculatedScore !== null
                                    ? "Đã chấm"
                                    : item.submissionId
                                        ? "Đã nộp"
                                        : "Chưa nộp";
                            const percent = item.calculatedScore !== null
                                ? Math.min(100, Math.round((item.calculatedScore / 10) * 100))
                                : 0;
                            const itemTone = getTone(percent);

                            return (
                                <div key={item.assessmentId} className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{item.assessmentName}</h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                CLO: {item.cloCode?.length ? item.cloCode.join(", ") : "Chưa gắn CLO"}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${itemTone.badge}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Hạn nộp</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {new Date(item.endTime).toLocaleString("vi-VN")}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Điểm</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {item.calculatedScore !== null ? `${item.calculatedScore}/10` : "Chưa có điểm"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ),
        },
        {
            key: "project",
            title: "Project",
            icon: Workflow,
            summary: "Tiến độ nhóm, rubric và phản hồi từ giảng viên.",
            accent: "from-violet-500 to-fuchsia-600",
            body: (
                <div className="space-y-3">
                    {[
                        { label: "Tiến độ sprint", value: 84, note: "Hoàn thành phần lớn task chính" },
                        { label: "Demo", value: 82, note: "Chạy ổn, còn vài điểm cần tinh chỉnh" },
                        { label: "Phản biện", value: 88, note: "Trả lời câu hỏi tốt" },
                    ].map((item) => {
                        const itemTone = getTone(item.value);
                        return (
                            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.label}</h4>
                                        <p className="mt-1 text-sm text-slate-500">{item.note}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${itemTone.badge}`}>
                                        {item.value}%
                                    </span>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-slate-100">
                                    <div className={`h-2 rounded-full ${itemTone.fill}`} style={{ width: `${item.value}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
        {
            key: "final",
            title: "Bài cuối kỳ",
            icon: FileText,
            summary: "Kết quả tổng hợp cuối môn theo rubric.",
            accent: "from-amber-500 to-orange-600",
            body: (
                <div className="space-y-4">
                    {[
                        { label: "Kiến thức", value: 90, note: "Nắm vững nội dung trọng tâm" },
                        { label: "Ứng dụng", value: 86, note: "Triển khai đúng yêu cầu bài" },
                        { label: "Trình bày", value: 92, note: "Rõ ràng, mạch lạc và dễ theo dõi" },
                        { label: "Phản biện", value: 88, note: "Trả lời câu hỏi tương đối tốt" },
                    ].map((row) => {
                        const rowTone = getTone(row.value);
                        return (
                            <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{row.label}</h4>
                                        <p className="mt-1 text-sm text-slate-500">{row.note}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rowTone.badge}`}>
                                        {row.value}%
                                    </span>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-slate-100">
                                    <div
                                        className={`h-2 rounded-full ${rowTone.fill}`}
                                        style={{ width: `${row.value}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
    ];

    sections[0].body = <StudentAttendanceCheckIn offeringId={offeringId || ""} />;

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

            <div className="flex">
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                <main className="flex-1 p-4 lg:p-6">
                    <div className="mx-auto max-w-6xl space-y-6">
                        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-lg md:p-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-3xl">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
                                        Student evaluation
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black md:text-4xl">
                                        Đánh giá học phần và rubric
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/85 md:text-base">
                                        Bấm vào từng mục để mở phần chi tiết bên dưới.
                                    </p>
                                </div>

                                <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                                    <p className="text-sm text-emerald-50/80">Tổng kết hiện tại</p>
                                    <div className="mt-2 flex items-end gap-3">
                                        <span className="text-4xl font-black">{totalWeightedScore}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${totalTone.badge}`}>
                                            {totalTone.label}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-emerald-50/80">
                                        {courseTitle} {offeringId ? `- Mã lớp ${offeringId}` : ""}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {loading ? (
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                                Đang tải dữ liệu đánh giá...
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {sections.map((section) => {
                                        const Icon = section.icon;
                                        const open = activeSection === section.key;

                                        return (
                                            <AccordionSection
                                                key={section.key}
                                                title={section.title}
                                                summary={section.summary}
                                                icon={Icon}
                                                accent={section.accent}
                                                open={open}
                                                onToggle={() =>
                                                    setActiveSection((current) =>
                                                        current === section.key ? "" : section.key
                                                    )
                                                }
                                            >
                                                {section.body}
                                            </AccordionSection>
                                        );
                                    })}
                                </div>

                                <SectionCard
                                    title="Rubric tổng hợp"
                                    icon={Target}
                                    description="Các tiêu chí đánh giá chính theo rubric của học phần."
                                >
                                    <div className="space-y-4">
                                        {rubricCriteria.map((criterion) => {
                                            const percent = Math.round((criterion.score / criterion.maxScore) * 100);
                                            const criterionTone = getTone(percent);

                                            return (
                                                <div key={criterion.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                                                            <p className="mt-1 text-sm text-slate-500">{criterion.feedback}</p>
                                                        </div>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${criterionTone.badge}`}>
                                                            {criterion.score.toFixed(1)}/{criterion.maxScore}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                                                        <div
                                                            className={`h-2 rounded-full ${criterionTone.fill}`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    title="Ghi chú"
                                    icon={BookOpen}
                                    description="Tổng hợp trạng thái học phần và phản hồi nhanh."
                                >
                                    <div className="space-y-4">
                                        <div className="rounded-2xl bg-slate-950 p-5 text-white">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-300">Trạng thái chung</p>
                                                <Trophy className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <p className="mt-3 text-3xl font-black">{totalWeightedScore}/100</p>
                                            <p className="mt-2 text-sm text-slate-300">
                                                Bạn đang ở mức {totalTone.label.toLowerCase()} và có thể cải thiện thêm ở phần dự án nếu cần.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                            <div className="flex items-center gap-2 text-emerald-700">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <p className="font-semibold">Điểm mạnh</p>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-700">
                                                Chuyên cần và phần trình bày đang là hai mục có kết quả tốt nhất.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                            <div className="flex items-center gap-2 text-amber-700">
                                                <AlertCircle className="h-4 w-4" />
                                                <p className="font-semibold">Cần lưu ý</p>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-700">
                                                Phần dự án nên theo dõi thêm phản hồi từ giảng viên để chốt rubric cuối cùng.
                                            </p>
                                        </div>
                                    </div>
                                </SectionCard>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
