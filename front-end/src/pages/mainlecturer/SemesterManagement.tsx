import { useMemo, useState } from "react";

interface Semester {
    id: string;
    code: string;
    name: string;
    year: number;
    status: "active" | "pending" | "completed";
    startDate: string;
    endDate: string;
    courseCount: number;
    assignedTeachers: number;
    totalTeachers: number;
}

const semesters: Semester[] = [
    {
        id: "1",
        code: "HK2",
        name: "Học kỳ 2",
        year: 2026,
        status: "active",
        startDate: "2026-02-15",
        endDate: "2026-05-30",
        courseCount: 24,
        assignedTeachers: 18,
        totalTeachers: 20,
    },
    {
        id: "2",
        code: "HK1",
        name: "Học kỳ 1",
        year: 2026,
        status: "pending",
        startDate: "2026-09-01",
        endDate: "2026-12-20",
        courseCount: 28,
        assignedTeachers: 0,
        totalTeachers: 20,
    },
    {
        id: "3",
        code: "HK3",
        name: "Học kỳ 3",
        year: 2025,
        status: "completed",
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        courseCount: 12,
        assignedTeachers: 12,
        totalTeachers: 12,
    },
];

interface CourseAssignment {
    courseId: string;
    courseName: string;
    classCount: number;
    assignedTeacher?: string;
    status: "pending" | "assigned" | "in-progress" | "completed";
}

const courseAssignments: CourseAssignment[] = [
    { courseId: "1", courseName: "Lập trình C++", classCount: 3, assignedTeacher: "Nguyễn Văn A", status: "assigned" },
    { courseId: "2", courseName: "Cơ sở dữ liệu", classCount: 2, assignedTeacher: "Trần Thị B", status: "assigned" },
    { courseId: "3", courseName: "Web Development", classCount: 2, assignedTeacher: "Lê Văn C", status: "assigned" },
    { courseId: "4", courseName: "Đồ án I", classCount: 1, status: "pending" },
];

function getSemesterStatusLabel(status: Semester["status"]) {
    if (status === "active") return "Đang diễn ra";
    if (status === "pending") return "Sắp tới";
    return "Hoàn tất";
}

function getCourseStatusLabel(status: CourseAssignment["status"]) {
    if (status === "assigned") return "Đã phân công";
    if (status === "in-progress") return "Đang dạy";
    if (status === "completed") return "Hoàn tất";
    return "Chờ phân công";
}

function getStatusClasses(status: Semester["status"] | CourseAssignment["status"]) {
    if (status === "active" || status === "assigned" || status === "in-progress") {
        return "bg-green-100 text-green-700";
    }

    if (status === "pending") {
        return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
}

export default function SemesterManagement() {
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(semesters[0]);

    const stats = useMemo(() => {
        const pendingCount = courseAssignments.filter((course) => course.status === "pending").length;
        const assignedCount = courseAssignments.filter(
            (course) => course.status === "assigned" || course.status === "in-progress",
        ).length;
        const completionRate = Math.round(((courseAssignments.length - pendingCount) / courseAssignments.length) * 100);

        return {
            pendingCount,
            assignedCount,
            totalCount: courseAssignments.length,
            completionRate,
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Quản lý phân công</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Phân công giáo viên theo học kỳ</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {semesters.map((semester) => (
                    <button
                        key={semester.id}
                        type="button"
                        onClick={() => setSelectedSemester(semester)}
                        className={`rounded-2xl border p-5 text-left transition-colors ${
                            selectedSemester?.id === semester.id
                                ? "border-green-700 bg-green-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">
                                    {semester.code} {semester.year}
                                </p>
                                <h4 className="mt-1 text-lg font-bold text-slate-900">{semester.name}</h4>
                            </div>

                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(semester.status)}`}>
                                {getSemesterStatusLabel(semester.status)}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Môn học</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{semester.courseCount}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Đã gán</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{semester.assignedTeachers}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Tổng GV</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{semester.totalTeachers}</p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            {new Date(semester.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(semester.endDate).toLocaleDateString("vi-VN")}
                        </p>
                    </button>
                ))}
            </div>

            {selectedSemester && (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">
                                {selectedSemester.code} {selectedSemester.year}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                                {selectedSemester.courseCount} môn học, {selectedSemester.assignedTeachers}/
                                {selectedSemester.totalTeachers} giảng viên
                            </p>
                        </div>

                        <button className="rounded-xl bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800">
                            Phân công
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        {courseAssignments.map((course) => (
                            <div key={course.courseId} className="rounded-2xl border border-slate-200 px-4 py-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h5 className="font-bold text-slate-900">{course.courseName}</h5>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {course.classCount} lớp
                                            {" · "}
                                            {course.assignedTeacher || "Chưa gán giảng viên"}
                                        </p>
                                    </div>

                                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(course.status)}`}>
                                        {getCourseStatusLabel(course.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Chờ phân công</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{stats.pendingCount}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Đã phân công</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{stats.assignedCount}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Tổng môn</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalCount}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">Hoàn thành</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{stats.completionRate}%</p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
