import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "@/features/course/courseApi";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Banner from "@/components/common/Banner";
import { getBannerColor } from "@/utils/colorUtils";


const OverallProgress = ({ value }: { value: number }) => {
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

//  CLO ITEM
const CLOItem = ({ clo }: { clo: any }) => {
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

//  CLO LIST
const CLOList = ({ clos }: { clos: any[] }) => {
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

// SUGGESTION
const SuggestionBox = ({ clos }: { clos: any[] }) => {
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

//  MAIN
const CourseOBE = () => {
    const { id: offeringId } = useParams();
    const navigate = useNavigate();

    const [clos, setClos] = useState<any[]>([]);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const bannerColor = offeringId ? getBannerColor(offeringId) : "emerald";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Lấy thông tin OBE và thông tin khóa học cùng lúc
                const [obeRes, courseRes] = await Promise.all([
                    courseService.getOBEProgressByStudent(offeringId),
                    courseService.getCourseById(offeringId)
                ]);

                setClos(obeRes);
                setCourse(courseRes);
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
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

            <div className="flex flex-1 flex-col lg:flex-row">

                <div className="w-full lg:w-72 shrink-0">
                    <Sidebar
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>

                <div className="flex-1 p-4 lg:p-8 w-full">
                    {/* Bỏ max-w-3xl, sử dụng max-w-6xl để trải đều màn hình */}
                    <div className="w-full max-w-6xl mx-auto">

                        {/*/!* Nút quay lại *!/*/}
                        {/*<button*/}
                        {/*    onClick={() => navigate(`/course/${offeringId}`)}*/}
                        {/*    className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 mb-6 transition-colors font-medium w-fit"*/}
                        {/*>*/}
                        {/*    <ArrowLeft size={20} />*/}
                        {/*    <span>Quay lại bảng tin lớp học</span>*/}
                        {/*</button>*/}

                        <Banner
                            title={course?.course?.courseName || "Đang tải dữ liệu lớp học..."}
                            description={`Tiến độ OBE của bạn ${course ? `- ${course.semester} (${course.year})` : ""}`}
                            color={bannerColor}
                        />

                        {loading ? (
                            <div className="flex justify-center my-8">
                                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
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