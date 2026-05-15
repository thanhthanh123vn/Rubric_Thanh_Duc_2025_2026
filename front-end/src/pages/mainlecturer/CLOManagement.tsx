import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { bloomLevels } from './mainLecturerData';
import { getAllClo,createClo } from '@/features/rubric/rubricApi.ts';

interface CloItem {
    cloId: string;
    cloName: string;
    cloCode: string;
    courseId: string | null;
    description: string;
    bloomLevel: string;
}

export default function CLOManagement() {
    const [clos, setClos] = useState<CloItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCLO, setSelectedCLO] = useState<CloItem | null>(null);

    const [formData, setFormData] = useState({
        cloCode: '',
        cloName: '',
        description: '',
        bloomLevel: '',
        courseId: '',
    });

        const loadClos = async () => {
            try {
                const response = await getAllClo();
                setClos(response.data);
            } catch (error) {
                console.error('Lỗi lấy CLO:', error);
            }
        };

        useEffect(() => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void loadClos();
        }, []);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {
                await createClo({
                    cloCode: formData.cloCode,
                    cloName: formData.cloName,
                    description: formData.description,
                    bloomLevel: formData.bloomLevel,
                    courseId: formData.courseId || null,
                });

                await loadClos();

                setShowModal(false);

                setFormData({
                    cloCode: '',
                    cloName: '',
                    description: '',
                    bloomLevel: '',
                    courseId: '',
                });
            } catch (error) {
                console.error('Lỗi tạo CLO:', error);
            }
        };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                        Quản lý chuẩn đầu ra
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        Course Learning Outcomes (CLO)
                    </h3>
                </div>

                <button
                    onClick={() => {
                        setSelectedCLO(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5" />
                    Tạo CLO mới
                </button>
            </div>

            {/* CLO LIST */}
            <div className="space-y-3">
                {clos.map((clo) => (
                    <div
                        key={clo.cloId}
                        className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-600">
                                    {clo.cloCode}
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        {clo.cloName}
                                    </h4>

                                    <p className="mt-1 text-sm text-slate-600">
                                        {clo.description}
                                    </p>

                                    <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {clo.bloomLevel}
                    </span>

                                        {clo.courseId ? (
                                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {clo.courseId}
                      </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        Chưa gán môn học
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                                    <Eye className="h-5 w-5" />
                                </button>

                                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
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

            {/* BLOOM */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h4 className="font-bold text-slate-900">
                    Tham chiếu Bloom's Taxonomy
                </h4>

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

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Tạo CLO mới
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Tạo chuẩn đầu ra cho học phần
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[calc(90vh-100px)] space-y-5 overflow-y-auto p-6"
                        >
                            {/* CLO CODE */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Mã CLO
                                </label>

                                <input
                                    type="text"
                                    value={formData.cloCode}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cloCode: e.target.value,
                                        })
                                    }
                                    placeholder="VD: CLO1"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* CLO NAME */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Tên CLO
                                </label>

                                <input
                                    type="text"
                                    value={formData.cloName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cloName: e.target.value,
                                        })
                                    }
                                    placeholder="VD: Làm việc nhóm"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Mô tả
                                </label>

                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Mô tả CLO..."
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* BLOOM */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Bloom Level
                                </label>

                                <select
                                    value={formData.bloomLevel}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            bloomLevel: e.target.value,
                                        })
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="">Chọn Bloom Level</option>

                                    {bloomLevels.map((level) => (
                                        <option key={level.level} value={level.level}>
                                            {level.level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* COURSE */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Course ID (optional)
                                </label>

                                <input
                                    type="text"
                                    value={formData.courseId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            courseId: e.target.value,
                                        })
                                    }
                                    placeholder="VD: C001"
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* FOOTER */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                                >
                                    Tạo CLO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}