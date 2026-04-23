import React, { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import StatCards from '../components/home/StatCards';
import CourseCard from "../components/home/CourseCard";

import { courseService } from '../features/course/courseApi';
import { useAppSelector } from '../hooks/useAppSelector';
import { toast } from 'sonner';

const colorClasses = [
  "from-emerald-500 to-teal-400",
  "from-blue-500 to-cyan-400",
  "from-purple-600 to-pink-500",
  "from-amber-500 to-orange-400",
  "from-indigo-500 to-violet-400"
];

interface DashboardCourse {
  id: string;
  courseTitle: string;
  lecturerName: string;
  obeProgress: number;
  semester: string;
  colorClass: string;
}

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user:reduxUser } = useAppSelector((state) => state.auth);

  let user = reduxUser;
  if (!user) {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      user = JSON.parse(localUser);
    }
  }
  const studentId  = user?.studentId || user?.userId;

  useEffect(() => {
    const fetchDashboardCourses = async () => {
      if (!studentId) return;

      try {
        setIsLoading(true);
        const responseData = await courseService.getDashboardCourses();

        const formattedCourses = responseData.map((course: any, index: number) => ({
          id: course.offeringId,
          courseTitle: `${course.courseName} - ${course.courseCode}`,
          lecturerName: course.lecturerName,
          obeProgress: Math.floor(Math.random() * 40) + 60,
          semester: `${course.semester} - ${course.academicYear}`,
          colorClass: colorClasses[index % colorClasses.length]
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Lỗi khi tải lớp học:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardCourses();
  }, [studentId, refreshKey]);

  return (
      // Cập nhật màu nền nhẹ nhàng bg-gray-50/30 giống CalendarPage
      <div className="flex h-screen bg-gray-50/30 overflow-hidden relative font-sans w-full">
        {isMobileMenuOpen && (
            <div
                className="fixed inset-0 z-[60] bg-black/50 lg:hidden transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          <Header
              onMenuClick={() => setIsMobileMenuOpen(true)}
              onEnrollSuccess={() => setRefreshKey(prev => prev + 1)}
          />

          {/* Main Area: Căn lề p-3 md:p-5 chuẩn Mobile First */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5 scroll-smooth">

            {/* TIÊU ĐỀ: Đồng bộ chữ in hoa, Emerald-800, viền dưới giống hệt Lịch Học */}
            <div className="border-b-2 border-emerald-700 pb-2 mb-4 md:mb-5 flex flex-col justify-end">
              <h1 className="text-lg md:text-xl font-bold text-emerald-800 uppercase tracking-tight">
                Bảng điều khiển
              </h1>
              <p className="text-xs md:text-sm font-medium text-emerald-700/70 mt-0.5">
                Quản lý các khóa học và tiến trình OBE của bạn
              </p>
            </div>

            {/* Khu vực thống kê */}
            <div className="mb-5 md:mb-6">
              <StatCards />
            </div>

            {/* Grid hiển thị khóa học */}
            <div className="w-full mb-2">
              <h2 className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-tight mb-3">
                Lớp học của tôi
              </h2>

              {isLoading ? (
                  <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm w-full">
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Đang tải lớp học...</p>
                  </div>
              ) : courses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 w-full">
                    <p className="text-sm font-medium text-gray-500">Bạn chưa đăng ký lớp học nào.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 pb-8">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            courseTitle={course.courseTitle}
                            lecturerName={course.lecturerName}
                            obeProgress={course.obeProgress}
                            semester={course.semester}
                            colorClass={course.colorClass}
                        />
                    ))}
                  </div>
              )}
            </div>



          </main>
        </div>
      </div>
  );
};

export default Dashboard;