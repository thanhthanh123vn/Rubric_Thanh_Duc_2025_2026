import { Edit2, Eye, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bloomLevels } from "./mainLecturerData";
import {
    createClo,
    getAllClo,
    getCourseOptions,
    updateClo,
    type CloPayload,
    type CloResponse,
    type CourseOption,
} from "@/features/rubric/rubricApi.ts";

type FormState = {
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    courseIds: string[];
};

const emptyForm: FormState = {
    cloCode: "",
    cloName: "",
    description: "",
    bloomLevel: "",
    courseIds: [],
};

export default function CLOManagement() {
    const [clos, setClos] = useState<CloResponse[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingClo, setEditingClo] = useState<CloResponse | null>(null);
    const [formData, setFormData] = useState<FormState>(emptyForm);

    const courseNameMap = useMemo(
        () =>
            courses.reduce<Record<string, string>>((accumulator, course) => {
                accumulator[course.courseId] = course.courseName;
                return accumulator;
            }, {}),
        [courses],
    );

    const loadData = async () => {
        try {
            const [cloResponse, courseResponse] = await Promise.all([
                getAllClo(),
                getCourseOptions(),
            ]);

            setClos(Array.isArray(cloResponse.data) ? cloResponse.data : []);
            setCourses(courseResponse);
        } catch (error) {
            console.error("Loi tai du lieu CLO:", error);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const openCreateModal = () => {
        setEditingClo(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (clo: CloResponse) => {
        setEditingClo(clo);
        setFormData({
            cloCode: clo.cloCode ?? "",
            cloName: clo.cloName ?? "",
            description: clo.description ?? "",
            bloomLevel: clo.bloomLevel ?? "",
            courseIds: (clo.courseMappings ?? []).map((mapping) => mapping.courseId),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClo(null);
        setFormData(emptyForm);
    };

    const handleCourseToggle = (courseId: string) => {
        setFormData((current) => {
            const exists = current.courseIds.includes(courseId);

            return {
                ...current,
                courseIds: exists
                    ? current.courseIds.filter((id) => id !== courseId)
                    : [...current.courseIds, courseId],
            };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const payload: CloPayload = {
            cloCode: formData.cloCode.trim(),
            cloName: formData.cloName.trim(),
            description: formData.description.trim(),
            bloomLevel: formData.bloomLevel,
            courseIds: formData.courseIds,
        };

        try {
            if (editingClo) {
                await updateClo(editingClo.cloId, payload);
            } else {
                await createClo(payload);
            }

            await loadData();
            closeModal();
        } catch (error) {
            console.error("Loi luu CLO:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                        Quan ly chuan dau ra
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        Course Learning Outcomes (CLO)
                    </h3>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                    <Plus className="h-5 w-5" />
                    Tao CLO moi
                </button>
            </div>

            <div className="space-y-3">
                {clos.map((clo) => (
                    <div
                        key={clo.cloId}
                        className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-green-700">
                                    {clo.cloCode}
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">{clo.cloName}</h4>
                                    <p className="mt-1 text-sm text-slate-600">{clo.description}</p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            {clo.bloomLevel}
                                        </span>

                                        {(clo.courseMappings ?? []).length > 0 ? (
                                            (clo.courseMappings ?? []).map((mapping) => (
                                                <span
                                                    key={`${clo.cloId}-${mapping.courseId}`}
                                                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                                >
                                                    {courseNameMap[mapping.courseId] ?? mapping.courseId}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                Chua gan khoa hoc
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/mainlecturer/clo/${clo.cloId}`}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700"
                                >
                                    <Eye className="h-5 w-5" />
                                </Link>

                                <button
                                    onClick={() => openEditModal(clo)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-700"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>

                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h4 className="font-bold text-slate-900">Tham chieu Bloom&apos;s Taxonomy</h4>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {bloomLevels.map((level) => (
                        <div
                            key={level.level}
                            className={`rounded-lg border p-3 text-center text-sm font-medium ${level.color}`}
                        >
                            {level.level}
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 p-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingClo ? "Chinh sua CLO" : "Tao CLO moi"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingClo
                                        ? "Cap nhat thong tin va cac khoa hoc duoc ap dung."
                                        : "Tao chuan dau ra va gan vao mot hoac nhieu khoa hoc."}
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[calc(90vh-100px)] space-y-5 overflow-y-auto p-6"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Ma CLO</label>
                                    <input
                                        type="text"
                                        value={formData.cloCode}
                                        onChange={(event) =>
                                            setFormData((current) => ({
                                                ...current,
                                                cloCode: event.target.value,
                                            }))
                                        }
                                        placeholder="VD: CLO1"
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Bloom Level</label>
                                    <select
                                        value={formData.bloomLevel}
                                        onChange={(event) =>
                                            setFormData((current) => ({
                                                ...current,
                                                bloomLevel: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                                        required
                                    >
                                        <option value="">Chon Bloom Level</option>
                                        {bloomLevels.map((level) => (
                                            <option key={level.level} value={level.level}>
                                                {level.level}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Ten CLO</label>
                                <input
                                    type="text"
                                    value={formData.cloName}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            cloName: event.target.value,
                                        }))
                                    }
                                    placeholder="VD: Lam viec nhom"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Mo ta</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Mo ta CLO..."
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-green-600 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <label className="block text-sm font-semibold text-slate-700">Gan khoa hoc</label>
                                    <span className="text-xs font-medium text-slate-500">
                                        Da chon {formData.courseIds.length} khoa hoc
                                    </span>
                                </div>

                                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-3">
                                    {courses.length === 0 ? (
                                        <p className="text-sm text-slate-500">Chua tai duoc danh sach khoa hoc.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {courses.map((course) => {
                                                const checked = formData.courseIds.includes(course.courseId);

                                                return (
                                                    <label
                                                        key={course.courseId}
                                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${
                                                            checked
                                                                ? "border-green-200 bg-green-50"
                                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => handleCourseToggle(course.courseId)}
                                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                                                        />

                                                        <div>
                                                            <p className="font-medium text-slate-900">{course.courseName}</p>
                                                            <p className="text-sm text-slate-500">{course.courseId}</p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Huy
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
                                >
                                    {editingClo ? "Luu thay doi" : "Tao CLO"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
