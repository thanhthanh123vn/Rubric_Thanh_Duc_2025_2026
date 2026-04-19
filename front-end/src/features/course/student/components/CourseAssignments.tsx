
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import {useNavigate, useParams} from "react-router-dom";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">TMDT Ca 2 thứ 3 phòng RD306</h2>
            <p className="text-sm opacity-90 mt-1">Danh sách bài tập</p>
        </div>
    );
};

const AssignmentCard = ({ id, title, dueDate, status, clos }: any) => {
    const navigate = useNavigate();
    const { id: courseId } = useParams();

    const getStatusColor = () => {
        switch (status) {
            case "Chưa nộp":
                return "text-red-500";
            case "Đã nộp":
                return "text-yellow-500";
            case "Đã chấm":
                return "text-green-600";
            default:
                return "text-gray-500";
        }
    };

    const getStatusBg = () => {
        switch (status) {
            case "Chưa nộp":
                return "bg-red-50";
            case "Đã nộp":
                return "bg-yellow-50";
            case "Đã chấm":
                return "bg-green-50";
            default:
                return "bg-gray-50";
        }
    };

    const handleClick = () => {
        navigate(`/course/${courseId}/assignments/${id}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {clos?.map((clo: string, index: number) => (
                            <span
                                key={index}
                                className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md"
                            >
                                {clo}
                             </span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Hạn nộp: {dueDate}</p>
                </div>

                <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {status}
                </span>
            </div>

            <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${getStatusBg()}`}>
                {status === "Chưa nộp" && "Bạn chưa nộp bài này"}
                {status === "Đã nộp" && "Bài đã được nộp, chờ chấm điểm"}
                {status === "Đã chấm" && "Đã có điểm và nhận xét"}
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleClick}
                    className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                    {status === "Chưa nộp" ? "Nộp bài" : "Xem chi tiết"}
                </button>
            </div>
        </div>
    );
};
const CourseAssignments = () => {
    const assignments = [
        {
            id: 1,
            title: "Assignment 1 - Thiết kế UI",
            dueDate: "10/04/2026",
            status: "Đã chấm",
            clos: ["CLO1", "CLO2"],
        },
        {
            id: 2,
            title: "Assignment 2 - Xây dựng API",
            dueDate: "15/04/2026",
            status: "Đã nộp",
            clos: ["CLO2"],
        },
        {
            id: 3,
            title: "Assignment 3 - Hoàn thiện hệ thống",
            dueDate: "20/04/2026",
            status: "Chưa nộp",
            clos: ["CLO2", "CLO3"],
        },
    ];
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* HEADER */}
            <Header />

            <div className="flex">
                {/* SIDEBAR */}
                <Sidebar />

                {/* CONTENT */}
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner />

                        {assignments.map((item, index) => (
                            <AssignmentCard key={index} {...item} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAssignments;