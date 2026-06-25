import React, { useEffect, useState } from 'react';
import { Upload, FileText, Trash2, Loader2, ArrowLeft, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { courseApi } from '@/services/axiosConfig.ts';
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import type {CourseOfferingResponse} from "@/pages/admin/api/type.ts";

interface Course {
    id: string;
    courseName: string;
    courseCode: string;
}

interface SyllabusFile {
    id: string;
    fileName: string;
    fileUrl: string;
}

export default function SyllabusManager() {
    const [courses, setCourses] = useState<CourseOfferingResponse[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseOfferingResponse | null>(null);
    const [files, setFiles] = useState<SyllabusFile[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // 1. Tải danh sách các học phần
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

    // 2. Tải danh sách tài liệu khi chọn học phần
    const fetchSyllabus = async (courseId: string) => {
        setIsLoadingFiles(true);
        try {
            const res = await courseApi.get(`/syllabus/${courseId}`);
            setFiles(res.data);
        } catch (error) {
            console.error("Lỗi tải syllabus:", error);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const handleCourseClick = (course: CourseOfferingResponse) => {
        setSelectedCourse(course);
        fetchSyllabus(course.course.courseId);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedCourse || !event.target.files?.[0]) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', event.target.files[0]);

        try {
            await courseApi.post(`/syllabus/${selectedCourse.course.courseId}`, formData);
            alert("Upload thành công!");
            fetchSyllabus(selectedCourse.course.courseId);
        } catch (error) {
            alert("Upload thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm("Xóa tài liệu này?")) return;
        try {
            await courseApi.delete(`/syllabus/${fileId}`);
            fetchSyllabus(selectedCourse!.course.courseId);
        } catch (error) {
            alert("Xóa thất bại!");
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            {!selectedCourse ? (
                /* GIAO DIỆN DANH SÁCH HỌC PHẦN */
                <div className="max-w-4xl mx-auto space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800">Chọn học phần quản lý tài liệu</h2>
                    {isLoadingCourses ? <Loader2 className="animate-spin mx-auto mt-10" /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <div key={course.course.courseId} onClick={() => handleCourseClick(course)}
                                     className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen /></div>
                                    <div>
                                        <p className="font-bold text-slate-800">{course.course.courseName}</p>
                                        <p className="text-sm text-slate-500">{course.course.courseCode}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* GIAO DIỆN QUẢN LÝ SYLLABUS CỦA HỌC PHẦN */
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <Button variant="ghost" className="mb-4 -ml-2" onClick={() => setSelectedCourse(null)}>
                        <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại danh sách
                    </Button>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">Tài liệu: {selectedCourse.course.courseName}</h2>
                    <p className="text-sm text-slate-500 mb-6">{selectedCourse.course.courseCode}</p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 mb-6">
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:text-blue-600">
                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="w-8 h-8 text-slate-400" />}
                            <span className="text-sm font-medium">Click để chọn file Syllabus</span>
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                        </label>
                    </div>

                    <div className="space-y-2">
                        {isLoadingFiles ? <p>Đang tải tài liệu...</p> : files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium">{file.fileName}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)} className="text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}