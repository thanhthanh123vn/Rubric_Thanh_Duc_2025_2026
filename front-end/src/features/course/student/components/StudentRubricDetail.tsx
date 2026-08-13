import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, LayoutList, Scale, Edit2, Save, X, Plus, Trash2, Printer } from 'lucide-react';
import { getRubricById, updateRubric } from "@/pages/mainlecturer/api/RubricAPI.ts";
import LMSLayout from "@/app/lms-layout";
import { Button } from "@/components/ui/button";

interface CriteriaResponse {
    id: string;
    cloId: string;
    criteriaName: string;
    weight: number;
}

interface RubricDetailResponse {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
    criteria: CriteriaResponse[];
}

export default function StudentRubricDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [rubric, setRubric] = useState<RubricDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedCriteria, setEditedCriteria] = useState<CriteriaResponse[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchRubricDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getRubricById(id);
                setRubric(response.data);
                setEditedCriteria(response.data.criteria || []);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết Rubric:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRubricDetail();
    }, [id]);

    const handleAddCriteria = () => {
        const newCriteria: CriteriaResponse = {
            id: `new-${Date.now()}`,
            cloId: '',
            criteriaName: '',
            weight: 0
        };
        setEditedCriteria([...editedCriteria, newCriteria]);
    };

    const handleDeleteCriteria = (idToDelete: string) => {
        setEditedCriteria(editedCriteria.filter(item => item.id !== idToDelete));
    };

    const handleCriteriaChange = (index: number, field: keyof CriteriaResponse, value: string | number) => {
        const newCriteria = [...editedCriteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setEditedCriteria(newCriteria);
    };

    const currentTotalWeight = editedCriteria.reduce((sum, item) => sum + Number(item.weight || 0), 0);

    const handleSave = async () => {
        if (!rubric) return;

        if (currentTotalWeight !== 100) {
            if (!confirm(`Tổng trọng số hiện tại là ${currentTotalWeight}%, không bằng 100%. Bạn vẫn muốn lưu chứ?`)) {
                return;
            }
        }

        const updatedRubric: RubricDetailResponse = {
            ...rubric,
            totalWeight: currentTotalWeight,
            criteria: editedCriteria,
        };

        try {
            setIsSaving(true);
            await updateRubric(rubric.id, updatedRubric);
            setRubric(updatedRubric);
            setIsEditing(false);
            alert("Đã cập nhật Rubric thành công!");
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LMSLayout><div className="text-center py-20 text-slate-500">Đang tải dữ liệu...</div></LMSLayout>;
    if (!rubric) return <LMSLayout><div className="text-center py-20 text-red-500">Không tìm thấy Rubric!</div></LMSLayout>;

    return (
        <LMSLayout>
            <div className="flex flex-col p-3 md:p-5 bg-gray-50/30 min-h-screen w-full overflow-x-hidden space-y-6">

                {/* TIÊU ĐỀ & NÚT ĐIỀU HƯỚNG/IN */}
                <div className="border-b-2 border-emerald-700 pb-2 mb-2 flex flex-wrap gap-3 justify-between items-end">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-emerald-600 border border-slate-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Chi tiết Rubric</p>
                            <h1 className="text-lg md:text-xl font-bold text-emerald-800 uppercase tracking-tight mt-0.5">
                                {rubric.name}
                            </h1>
                        </div>
                    </div>

                    {/*<div className="flex gap-2">*/}
                    {/*    {!isEditing ? (*/}
                    {/*        <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors h-9 text-xs">*/}
                    {/*            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Chỉnh sửa*/}
                    {/*        </Button>*/}
                    {/*    ) : (*/}
                    {/*        <>*/}
                    {/*            <Button variant="outline" onClick={() => setIsEditing(false)} className="h-9 text-xs">*/}
                    {/*                <X className="w-3.5 h-3.5 mr-1.5" /> Hủy*/}
                    {/*            </Button>*/}
                    {/*            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 h-9 text-xs">*/}
                    {/*                <Save className="w-3.5 h-3.5 mr-1.5" /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}*/}
                    {/*            </Button>*/}
                    {/*        </>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                </div>

                {/* NỘI DUNG CHÍNH */}
                <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr]">
                    {/* Thông tin tổng quan */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <LayoutList className="h-5 w-5 text-emerald-600" />
                            <h4 className="text-lg font-bold text-slate-900">Trạng thái Rubric</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Scale className="h-4 w-4" /> Tổng trọng số</span>
                                    <span className={`font-bold ${currentTotalWeight === 100 ? 'text-emerald-600' : 'text-red-500'}`}>{currentTotalWeight}%</span>
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                    <div className={`h-full rounded-full ${currentTotalWeight === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(currentTotalWeight, 100)}%` }} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Mô tả: {rubric.description}</p>
                        </div>
                    </div>

                    {/* Danh sách Tiêu chí */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-cyan-600" />
                                <h4 className="text-lg font-bold text-slate-900">Tiêu chí đánh giá</h4>
                            </div>
                            {isEditing && (
                                <button onClick={handleAddCriteria} className="flex items-center gap-1 text-sm font-semibold bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full hover:bg-cyan-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Thêm tiêu chí
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-xl font-semibold w-1/2">Tên tiêu chí</th>
                                    <th className="px-4 py-3 font-semibold">Mã CLO</th>
                                    <th className="px-4 py-3 font-semibold text-right">Trọng số (%)</th>
                                    {isEditing && <th className="px-4 py-3 rounded-tr-xl w-10"></th>}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {editedCriteria.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 group">
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input type="text" value={item.criteriaName} onChange={(e) => handleCriteriaChange(index, 'criteriaName', e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nhập tên tiêu chí..." />
                                            ) : (
                                                <span className="font-medium text-slate-800">{item.criteriaName}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input type="text" value={item.cloId} onChange={(e) => handleCriteriaChange(index, 'cloId', e.target.value)} className="w-24 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="CLO..." />
                                            ) : (
                                                <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">{item.cloId || 'N/A'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isEditing ? (
                                                <input type="number" value={item.weight} onChange={(e) => handleCriteriaChange(index, 'weight', parseFloat(e.target.value))} className="w-20 border border-slate-200 rounded-md px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500" min="0" max="100" />
                                            ) : (
                                                <span className="font-semibold text-emerald-600">{item.weight}%</span>
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleDeleteCriteria(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {editedCriteria.length === 0 && (
                                <div className="text-center py-10 text-slate-400">Danh sách trống. Nhấn "Thêm tiêu chí" để bắt đầu.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </LMSLayout>
    );
}