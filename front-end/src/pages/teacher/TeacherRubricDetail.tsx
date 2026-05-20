import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, LayoutList, Scale, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { getRubricById, updateRubric } from "@/pages/mainlecturer/api/RubricAPI.ts";

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

export default function TeacherRubricDetail() {
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

    if (loading) return <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>;
    if (!rubric) return <div className="text-center py-10 text-red-500">Không tìm thấy Rubric!</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-emerald-600">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Chi tiết Rubric</p>
                        <h3 className="mt-1 text-2xl font-bold text-slate-900">{rubric.name}</h3>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                            <Edit2 className="w-4 h-4" /> Chỉnh sửa
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">
                                <X className="w-4 h-4" /> Hủy
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </>
                    )}
                </div>
            </div>

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
    );
}