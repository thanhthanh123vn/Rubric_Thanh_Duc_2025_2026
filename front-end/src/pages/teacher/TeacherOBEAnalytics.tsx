import { useParams } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function TeacherOBEAnalytics() {
    const { id } = useParams();

    const clos = [
        { cloCode: "CLO1", progressPercent: 65 },
        { cloCode: "CLO2", progressPercent: 30 },
        { cloCode: "CLO3", progressPercent: 80 },
    ];

    const barData = {
        labels: clos.map((c) => c.cloCode),
        datasets: [
            {
                label: "Tiến độ (%)",
                data: clos.map((c) => c.progressPercent),
                backgroundColor: clos.map((c) =>
                    c.progressPercent < 40
                        ? "#ef4444"
                        : c.progressPercent < 70
                            ? "#f59e0b"
                            : "#22c55e"
                ),
            },
        ],
    };

    // 🔵 Distribution
    const distributionData = {
        labels: ["0-40%", "40-70%", "70-100%"],
        datasets: [
            {
                data: [10, 20, 10],
                backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
            },
        ],
    };

    // 🔵 Pass / Fail
    const passFailData = {
        labels: ["Đạt", "Không đạt"],
        datasets: [
            {
                data: [25, 15],
                backgroundColor: ["#22c55e", "#ef4444"],
            },
        ],
    };
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
    };
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h2 className="text-xl font-bold">
                OBE Analytics - Course {id}
            </h2>

            {/* CLO Bar */}
            <div className="bg-white p-4 rounded-2xl shadow h-[350px]">
                <p className="font-semibold mb-2">Tiến độ theo CLO</p>
                <div className="h-full">
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>

            {/* 2 chart dưới */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Distribution */}
                <div className="bg-white p-4 rounded-2xl shadow h-[300px] flex flex-col">
                    <p className="font-semibold mb-2">Phân bố điểm</p>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[220px] h-[220px]">
                            <Doughnut data={distributionData} />
                        </div>
                    </div>
                </div>

                {/* Pass Fail */}
                <div className="bg-white p-4 rounded-2xl shadow h-[300px] flex flex-col">
                    <p className="font-semibold mb-2">Đạt / Không đạt</p>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[220px] h-[220px]">
                            <Doughnut data={passFailData} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}