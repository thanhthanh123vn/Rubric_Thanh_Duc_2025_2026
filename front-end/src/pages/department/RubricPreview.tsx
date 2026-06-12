import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { getRubricDetail, getAllClo, type RubricResponse } from "@/features/rubric/rubricApi.ts";

const PERCENT_RATIO_EPSILON = 0.0001;

const formatWeight = (weight: number) => {
    const isRatioValue = weight <= 1 + PERCENT_RATIO_EPSILON;
    const normalizedWeight = isRatioValue ? weight * 100 : weight;
    const rounded = Math.abs(normalizedWeight - Math.round(normalizedWeight)) < PERCENT_RATIO_EPSILON
        ? Math.round(normalizedWeight)
        : Number(normalizedWeight.toFixed(1));
    return `${rounded}%`;
};

// Component con chuyên dùng để Preview trong Modal
export function RubricPreview({ rubricId }: { rubricId: string }) {
    const [rubric, setRubric] = useState<RubricResponse | null>(null);
    const [clos, setClos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!rubricId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const [rubricRes, cloRes] = await Promise.all([
                    getRubricDetail(rubricId),
                    getAllClo()
                ]);
                setRubric(rubricRes);
                setClos(Array.isArray(cloRes.data) ? cloRes.data : []);
            } catch (error) {
                console.error("Lỗi fetch chi tiết rubric:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [rubricId]);

    const cloLookup = useMemo(() => {
        return clos.reduce((acc, clo) => {
            acc[clo.cloId] = clo;
            return acc;
        }, {} as Record<string, any>);
    }, [clos]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p>Đang tải ma trận tiêu chí...</p>
            </div>
        );
    }

    if (!rubric || !rubric.criteria || rubric.criteria.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                Rubric này hiện chưa có tiêu chí đánh giá nào.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Tiêu chí (Criterion)</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Trọng số</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">CĐR (CLO)</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                {rubric.criteria.map((criterion: any) => {
                    const clo = criterion.cloId ? cloLookup[criterion.cloId] : null;
                    return (
                        <tr key={criterion.id || criterion.criteriaId} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">
                                {criterion.name || criterion.criteriaName}
                            </td>
                            <td className="px-4 py-3 font-semibold text-indigo-600">
                                {formatWeight(criterion.weight)}
                            </td>
                            <td className="px-4 py-3">
                                {clo ? (
                                    <div className="inline-flex flex-col">
                                        <span className="font-bold text-emerald-700">{clo.cloCode}</span>
                                        {/* Ẩn tên CLO nếu quá dài, hoặc giữ nguyên tùy thiết kế */}
                                        <span className="text-xs text-slate-500 line-clamp-1">{clo.cloName}</span>
                                    </div>
                                ) : (
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase">
                                            Chưa gắn
                                        </span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}