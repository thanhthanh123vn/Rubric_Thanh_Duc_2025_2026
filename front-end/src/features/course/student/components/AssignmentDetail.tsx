import React from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
                Assignment 2 - Xây dựng API
            </h2>
            <p className="text-sm opacity-90 mt-1">
                Hạn nộp: 15/04/2026 • 23:59
            </p>
        </div>
    );
};

const AssignmentInfo = () => {
    const clos = [
        { code: "CLO2", name: "Áp dụng thực hành" },
        { code: "CLO3", name: "Xây dựng hệ thống" },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
                Mô tả bài tập
            </h3>

            <p className="text-sm text-gray-700 leading-relaxed">
                Xây dựng REST API bằng Spring Boot bao gồm:
                <br />- CRUD User
                <br />- Authentication JWT
                <br />- Deploy Docker
            </p>

            {/* CLO */}
            <div className="mt-5">
                <p className="text-sm font-medium text-gray-800 mb-2">
                    Chuẩn đầu ra (CLO)
                </p>

                <div className="flex flex-wrap gap-2">
                    {clos.map((clo, index) => (
                        <span
                            key={index}
                            title={clo.name}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-200"
                        >
                            {clo.code}
                        </span>
                    ))}
                </div>
            </div>

            {/* Weight */}
            <div className="mt-4 flex items-center justify-between text-sm font-bold">
                <span className="text-gray-600">Trọng số</span>
                <span className="font-semibold text-emerald-600">20%</span>
            </div>
        </div>
    );
};
const SubmissionBox = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
                Nộp bài
            </h3>

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600">
                    Kéo & thả file hoặc
                </p>
                <button className="mt-2 text-emerald-600 font-medium hover:underline">
                    Chọn file
                </button>
            </div>

            {/* Link */}
            <div className="mt-4">
                <input
                    placeholder="Link GitHub / Google Drive..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Submit */}
            <div className="mt-4 flex justify-end">
                <button className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Nộp bài
                </button>
            </div>
        </div>
    );
};

const SubmittedBox = () => {
    return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <p className="text-green-700 font-medium">
                ✔ Bạn đã nộp bài
            </p>
            <p className="text-sm text-gray-600 mt-1">
                Thời gian: 14/04/2026 - 22:10
            </p>

            <div className="mt-3 text-sm text-emerald-600 hover:underline cursor-pointer">
                Xem bài đã nộp
            </div>
        </div>
    );
};

const GradeBox = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
                Kết quả
            </h3>

            <div className="flex justify-between items-center">
                <p className="text-gray-700">Điểm</p>
                <p className="text-xl font-bold text-emerald-600">8.5 / 10</p>
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-700 font-medium">
                    Nhận xét giảng viên
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    API hoạt động tốt, cần cải thiện phần bảo mật JWT.
                </p>
            </div>
        </div>
    );
};

const AssignmentDetail = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner />
                        <AssignmentInfo />
                        <SubmissionBox />
                        <SubmittedBox />
                        <GradeBox />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;