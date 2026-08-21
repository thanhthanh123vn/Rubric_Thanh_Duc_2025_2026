import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getCloById, getCourseOptions, type CloResponse, type CourseOption } from "@/features/rubric/rubricApi.ts";

function InfoCard({ label, value }: { label: string; value: string }) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 text-lg font-bold text-slate-900">{value}</p></div>;
}

export default function CLODetail() {
    const { cloId = "" } = useParams();
    const [clo, setClo] = useState<CloResponse | null>(null);
    const [course, setCourse] = useState<CourseOption | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([getCloById(cloId), getCourseOptions()])
            .then(([cloResponse, courses]) => {
                if (!active) return;
                setClo(cloResponse.data);
                setCourse(courses.find((item) => item.courseId === cloResponse.data.courseId) || null);
            })
            .catch((error) => console.error("Không thể tải chi tiết CLO", error))
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [cloId]);

    if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Đang tải chi tiết CLO...</div>;
    if (!clo) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-medium text-rose-700">Không tìm thấy CLO.</div>;

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5">
            <Link to={`/mainlecturer/clo?courseId=${encodeURIComponent(clo.courseId)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />Quay lại CLO của khóa học</Link>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{clo.cloCode}</span><h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{clo.cloName}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{clo.description || "Chưa có mô tả."}</p></div>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700"><Target className="h-5 w-5" /><div><p className="text-xs font-semibold uppercase tracking-[0.16em]">Bloom</p><p className="text-sm font-bold">{clo.bloomLevel}</p></div></div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2"><InfoCard label="Mã CLO" value={clo.cloCode} /><InfoCard label="Khóa học sở hữu" value={course?.courseCode || clo.courseId} /></div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><BookOpenCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-bold text-slate-900">Khóa học</h2><p className="text-sm text-slate-500">Mỗi CLO chỉ thuộc duy nhất một khóa học</p></div></div>
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{course?.courseCode || clo.courseId}</p><p className="mt-2 text-lg font-bold text-slate-900">{course?.courseName || "Khóa học"}</p>{course?.department ? <p className="mt-1 text-sm text-slate-600">{course.department}</p> : null}</div>
            </section>
        </div>
    );
}
