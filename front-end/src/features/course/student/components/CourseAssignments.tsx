import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import AssignmentCard from "./AssignmentCard";

import { useDispatch, useSelector } from "react-redux";
import { fetchAssessments } from "@/features/course/student/assignmentSlice.ts";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "@/app/store.ts";
import { courseService } from "../../courseApi.ts";
import { ArrowLeft } from "lucide-react";
import Banner from "@/components/common/Banner";
import { getBannerColor } from "@/utils/colorUtils";

const CourseAssignments = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { id: offeringId } = useParams();
    const navigate = useNavigate();

    // Thêm state để quản lý tên khóa học và menu mobile
    const [course, setCourse] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const bannerColor = offeringId ? getBannerColor(offeringId) : "emerald";
    const { data, loading } = useSelector(
        (state: RootState) => state.assessment
    );

    useEffect(() => {
        if (offeringId) {
            // Lấy danh sách bài tập
            dispatch(fetchAssessments(offeringId));


            courseService.getCourseById(offeringId)
                .then((res) => setCourse(res))
                .catch((err) => console.error("Lỗi lấy thông tin khóa học:", err));
        }
    }, [offeringId, dispatch]);

    return (


                <div className="bg-gray-50 min-h-screen flex flex-col">
                    <Header onMenuClick={() => setIsMobileMenuOpen(true)}/>

                    {/* Layout chia cột giống hệt ClassroomContent */}
                    <div className="flex flex-1 flex-col lg:flex-row">
                        {/* Sidebar */}
                        <div className="w-full lg:w-72 shrink-0">
                            <Sidebar
                                isOpen={isMobileMenuOpen}
                                onClose={() => setIsMobileMenuOpen(false)}
                            />
                        </div>

                        {/* Nội dung chính */}
                        <div className="flex-1 p-4 lg:p-8 w-full">
                            {/* Đổi từ max-w-3xl thành max-w-6xl để trải rộng màn hình */}
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
                                    description={`Giảng viên: ${course?.lecturers?.map((l: any) => l.lecturerName).join(", ") || ""} - Mã lớp: ${offeringId}`}
                                    color={bannerColor}
                                />

                                {loading && (
                                    <div className="flex justify-center my-8">
                                        <div
                                            className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {!loading && data.length === 0 && (
                                    <p className="text-center text-gray-500 my-8">
                                        Tuyệt vời, hiện không có bài tập nào!
                                    </p>
                                )}

                                {/* Thêm space-y-4 để tạo khoảng cách đều đặn giữa các thẻ bài tập */}
                                <div className="space-y-4">
                                    {data.map((item) => (
                                        <AssignmentCard
                                            key={item.assessmentId}
                                            id={item.assessmentId}
                                            title={item.assessmentName}
                                            dueDate={new Date(item.endTime).toLocaleString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric"
                                            })}
                                            clos={item.cloCode}
                                            status={
                                                item.calculatedScore
                                                    ? "Đã chấm"
                                                    : item.submissionId
                                                        ? "Đã nộp"
                                                        : "Chưa nộp"
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
                };

                export default CourseAssignments;