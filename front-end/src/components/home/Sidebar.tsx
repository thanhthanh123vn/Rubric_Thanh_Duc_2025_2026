import React, { useState } from 'react';
import { ChevronLeft, LayoutGrid, Calendar, BookOpen, FileText, BarChart3, Settings, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

// Thêm 'key' và 'path' tương ứng cho từng menu
  const menuItems = [
    {
      key: "dashboard",
      icon: LayoutGrid,
      label: 'Bảng điều khiển',
      path: "/dashboard"
    },
    {
      key: "calendar",
      icon: Calendar,
      label: 'Lịch',
      path: "/calendar"
    },
    {
      key: "courses",
      icon: BookOpen,
      label: 'Các khóa học',
      path: "/courses"
    },
    {
      key: "rubrics",
      icon: FileText,
      label: 'Thư viện Rubric',
      path: "/rubrics"
    },
    {
      key: "obe",
      icon: BarChart3,
      label: 'Báo cáo OBE',
      path: "/obe-reports"
    },
    {
      key: "settings",
      icon: Settings,
      label: 'Cài đặt',
      path: "/settings"
    },
  ];

  return (
      <div
          className={` z-10 
        fixed lg:static inset-y-0 left-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'w-[280px] lg:w-72'}
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
      `}
      >
        {/* Header Sidebar */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between h-16 lg:h-[73px]">
          <div className={`font-bold text-emerald-700 text-lg ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>
            NLU Rubric
          </div>

          {/* Nút đóng (Dấu X) chỉ hiện trên Mobile */}
          <button
              onClick={onClose}
              className="p-2 lg:hidden hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Nút thu gọn Sidebar chỉ hiện trên Desktop */}
          <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ChevronLeft size={20} className={`${isCollapsed ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
                <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all ${
                            isActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'
                        }`
                    }
                >
                  <Icon size={22} className="shrink-0" />
                  <span className={`font-medium text-sm lg:text-base ${isCollapsed ? 'lg:hidden' : 'block'} whitespace-nowrap`}>
                    {item.label}
                  </span>
                </NavLink>
            );
          })}
        </nav>
      </div>
  );
};

export default Sidebar;