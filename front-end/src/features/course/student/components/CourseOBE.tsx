import React from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">TMDT Ca 2 thứ 3 phòng RD306</h2>
            <p className="text-sm opacity-90 mt-1">Tiến độ OBE của bạn</p>
        </div>
    );
};

const OverallProgress = () => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-700 font-medium">Tiến độ tổng</p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: "73%" }}></div>
            </div>

            <p className="text-right text-sm mt-1 text-gray-600">73%</p>
        </div>
    );
};

const CLOItem = ({ name, progress }: any) => {
    const getColor = () => {
        if (progress >= 75) return "bg-green-500";
        if (progress >= 50) return "bg-yellow-400";
        return "bg-red-500";
    };

    const getStatus = () => {
        if (progress >= 75) return "Đạt";
        if (progress >= 50) return "Cần cải thiện";
        return "Chưa đạt";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
                <p className="font-medium text-gray-900">{name}</p>
                <span className="text-sm font-semibold text-gray-600">{getStatus()}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className={`${getColor()} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>

            <p className="text-right text-sm mt-1 text-gray-600">{progress}%</p>
        </div>
    );
};

const CLOList = () => {
    const clos = [
        { name: "CLO1 - Hiểu kiến thức cơ bản", progress: 80 },
        { name: "CLO2 - Áp dụng thực hành", progress: 60 },
        { name: "CLO3 - Xây dựng hệ thống", progress: 90 },
    ];

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Chi tiết chuẩn đầu ra (CLO)</h3>
            {clos.map((clo, index) => (
                <CLOItem key={index} {...clo} />
            ))}
        </div>
    );
};

const SuggestionBox = () => {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-2xl">
            <p className="font-semibold text-yellow-700">Gợi ý cải thiện</p>
            <ul className="text-sm mt-2 list-disc ml-5 text-gray-700">
                <li>Bạn chưa đạt CLO2 → nên làm lại Assignment 2</li>
                <li>Thực hành thêm để cải thiện kỹ năng</li>
            </ul>
        </div>
    );
};

const CourseOBE = () => {
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
                        <OverallProgress />
                        <CLOList />
                        <SuggestionBox />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseOBE;