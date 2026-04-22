import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ListTodo
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {courseService} from '@/features/course/courseApi';

const colorClasses = [
  'bg-blue-100 text-blue-600',
  'bg-cyan-100 text-cyan-600',
  'bg-emerald-100 text-emerald-600',
  'bg-indigo-100 text-indigo-600',
  'bg-purple-100 text-purple-600'
];

const Sidebar = ({ isOpen, onClose }: any) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(true);

  // State lưu dữ liệu khóa học
  const [courses, setCourses] = useState<any[]>([]);

  const menuItems = [
    { key: "dashboard", icon: LayoutGrid, label: 'Bảng điều khiển', path: "/dashboard" },
    { key: "calendar", icon: Calendar, label: 'Lịch học', path: "/calendar" },
    { key: "courses", icon: GraduationCap, label: 'Đã đăng ký', path: "#" },
    { key: "rubrics", icon: FileText, label: 'Thư viện Rubric', path: "/rubrics" },
    { key: "obe", icon: BarChart3, label: 'Báo cáo OBE', path: "/obe-reports" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const responseData = await courseService.getDashboardCourses();

        // Map dữ liệu theo đúng cấu trúc trả về của bạn,
        // đồng thời gán vào các biến name/subtitle để UI render khớp với code cũ
        const formattedCourses = responseData.map((course: any, index: number) => {
          const courseTitle = `${course.courseName} - ${course.courseCode}`;

          return {
            id: course.offeringId,
            type: 'course',
            initial: courseTitle.charAt(0).toUpperCase(), // Lấy chữ cái đầu của tên môn
            name: courseTitle, // Hiển thị tên môn chính
            subtitle: `${course.semester} - ${course.academicYear}`, // Hiển thị thời gian bên dưới
            color: colorClasses[index % colorClasses.length],
            // Giữ lại các trường này nếu bạn cần dùng ở chỗ khác
            lecturerName: course.lecturerName,
            obeProgress: Math.floor(Math.random() * 40) + 60,
          };
        });

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Lỗi khi fetch danh sách khóa học:", error);
      }
    };

    fetchCourses();
  }, []);

  // Nối item "Việc cần làm" lên đầu danh sách API trả về
  const enrolledCourses = [
    { id: 'todo', type: 'link', icon: ListTodo, name: 'Việc cần làm' },
    ...courses
  ];

  return (
      <aside className={`border-r border-gray-200/60 flex flex-col transition-all duration-300 ease-in-out z-40
      bg-white/70 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 
      sticky top-0 h-screen
      ${isOpen ? 'fixed inset-y-0 left-0 w-72 shadow-2xl' : 'hidden lg:flex'}
      ${isCollapsed ? 'lg:w-20' : 'lg:w-80'}
    `}>
        <div className="h-[73px] lg:h-16 flex items-center justify-between px-6 border-b border-gray-200/50 shrink-0">
          {!isCollapsed &&
              <span className="text-emerald-700 font-extrabold text-xl tracking-tight drop-shadow-sm">NLU RUBRIC</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:block p-1.5 hover:bg-white/80 rounded-lg text-gray-500 shadow-sm border border-transparent hover:border-gray-200 transition-all">
            {isCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            if (item.key === 'courses') {
              return (
                  <div key={item.key} className="flex flex-col">
                    <button
                        onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        className={`
                    flex items-center justify-between px-4 py-3 transition-all cursor-pointer group w-full
                    ${isCoursesOpen && !isCollapsed
                            ? 'border-[1.5px] border-slate-700 rounded-full text-slate-800 shadow-sm bg-white'
                            : 'rounded-xl text-gray-600 hover:bg-white/60 hover:text-emerald-600 hover:shadow-sm'}
                    ${isCollapsed ? 'justify-center !border-none !rounded-xl !p-3' : ''}
                  `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={22} className={`shrink-0 ${isCoursesOpen && !isCollapsed ? 'text-slate-800' : 'group-hover:text-emerald-600'}`}/>
                        {!isCollapsed && <span className={`text-sm tracking-wide ${isCoursesOpen ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                          <div className="text-gray-600">
                            {isCoursesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                      )}
                    </button>

                    {/* Submenu: Danh sách khóa học đổ ra từ State */}
                    {isCoursesOpen && !isCollapsed && (
                        <div className="flex flex-col mt-2 space-y-0.5">
                          {enrolledCourses.map((course) => (
                              <NavLink
                                  key={course.id}
                                  to={`/course/${course.id}`}
                                  className={({isActive}) => `
                          flex items-center gap-4 px-4 py-2.5 rounded-r-full rounded-l-md hover:bg-gray-100/80 transition-colors mr-2
                          ${isActive ? 'bg-emerald-50' : ''}
                        `}
                              >
                                {course.type === 'link' ? (
                                    <div className="w-8 flex items-center justify-center shrink-0">
                                      {/* Ép kiểu an toàn cho Icon component */}
                                      {course.icon && React.createElement(course.icon as any, { size: 20, className: "text-gray-600" })}
                                    </div>
                                ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${course.color}`}>
                                      {course.initial}
                                    </div>
                                )}
                                <div className="flex flex-col overflow-hidden text-left">
                                  <span className="text-[13.5px] font-medium text-gray-800 truncate leading-snug" title={course.name}>{course.name}</span>
                                  {course.subtitle && <span className="text-[12px] text-gray-500 truncate" title={course.subtitle}>{course.subtitle}</span>}
                                </div>
                              </NavLink>
                          ))}
                        </div>
                    )}
                  </div>
              );
            }

            return (
                <NavLink
                    key={item.key}
                    to={item.path}
                    className={({isActive}) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group overflow-hidden
                ${isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                        : 'text-gray-600 hover:bg-white/60 hover:text-emerald-600 hover:shadow-sm'}
                ${isCollapsed ? 'justify-center !px-3' : ''}
              `}
                >
                  {({isActive}) => (
                      <>
                        {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-md"></div>
                        )}
                        <item.icon size={22} className={`shrink-0 ${isActive ? 'text-emerald-600' : ''}`}/>
                        {!isCollapsed && <span className="text-sm font-medium tracking-wide">{item.label}</span>}

                        {isCollapsed && (
                            <div className="absolute left-16 bg-gray-800/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                              {item.label}
                            </div>
                        )}
                      </>
                  )}
                </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50 shrink-0">
          <NavLink to="/settings" className={({isActive}) => `
          flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative overflow-hidden
          ${isActive ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm' : 'text-gray-600 hover:bg-white/60 hover:shadow-sm'}
          ${isCollapsed ? 'justify-center' : ''}
        `}>
            {({isActive}) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-md"></div>}
                  <Settings size={22} className={isActive ? 'text-emerald-600' : ''}/>
                  {!isCollapsed && <span className="text-sm font-medium tracking-wide">Cài đặt</span>}
                </>
            )}
          </NavLink>
        </div>
      </aside>
  );
};

export default Sidebar;