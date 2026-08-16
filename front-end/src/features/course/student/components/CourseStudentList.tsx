import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import type { Type } from "@/features/course/student/api/type.ts";
import { courseService } from "@/features/course/courseApi.ts";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Banner from "@/components/common/Banner";
import { getBannerColor } from "@/utils/colorUtils";

const StudentItem = ({ student }: { student: Type }) => {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-lg">
                    {student.fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-sm text-gray-500">{student.id}</p>
                </div>
            </div>

            <div className="text-sm text-gray-600 hidden sm:block">{student.email}</div>
        </div>
    );
};

const StudentList = () => {
    const [students, setStudents] = useState<Type[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const fetchStudents = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                // Gọi API backend
                const data = await courseService.getStudentsByOffering(id);
                setStudents(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sinh viên:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [id]);

    const filtered = students.filter((s) => {
        const keyword = search.trim().toLowerCase();

        return (
            String(s.fullName ?? "").toLowerCase().includes(keyword) ||
            String(s.id ?? "").toLowerCase().includes(keyword)
        );
    });
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc MSSV..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>

            <div>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-gray-500 font-medium">Đang tải danh sách...</div>
                    </div>
                ) : (
                    <>
                        {filtered.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filtered.map((student) => (
                                    <StudentItem key={student.id} student={student} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Không tìm thấy sinh viên nào.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const StudentContent = () => {
    const { id: offeringId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [course, setCourse] = useState<any>(null);

    const bannerColor = offeringId ? getBannerColor(offeringId) : "emerald";

    useEffect(() => {
        if (offeringId) {
            // Lấy thông tin khóa học thật để hiển thị lên Banner
            courseService.getCourseById(offeringId)
                .then((res) => setCourse(res))
                .catch((err) => console.error("Lỗi lấy thông tin khóa học:", err));
        }
    }, [offeringId]);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* HEADER */}
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

            {/* BODY - Cấu trúc layout 2 cột đồng bộ */}
            <div className="flex flex-1 flex-col lg:flex-row">

                {/* SIDEBAR */}
                <div className="w-full lg:w-72 shrink-0">
                    <Sidebar
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>

                {/* CONTENT */}
                <div className="flex-1 p-4 lg:p-8 w-full">
                    {/* Nới rộng khoảng trắng: max-w-3xl -> max-w-6xl */}
                    <div className="w-full max-w-6xl mx-auto">

                        {/* Nút quay lại */}
                        {/*<button*/}
                        {/*    onClick={() => navigate(`/course/${offeringId}`)}*/}
                        {/*    className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 mb-6 transition-colors font-medium w-fit"*/}
                        {/*>*/}
                        {/*    <ArrowLeft size={20} />*/}
                        {/*    <span>Quay lại bảng tin lớp học</span>*/}
                        {/*</button>*/}

                        <Banner
                            title={course?.course?.courseName || "Đang tải dữ liệu lớp học..."}
                            description={`Danh sách sinh viên ${course ? `- ${course.semester} (${course.year})` : ""}`}
                            color={bannerColor}
                        />

                        {/* Danh sách sinh viên */}
                        <StudentList />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentContent;