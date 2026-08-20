import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, BookOpen, Search } from 'lucide-react';
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";

export default function CourseContentManager() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<CourseOfferingResponse[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);


    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoadingCourses(true);
            try {
                const data = await courseOfferingService.getOfferings();
                setCourses(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách học phần:", error);
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const handleCourseClick = (course: CourseOfferingResponse) => {
        navigate(`/admin/assignments/list/${course.offeringId}/courseOffering-assignment`);
    };

    // Logic lọc khóa học dựa trên searchTerm
    const filteredCourses = courses.filter((course) => {
        const searchLower = searchTerm.toLowerCase();

        const nameMatch = course?.course?.courseName?.toLowerCase().includes(searchLower) || false;
        const codeMatch = course?.course?.courseCode?.toLowerCase().includes(searchLower) || false;

        return nameMatch || codeMatch;
    });

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Thanh tìm kiếm */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-5">Chọn học phần quản lý bài tập</h2>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã hoặc tên học phần..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Danh sách học phần */}
                {isLoadingCourses ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                        <p className="text-slate-500 font-medium">Đang tải danh sách học phần...</p>
                    </div>
                ) : (
                    <>
                        {filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.offeringId}
                                        onClick={() => handleCourseClick(course)}
                                        className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all shadow-sm flex items-center gap-4 group"
                                    >
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 truncate" title={course?.course?.courseName}>
                                                {course?.course?.courseName}
                                            </p>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                                                Mã HP: <span className="text-slate-700">{course?.course?.courseCode}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-lg font-medium text-slate-700">Không tìm thấy học phần nào</p>
                                <p className="text-sm text-slate-500 mt-1">Vui lòng thử lại với từ khóa khác.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}