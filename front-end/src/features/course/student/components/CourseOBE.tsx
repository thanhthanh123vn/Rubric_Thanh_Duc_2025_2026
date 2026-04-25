import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "@/features/course/courseApi";
import { useParams } from "react-router-dom";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
                TMDT Ca 2 thứ 3 phòng RD306
            </h2>
            <p className="text-sm opacity-90 mt-1">
                Tiến độ OBE của bạn
            </p>
        </div>
    );
};

// ================= OVERALL =================
const OverallProgress = ({ value }) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-700 font-medium">Tiến độ tổng</p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div
                    className="bg-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                ></div>
            </div>

            <p className="text-right text-sm mt-1 text-gray-600">
                {value}%
            </p>
        </div>
    );
};

// ================= CLO ITEM =================
const CLOItem = ({ clo }) => {
    const progress = clo.progressPercent || 0;

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
                <p className="font-semibold text-gray-900">
                    {clo.cloCode}
                </p>
                <span className="text-sm font-medium text-gray-600">
                    {getStatus()}
                </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
                {clo.cloDescription}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                    className={`${getColor()} h-2 rounded-full`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <p className="text-right text-sm mt-1 text-gray-600">
                {progress}%
            </p>
        </div>
    );
};

// ================= CLO LIST =================
const CLOList = ({ clos }) => {
    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
                Chi tiết chuẩn đầu ra (CLO)
            </h3>

            {clos.map((clo) => (
                <CLOItem key={clo.cloId} clo={clo} />
            ))}
        </div>
    );
};

// ================= SUGGESTION =================
const SuggestionBox = ({ clos }) => {
    const weakClos = clos.filter((c) => c.progressPercent < 50);

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-2xl">
            <p className="font-semibold text-yellow-700">
                Gợi ý cải thiện
            </p>

            {weakClos.length === 0 ? (
                <p className="text-sm mt-2 text-gray-700">
                    Bạn đang làm tốt tất cả CLO 👍
                </p>
            ) : (
                <ul className="text-sm mt-2 list-disc ml-5 text-gray-700">
                    {weakClos.map((c) => (
                        <li key={c.cloId}>
                            {c.cloCode} chưa đạt → nên luyện thêm
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ================= MAIN =================
const CourseOBE = () => {
    const { id: offeringId } = useParams();

    const [clos, setClos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await courseService.getOBEProgressByStudent(offeringId);
                console.log(res)
                setClos(res);
            } catch (err) {
                console.error("OBE error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (offeringId) fetchData();
    }, [offeringId]);

    // tổng progress
    const overallProgress =
        clos.length > 0
            ? Math.round(
                clos.reduce((sum, c) => sum + c.progressPercent, 0) /
                clos.length
            )
            : 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner />

                        {loading ? (
                            <p>Loading OBE...</p>
                        ) : (
                            <>
                                <OverallProgress value={overallProgress} />

                                <CLOList clos={clos} />

                                <SuggestionBox clos={clos} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseOBE;