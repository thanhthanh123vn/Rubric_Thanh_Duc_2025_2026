import { useEffect, useMemo, useState } from "react";
import { Trash2, X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rubricApi } from "@/api/RubricApi.ts";

// TODO: Import đúng đường dẫn API của bạn
import courseService from "@/pages/admin/api/courseService.ts";
import {getAllClo} from "@/features/rubric/rubricApi.ts";
 // Thay bằng đường dẫn file chứa hàm getAllClo của bạn

type CloType = {
    cloId: string;
    cloCode: string;
    description?: string; // Tùy chọn nếu API có trả về
};

export interface Level {
    id?: string;
    name: string;
    orderIndex: number;
    score: number;
    description: string;
}

type CriteriaType = {
    id?: string;
    name: string;
    weight: number;
    cloId: string | null;

};

type RubricResponse = {
    rubricId: string;
    rubricName: string;
    description: string;
    totalWeight: number;
    courseId?: string; // Bổ sung courseId
    criteria: CriteriaType[];
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    rubric?: RubricResponse | null;
    courseId?: string; // Dùng làm giá trị mặc định nếu được truyền từ cha
};

export default function CreateRubricModal({
                                              open,
                                              onClose,
                                              onSuccess,
                                              rubric,
                                              courseId = ""
                                          }: Props) {
    const [rubricName, setRubricName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState(courseId);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);

    const [clos, setClos] = useState<CloType[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const [criteria, setCriteria] = useState<CriteriaType[]>([
        { name: "", weight: 0, cloId: null},
    ]);

    // 1. Fetch Dữ liệu Môn học và CLO khi mở Modal
    useEffect(() => {
        if (!open) return;

        const loadInitialData = async () => {
            setIsFetchingData(true);
            try {
                const [coursesData, closData] = await Promise.all([
                    courseService.getLecturerDashBoardCourses(),
                    getAllClo()
                ]);


                setCourses(coursesData || []);



                setClos(closData.data || closData || []);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu phụ:", error);
                toast.error("Không thể tải danh sách môn học hoặc CLO.");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadInitialData();
    }, [open]);

    // 2. Mapping dữ liệu từ API Response vào State của Form khi Edit
    useEffect(() => {
        if (!rubric) {
            setRubricName("");
            setDescription("");
            setSelectedCourseId(courseId); // Reset về mặc định
            setCriteria([{ name: "", weight: 0, cloId: null}]);
            return;
        }

        setRubricName(rubric.rubricName);
        setDescription(rubric.description || "");
        if (rubric.courseId) setSelectedCourseId(rubric.courseId);

        setCriteria(
            rubric.criteria.map((item) => ({
                id: item.id,
                name: item.name,
                cloId: item.cloId,
                weight: Number(item.weight) * 100,

            }))
        );
    }, [rubric, open, courseId]);

    const totalWeight = useMemo(() => {
        return criteria.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    }, [criteria]);

    const handleAddCriteria = () => {
        setCriteria((prev) => [...prev, { name: "", weight: 0, cloId: null, levels: [] }]);
    };

    const handleRemoveCriteria = (index: number) => {
        setCriteria((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeCriteria = (index: number, field: keyof CriteriaType, value: any) => {
        setCriteria((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    const handleSubmit = async (submitForApproval: boolean) => {
        if (!selectedCourseId) {
            toast.error("Vui lòng chọn Môn học!");
            return;
        }

        if (!rubricName.trim()) {
            toast.error("Vui lòng nhập Tên Rubric!");
            return;
        }

        if (totalWeight !== 100) {
            toast.error("Tổng trọng số của các tiêu chí phải bằng đúng 100%!");
            return;
        }

        const payload = {
            rubricName,
            description,
            courseId: selectedCourseId, // Dùng selectedCourseId từ dropdown
            submitForApproval,
            criteria: criteria.map((item) => ({
                criteriaId: item.id,
                criteriaName: item.name,
                cloId: item.cloId,
                weight: Number(item.weight) / 100,

            })),
        };

        setIsSubmitting(true);
        try {
            if (rubric?.rubricId) {
                // await rubricApi.updateRubric(rubric.rubricId, payload);
                toast.success("Cập nhật Rubric thành công!");
            } else {
                await rubricApi.createRubric(payload);
                toast.success(submitForApproval ? "Đã gửi Rubric đi phê duyệt!" : "Đã lưu bản nháp Rubric thành công!");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi: " + (error.response?.data?.message || "Không thể lưu dữ liệu Rubric"));
        } finally {
            setIsSubmitting(false);
        }
    };
    console.log(courses);
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                            Rubric cấu trúc mẫu
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            {rubric ? "Chỉnh sửa Rubric" : "Tạo Rubric mới"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[70vh] space-y-6 overflow-y-auto px-8 py-6">
                    {isFetchingData ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                            <p>Đang tải dữ liệu Môn học và CLO...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Course Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Môn học áp dụng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                                    >
                                        <option value="" disabled>-- Chọn môn học do bạn phụ trách --</option>
                                        {courses.map((c) => (
                                            <option key={c.courseId || c.offeringId} value={c.courseId || c.offeringId}>
                                                {c.courseCode} - {c.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Tên Rubric <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={rubricName}
                                        onChange={(e) => setRubricName(e.target.value)}
                                        placeholder="VD: Rubric đánh giá đồ án cuối kỳ"
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Mô tả chi tiết
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập ghi chú hoặc mô tả khung rubric..."
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                                />
                            </div>

                            {/* Criteria */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Tiêu chí đánh giá
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Thêm tiêu chí, ánh xạ chuẩn đầu ra CLO và chia trọng số tương ứng
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCriteria}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm tiêu chí
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {criteria.map((criterion, index) => (
                                        <div key={index} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                                            <div className="grid gap-4 md:grid-cols-12">
                                                {/* Name */}
                                                <div className="md:col-span-5">
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                                                        Tên tiêu chí
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={criterion.name}
                                                        onChange={(e) => handleChangeCriteria(index, "name", e.target.value)}
                                                        placeholder="VD: Khả năng vận hành thiết bị"
                                                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                                                    />
                                                </div>

                                                {/* CLO */}
                                                <div className="md:col-span-3">
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                                                        Mục tiêu (CLO)
                                                    </label>
                                                    <select
                                                        value={criterion.cloId || ""}
                                                        onChange={(e) => handleChangeCriteria(index, "cloId", e.target.value || null)}
                                                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                                                    >
                                                        <option value="">Chưa gắn CLO</option>
                                                        {clos.map((clo) => (
                                                            <option key={clo.cloId} value={clo.cloId}>
                                                                {clo.cloCode}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Weight */}
                                                <div className="md:col-span-3">
                                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                                                        Trọng số (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={criterion.weight || ""}
                                                        onChange={(e) => handleChangeCriteria(index, "weight", Number(e.target.value))}
                                                        placeholder="VD: 20"
                                                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                                                    />
                                                </div>

                                                {/* Delete */}
                                                <div className="flex items-end md:col-span-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCriteria(index)}
                                                        className="w-full flex justify-center rounded-xl border border-red-200 p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        disabled={criteria.length === 1}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Weight Alert */}
                            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Tổng trọng số phân bổ</p>
                                        <p className={`mt-1 text-2xl font-bold ${totalWeight === 100 ? 'text-indigo-600' : 'text-red-500'}`}>
                                            {totalWeight}%
                                        </p>
                                    </div>
                                    <div className={`rounded-xl px-4 py-2 text-sm font-semibold ${totalWeight === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {totalWeight === 100 ? "Hợp lệ" : "Tổng tỷ lệ phần trăm các tiêu chí phải đạt chính xác 100%"}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-5 bg-slate-50/50 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isFetchingData}
                        className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={totalWeight !== 100 || isSubmitting || isFetchingData}
                        className="flex items-center rounded-xl bg-slate-200 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                        Lưu bản nháp
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={totalWeight !== 100 || isSubmitting || isFetchingData}
                        className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                        {rubric ? "Cập nhật & Gửi duyệt" : "Tạo mới & Gửi duyệt"}
                    </button>
                </div>
            </div>
        </div>
    );
}