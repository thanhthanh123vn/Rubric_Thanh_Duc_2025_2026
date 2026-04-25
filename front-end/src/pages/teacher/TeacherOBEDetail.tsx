import { useParams } from "react-router-dom";

export default function TeacherOBEDetail() {
    const { cloId } = useParams();

    // 🔥 mock data
    const students = [
        { name: "Nguyễn Văn A", score: 80 },
        { name: "Trần Văn B", score: 45 },
        { name: "Lê Văn C", score: 30 },
        { name: "Phạm Văn D", score: 70 },
        { name: "Hoàng Văn E", score: 55 },
    ];

    const total = students.length;
    const passCount = students.filter((s) => s.score >= 50).length;
    const failCount = total - passCount;
    const avg =
        students.reduce((sum, s) => sum + s.score, 0) / total;

    const getColor = (score: number) => {
        if (score >= 70) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">
                    Chi tiết {cloId}
                </h2>
                <p className="text-sm text-gray-500">
                    Phân tích kết quả học tập theo chuẩn đầu ra
                </p>
            </div>

            {/* 🔵 Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Trung bình</p>
                    <p className="text-xl font-bold">
                        {Math.round(avg)}%
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Đạt</p>
                    <p className="text-xl font-bold text-green-600">
                        {passCount}/{total}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <p className="text-sm text-gray-500">Không đạt</p>
                    <p className="text-xl font-bold text-red-600">
                        {failCount}/{total}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold mb-3">
                    Danh sách sinh viên
                </p>

                {students.map((s, i) => {
                    const isWeak = s.score < 50;

                    return (
                        <div
                            key={i}
                            className={`mb-3 p-3 rounded-lg ${
                                isWeak
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-slate-50"
                            }`}
                        >
                            <div className="flex justify-between mb-1">
                            <span className="font-medium">
                              {s.name}
                            </span>
                                <span
                                    className={`font-bold ${
                                        isWeak ? "text-red-500" : ""
                                    }`}
                                >
                  {s.score}%
                </span>
                            </div>

                            {/* Progress */}
                            <div className="h-2 bg-gray-200 rounded">
                                <div
                                    className={`h-2 rounded ${getColor(
                                        s.score
                                    )}`}
                                    style={{ width: `${s.score}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🔵 Mapping */}
            <div className="bg-white p-4 rounded-xl shadow">
                <p className="font-semibold mb-2">
                    Nguồn đánh giá (Mapping)
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Assignment 1</span>
                        <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Quiz</span>
                        <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Project</span>
                        <span>50%</span>
                    </div>
                </div>
            </div>

            {/* 🔵 Insight */}
            <div className="bg-white p-4 rounded-xl shadow">
                <p className="font-semibold mb-2">Nhận định</p>
                <p className="text-sm text-gray-600">
                    {avg < 50
                        ? "CLO này đang có vấn đề, đa số sinh viên chưa đạt."
                        : avg < 70
                            ? "CLO đạt mức trung bình, cần cải thiện thêm."
                            : "CLO đạt tốt, đa số sinh viên đã nắm vững."}
                </p>
            </div>
        </div>
    );
}