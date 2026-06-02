import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi } from "@/api/questionApi.ts";
import { toast } from "sonner";
import courseService from '../admin/api/courseService';

const colorClasses = [
    "from-emerald-500 to-teal-400",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-fuchsia-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
];

export default function CourseList() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCoursesAndCounts = async () => {
            try {
                setIsLoading(true);

                const data = await courseService.getTeacherCourses();
                const fetchedCourses = data || [];

                if (fetchedCourses.length === 0) {
                    setCourses([]);
                    return;
                }

                const offeringIds = fetchedCourses.map((c: any) => c.offeringId);

                const countResponse = await questionApi.countQuestion(offeringIds);

                const countsMap = countResponse || {};

                const finalCourses = fetchedCourses.map((course: any, index: number) => ({
                    ...course,
                    colorClass: colorClasses[index % colorClasses.length],
                    questionCount: countsMap[course.offeringId] || 0
                }));

                setCourses(finalCourses);

            } catch (error) {
                console.error("Lỗi khi tải danh sách lớp:", error);
                toast.error("Không thể tải danh sách môn học.");
            } finally {
                setIsLoading(false);
            }
        };

        loadCoursesAndCounts();
    }, []);

    const handleCourseClick = (offeringId: string) => {
        navigate(`/teacher/course/${offeringId}/questions`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách khóa học...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 sm:mb-10 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Ngân hàng câu hỏi
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Quản lý và duyệt danh sách câu hỏi cho các học phần của bạn
                    </p>
                </div>

                {/* Content Section */}
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 py-16 px-4 text-center shadow-sm">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có khóa học nào</h3>
                        <p className="text-gray-500 text-sm max-w-sm">Hiện tại bạn chưa được phân công hoặc chưa có học phần nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {courses.map((course) => (
                            <div
                                key={course.offeringId}
                                onClick={() => handleCourseClick(course.offeringId)}
                                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden"
                            >
                                {/* Thanh viền màu sắc phía trên cùng của thẻ */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${course.colorClass}`}></div>

                                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                    {/* Icon & Badge */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${course.colorClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {course.questionCount} câu hỏi
                                        </div>
                                    </div>

                                    {/* Course Info */}
                                    <div className="flex-grow mb-4">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                            {course.courseName || course.title}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600">
                                                Mã: {course.offeringId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                                            Quản lý chi tiết
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-blue-600 transition-all duration-300">
                                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}