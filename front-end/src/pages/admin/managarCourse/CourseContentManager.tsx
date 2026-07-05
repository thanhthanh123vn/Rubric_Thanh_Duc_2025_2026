import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Upload, FileText, Trash2, Loader2, ArrowLeft, BookOpen, Download, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { courseApi } from '@/services/axiosConfig.ts';
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";

export default function CourseContentManager() {
    const navigate = useNavigate(); // 2. Khởi tạo hook
    const [courses, setCourses] = useState<CourseOfferingResponse[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);

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

    // 3. Cập nhật hàm xử lý click
    const handleCourseClick = (course: CourseOfferingResponse) => {

        navigate(`/admin/assignments/list/${course.offeringId}/courseOffering-assignment`);
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">Chọn học phần quản lý bài tập</h2>
                {isLoadingCourses ? (
                    <Loader2 className="animate-spin mx-auto mt-10" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.course.courseId}
                                onClick={() => handleCourseClick(course)} // Khi click sẽ chuyển trang
                                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all shadow-sm flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <BookOpen />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{course.course.courseName}</p>
                                    <p className="text-sm text-slate-500">{course.course.courseCode}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}