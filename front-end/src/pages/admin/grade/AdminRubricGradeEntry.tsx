import {useEffect, useMemo, useRef, useState} from "react";
import {Download, FileSpreadsheet, Loader2, Save, Upload} from "lucide-react";
import {useParams} from "react-router-dom";
import {toast} from "sonner";

import {
    courseService,
    type CourseGradebook,
    type GradebookScorePayload,
} from "@/features/course/courseApi.ts";

type EditableScore = {
    studentId: string;
    fullName: string;
    attendanceScore: string;
    assignmentScore: string;
    examScore: string;
};

function scoreText(value?: number | null) {
    return value === null || value === undefined ? "" : value.toFixed(1);
}

function parseScore(value: string) {
    if (!value.trim()) return null;
    const score = Number(value);
    return Number.isFinite(score) ? Math.round(score * 10) / 10 : null;
}

function errorMessage(error: unknown) {
    const candidate = error as {response?: {data?: {message?: string} | string}};
    const data = candidate.response?.data;
    if (typeof data === "string") return data;
    return data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function AdminRubricGradeEntry() {
    const { offeringId} = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [savingConfig, setSavingConfig] = useState(false);
    const [savingScores, setSavingScores] = useState(false);
    const [importing, setImporting] = useState(false);
    const [gradebook, setGradebook] = useState<CourseGradebook | null>(null);
    const [attendanceWeight, setAttendanceWeight] = useState("10");
    const [assignmentWeight, setAssignmentWeight] = useState("40");
    const [rows, setRows] = useState<EditableScore[]>([]);

    const applyGradebook = (data: CourseGradebook) => {
        setGradebook(data);
        setAttendanceWeight(String(data.attendanceWeight ?? 10));
        setAssignmentWeight(String(data.assignmentWeight ?? 40));
        setRows((data.students || []).map((student) => ({
            studentId: student.studentId,
            fullName: student.fullName || student.studentId,
            attendanceScore: scoreText(student.attendanceScore),
            assignmentScore: scoreText(student.assignmentScore),
            examScore: scoreText(student.examScore),
        })));
    };

    useEffect(() => {
        if (!offeringId) return;
        const load = async () => {
            setLoading(true);
            try {
                applyGradebook(await courseService.getGradebook(offeringId));
            } catch (error) {
                toast.error(errorMessage(error));
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [offeringId]);

    const weights = useMemo(() => {
        const attendance = Number(attendanceWeight) || 0;
        const assignment = Number(assignmentWeight) || 0;
        const component = Math.round((attendance + assignment) * 10) / 10;
        return {attendance, assignment, component, exam: Math.round((100 - component) * 10) / 10};
    }, [attendanceWeight, assignmentWeight]);

    const updateRow = (studentId: string, field: "attendanceScore" | "assignmentScore" | "examScore", value: string) => {
        if (value && !/^\d{0,2}(\.\d{0,1})?$/.test(value)) return;
        setRows((current) => current.map((row) =>
            row.studentId === studentId ? {...row, [field]: value} : row));
    };

    const calculatedTotal = (row: EditableScore) => {
        const attendance = parseScore(row.attendanceScore);
        const assignment = parseScore(row.assignmentScore);
        const exam = parseScore(row.examScore);
        if (attendance === null || assignment === null || exam === null) return "--";
        return ((attendance * weights.attendance
            + assignment * weights.assignment
            + exam * weights.exam) / 100).toFixed(1);
    };

    const validateRows = () => {
        for (const row of rows) {
            for (const [label, value] of [
                ["Điểm chuyên cần", row.attendanceScore],
                ["Điểm bài tập", row.assignmentScore],
                ["Điểm thi", row.examScore],
            ]) {
                if (!value.trim()) continue;
                const score = Number(value);
                if (!Number.isFinite(score) || score < 0 || score > 10) {
                    toast.error(`${label} của sinh viên ${row.studentId} phải từ 0 đến 10.`);
                    return false;
                }
            }
        }
        return true;
    };

    const saveConfig = async () => {
        if (!offeringId) return;
        if (weights.attendance < 0 || weights.assignment < 0 || weights.component > 100) {
            toast.error("Tổng tỷ trọng chuyên cần và bài tập phải nằm trong khoảng 0% đến 100%.");
            return;
        }
        setSavingConfig(true);
        try {
            applyGradebook(await courseService.updateGradebookConfig(
                offeringId,
                weights.attendance,
                weights.assignment,
            ));
            toast.success("Đã lưu cấu hình tỷ trọng điểm.");
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            setSavingConfig(false);
        }
    };

    const saveScores = async () => {
        if (!offeringId || !validateRows()) return;
        const payload: GradebookScorePayload[] = rows.map((row) => ({
            studentId: row.studentId,
            attendanceScore: parseScore(row.attendanceScore),
            assignmentScore: parseScore(row.assignmentScore),
            examScore: parseScore(row.examScore),
        }));
        setSavingScores(true);
        try {
            applyGradebook(await courseService.updateGradebookScores(offeringId, payload));
            toast.success("Đã lưu bảng điểm học phần.");
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            setSavingScores(false);
        }
    };

    const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !offeringId) return;
        if (!/\.(xlsx|xls)$/i.test(file.name)) {
            toast.error("Vui lòng chọn file Excel định dạng .xlsx hoặc .xls.");
            event.target.value = "";
            return;
        }
        setImporting(true);
        try {
            const result = await courseService.importGradebook(offeringId, file);
            applyGradebook(result.gradebook);
            const errors = Array.isArray(result.errors) ? result.errors : [];
            if (errors.length) {
                toast.warning(`Đã nhập ${result.imported} sinh viên, ${errors.length} dòng bị lỗi.`);
            } else {
                toast.success(`Đã import điểm của ${result.imported} sinh viên.`);
            }
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            setImporting(false);
            event.target.value = "";
        }
    };

    const downloadTemplate = async () => {
        if (!offeringId) return;
        try {
            const blob = await courseService.downloadGradebookTemplate(offeringId);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `bang-diem-${offeringId}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    };

    if (loading) {
        return <div className="flex min-h-[360px] items-center justify-center rounded-2xl border bg-white">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-600" />
            <span className="text-sm text-slate-500">Đang tải bảng điểm...</span>
        </div>;
    }

    return <div className="space-y-6">
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Quản lý điểm</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Nhập điểm học phần</h1>
            <p className="mt-1 text-sm text-slate-500">
                Cấu hình tỷ trọng, nhập điểm trực tiếp hoặc cập nhật hàng loạt bằng Excel.
            </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3"><FileSpreadsheet className="h-5 w-5 text-emerald-600" /><div><h2 className="font-bold text-slate-900">Bảng nhập điểm</h2><p className="text-sm text-slate-500">{rows.length} sinh viên</p></div></div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Tải file mẫu</button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-60">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Import Excel</button>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={importExcel} className="hidden" />
                    <button type="button" onClick={saveScores} disabled={savingScores} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{savingScores ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu bảng điểm</button>
                </div>
            </div>
            <div className="max-h-[650px] overflow-auto">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-20 bg-emerald-50">
                    <tr>
                        <th rowSpan={2} className="w-14 border-b border-r border-slate-300 px-3 py-3">STT</th>
                        <th rowSpan={2} className="min-w-32 border-b border-r border-slate-300 px-3 py-3 text-left">MSSV</th>
                        <th rowSpan={2} className="min-w-56 border-b border-r border-slate-300 px-3 py-3 text-left">Họ và tên</th>
                        <th colSpan={2} className="border-b border-r border-slate-300 px-3 py-2">
                            <span>Điểm thành phần ({weights.component}%)</span>
                            {savingConfig ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" /> : null}
                        </th>
                        <th rowSpan={2} className="min-w-36 border-b border-r border-slate-300 px-3 py-3">Điểm thi ({weights.exam}%)</th>
                        <th rowSpan={2} className="min-w-28 border-b border-r border-slate-300 px-3 py-3">Điểm tổng</th>
                        <th rowSpan={2} className="min-w-24 border-b border-r border-slate-300 px-3 py-3">Điểm chữ</th>
                    </tr>
                    <tr>
                        <th className="min-w-40 border-b border-r border-slate-300 px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                                <span>Chuyên cần</span>
                                <input aria-label="Tỷ trọng điểm chuyên cần" type="number" min="0" max="100" step="0.1" value={attendanceWeight} onChange={(event) => setAttendanceWeight(event.target.value)} onBlur={() => void saveConfig()} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="h-8 w-16 rounded-md border border-emerald-300 bg-white px-2 text-center font-bold outline-none focus:ring-2 focus:ring-emerald-200" />
                                <span>%</span>
                            </div>
                        </th>
                        <th className="min-w-40 border-b border-r border-slate-300 px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                                <span>Bài tập</span>
                                <input aria-label="Tỷ trọng điểm bài tập" type="number" min="0" max="100" step="0.1" value={assignmentWeight} onChange={(event) => setAssignmentWeight(event.target.value)} onBlur={() => void saveConfig()} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="h-8 w-16 rounded-md border border-emerald-300 bg-white px-2 text-center font-bold outline-none focus:ring-2 focus:ring-emerald-200" />
                                <span>%</span>
                            </div>
                        </th>
                    </tr>
                    </thead>
                    <tbody>{rows.map((row, index) => {
                        const saved = gradebook?.students.find((student) => student.studentId === row.studentId);
                        return <tr key={row.studentId} className="odd:bg-white even:bg-slate-50/60">
                            <td className="border-b border-r border-slate-200 px-3 py-2 text-center text-slate-500">{index + 1}</td>
                            <td className="border-b border-r border-slate-200 px-3 py-2 font-mono font-medium">{row.studentId}</td>
                            <td className="border-b border-r border-slate-200 px-3 py-2 font-medium text-slate-800">{row.fullName}</td>
                            <td className="border-b border-r border-slate-200 p-1.5"><input id={`attendance-score-${row.studentId}`} aria-label={`Điểm chuyên cần ${row.studentId}`} inputMode="decimal" value={row.attendanceScore} onChange={(event) => updateRow(row.studentId, "attendanceScore", event.target.value)} className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-center font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="0 - 10" /></td>
                            <td className="border-b border-r border-slate-200 p-1.5"><input aria-label={`Điểm bài tập ${row.studentId}`} inputMode="decimal" value={row.assignmentScore} onChange={(event) => updateRow(row.studentId, "assignmentScore", event.target.value)} className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-center font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="0 - 10" /></td>
                            <td className="border-b border-r border-slate-200 p-1.5"><input aria-label={`Điểm thi ${row.studentId}`} inputMode="decimal" value={row.examScore} onChange={(event) => updateRow(row.studentId, "examScore", event.target.value)} className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-center font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="0 - 10" /></td>
                            <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-bold text-emerald-700">{calculatedTotal(row)}</td>
                            <td className="border-b border-r border-slate-200 px-3 py-2 text-center font-bold text-slate-700">{saved?.letterGrade || "--"}</td>
                        </tr>;
                    })}</tbody>
                </table>
                {rows.length === 0 ? <div className="py-16 text-center text-sm text-slate-500">Lớp học phần chưa có sinh viên.</div> : null}
            </div>
        </section>

    </div>;
}
