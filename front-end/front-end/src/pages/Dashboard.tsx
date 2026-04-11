import React, {useState} from 'react';
import Sidebar from '../components/home/Sidebar';
import Header from '../components/home/Header';
import StatCards from '../components/home/StatCards';

import CourseCard from "../components/home/CourseCard";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const courses = [
    {
      id: 1,
      courseTitle: 'Khai thác dữ liệu - HK2 - 2026',
      lecturerName: 'TS. Nguyễn Thị Phương Trâm',
      obeProgress: 70,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-emerald-500 to-teal-400"
    },
    {
      id: 2,
      courseTitle: 'Lập trình Python nâng cao',
      lecturerName: 'Tiến sĩ Trần Văn A',
      obeProgress: 85,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-blue-500 to-cyan-400"

    },
    {
      id: 3,
      courseTitle: 'Cơ sở dữ liệu phân tán',
      lecturerName: 'PGS.TS. Lê Văn B',
      obeProgress: 60,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-purple-600 to-pink-500"

    },
    {
      id: 4,
      courseTitle: 'Hệ thống thông tin doanh nghiệp',
      lecturerName: 'ThS. Phạm Thị C',
      obeProgress: 75,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-emerald-500 to-teal-400"
    },
    {
      id: 5,
      courseTitle: 'Mạng máy tính và Internet',
      lecturerName: 'TS. Bùi Văn D',
      obeProgress: 80,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-blue-500 to-cyan-400"
    },
    {
      id: 6,
      courseTitle: 'Bảo mật thông tin',
      lecturerName: 'PGS.TS. Hoàng Thị E',
      obeProgress: 65,
      semester: 'Học kỳ II - 2025/2026',
      colorClass:"from-purple-600 to-pink-500"
    },
  ];
  return (
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {isMobileMenuOpen && (
            <div
                //bg-black/50
                className="fixed inset-0 z-40 lg:hidden transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header truyền hàm mở menu */}
          <Header onMenuClick={() => setIsMobileMenuOpen(true)}/>



          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Bảng điều khiển</h1>
              <p className="text-sm lg:text-base text-gray-600">Quản lý các khóa học và rubric của bạn</p>
            </div>

            <div className="mb-8 lg:mb-12">
              <StatCards />
            </div>

            {/* Grid 1 cột trên mobile, 2 trên tablet, 3 trên desktop rộng */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-10">
              {courses.map((course) => (
                  <CourseCard
                      id={course.id}
                      courseTitle={course.courseTitle}
                      lecturerName={course.lecturerName}
                      obeProgress={course.obeProgress}
                      semester={course.semester}
                      colorClass={course.colorClass}
                  />
              ))}
            </div>
          </main>
        </div>
      </div>
  );
};
export default Dashboard;
