import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (course: any) => void;
    initialData?: any; // Nếu có initialData => Sửa, nếu không => Thêm mới
}

export default function CourseModal({ isOpen, onClose, onSave, initialData }: CourseModalProps) {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        semester: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Đổ dữ liệu vào form nếu là chế độ Sửa
    useEffect(() => {
        if (initialData) {
            setFormData({
                courseCode: initialData.courseCode || '',
                courseName: initialData.courseName || '',
                semester: initialData.semester || '',
                description: initialData.description || ''
            });
        } else {
            setFormData({ courseCode: '', courseName: '', semester: '', description: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {initialData ? 'Sửa môn học' : 'Thêm môn học mới'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Mã môn học</label>
                        <input
                            required
                            value={formData.courseCode}
                            onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            placeholder="VD: COMP101"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Tên môn học</label>
                        <input
                            required
                            value={formData.courseName}
                            onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            placeholder="VD: Nhập môn Lập trình"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Học kỳ</label>
                        <input
                            required
                            value={formData.semester}
                            onChange={(e) => setFormData({...formData, semester: e.target.value})}
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            placeholder="VD: HK1 2025-2026"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            {initialData ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}