import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateAssignment = ({ courseId }: { courseId: string }) => {
    const [assignment, setAssignment] = useState({
        title: '',
        description: '',
        rubricId: '', // ID chuẩn: R1, R2 hoặc R3
        dueDate: ''
    });

    const [rubrics, setRubrics] = useState<any[]>([]);

    // Lấy danh sách 3 Rubric chuẩn từ rubric-service
    useEffect(() => {
        const fetchRubrics = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/rubrics');
                setRubrics(response.data);
            } catch (error) {
                console.error("Lỗi khi tải Rubric", error);
            }
        };
        fetchRubrics();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/assessments', {
                ...assignment,
                courseId
            });
            alert("Giao bài tập thành công!");
        } catch (error) {
            alert("Lỗi khi giao bài tập");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Tạo Bài Tập / Đồ Án Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Tiêu đề bài tập</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setAssignment({...assignment, title: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Chọn chuẩn Rubric chấm điểm</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={assignment.rubricId}
                        onChange={(e) => setAssignment({...assignment, rubricId: e.target.value})}
                        required
                    >
                        <option value="">-- Chọn Rubric --</option>
                        {rubrics.map(r => (
                            <option key={r.rubricId} value={r.rubricId}>
                                {r.rubricName}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1 italic">
                        * Hệ thống sẽ tự động áp dụng các tiêu chí từ đề cương cho bài tập này.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium">Hạn nộp</label>
                    <input
                        type="datetime-local"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setAssignment({...assignment, dueDate: e.target.value})}
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Giao Bài Tập
                </button>
            </form>
        </div>
    );
};
export default CreateAssignment;