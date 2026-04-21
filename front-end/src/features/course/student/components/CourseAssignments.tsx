import React, { useEffect } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import AssignmentCard from "./AssignmentCard";

import { useDispatch, useSelector } from "react-redux";
import { fetchAssessments } from "@/features/course/student/assignmentSlice.ts";
import { useParams } from "react-router-dom";
import type {AppDispatch, RootState} from "@/app/store.ts";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
                TMDT Ca 2 thứ 3 phòng RD306
            </h2>
            <p className="text-sm opacity-90 mt-1">
                Danh sách bài tập
            </p>
        </div>
    );
};

const CourseAssignments = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { id: offeringId } = useParams();

    const { data, loading } = useSelector(
        (state: RootState) => state.assessment
    );
    useEffect(() => {
        if (offeringId) {
            dispatch(fetchAssessments(offeringId));
        }
    }, [offeringId]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner />

                        {loading && (
                            <p className="text-center text-gray-500">
                                Đang tải...
                            </p>
                        )}

                        {!loading && data.length === 0 && (
                            <p className="text-center text-gray-500">
                                Không có bài tập
                            </p>
                        )}

                        {data.map((item) => (
                            <AssignmentCard
                                key={item.assessmentId}
                                id={item.assessmentId}
                                title={item.assessmentName}
                                dueDate={new Date(item.endTime).toLocaleString()}
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
    );
};

export default CourseAssignments;