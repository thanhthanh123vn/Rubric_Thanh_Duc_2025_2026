import React, { useState, useEffect } from 'react';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import StatCards from '../components/home/StatCards';
import CourseCard from "../components/home/CourseCard";


import { couserService } from '../features/course/courseApi';
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
  const studentId  = user?.studentId || user?.userId || user?.id;
  useEffect(() => {

    const fetchDashboardCourses = async () => {
      // console.log("USER:", user);
      // console.log("studentId:", studentId);
      if (!studentId) return;

      try {
        setIsLoading(true);

        const responseData = await couserService.getDashboardCourses(studentId);
        console.log(responseData);


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
  }, [studentId,refreshKey]);

  return (
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {isMobileMenuOpen && (
            <div
                className="fixed inset-0 z-40 lg:hidden  transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
        />


        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          <Header
              onMenuClick={() => setIsMobileMenuOpen(true)}
              onEnrollSuccess={() => setRefreshKey(prev => prev + 1)}
          />

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Bảng điều khiển</h1>
              <p className="text-sm lg:text-base text-gray-600">Quản lý các khóa học và rubric của bạn</p>
            </div>

            <div className="mb-8 lg:mb-12">
              <StatCards />
            </div>

            {/* Grid hiển thị khóa học */}
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-gray-500">Đang tải lớp học...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">Bạn chưa đăng ký lớp học nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-10">
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
          </main>
        </div>
      </div>
  );
};

export default Dashboard;