import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  FileText,
  FolderKanban,
  ReceiptText,
  TimerReset,
  Users,
  Users2,
  X,
} from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SubItem = {
  key: string;
  label: string;
  path: string;
  search?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

type MenuItem = {
  key: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: SubItem[];
};

export default function ClassSidebar({ isOpen = false, onClose }: SidebarProps) {
  const { id } = useParams();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = useMemo(
      () => [
        { key: "posts", icon: FileText, label: "Bài đăng", path: "" },
        { key: "assignments", icon: ClipboardList, label: "Bài tập", path: "assignments" },
        { key: "document", icon: ReceiptText, label: "Tài liệu", path: "document" },
        {
          key: "evaluations",
          icon: CheckCircle2,
          label: "Đánh giá",
          path: "evaluations",
          children: [
            { key: "attendance", label: "Điểm danh", path: "evaluations", search: "?section=attendance", icon: TimerReset },
            { key: "assignment", label: "Bài tập", path: "evaluations", search: "?section=assignments", icon: ClipboardList },
            { key: "my-exams", label: "Bài Thi", path: "my-exams" , icon: ClipboardList },
            { key: "project", label: "Project", path: "evaluations", search: "?section=project", icon: FolderKanban },
          ],
        },
        { key: "obe", icon: BarChart3, label: "Tiến độ OBE", path: "obe" },
        { key: "groups", icon: Users2, label: "Nhóm của tôi", path: "groups" },
        { key: "students", icon: Users, label: "Sinh viên", path: "students" },
        { key: "notifications", icon: Bell, label: "Thông báo", path: "notifications" },
      ],
      [],
  );

  const isEvaluationRoute =
      location.pathname.endsWith(`/course/${id}/evaluations`) || location.pathname.includes("/evaluations");

  const closeSidebar = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
      <div
          className={`
        fixed left-0 z-40 h-screen flex-col border-r border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "w-[280px] lg:w-72"}
        lg:sticky lg:top-0
      `}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 p-4 lg:h-[73px] lg:p-6">
          <div className={`text-lg font-bold text-emerald-700 ${isCollapsed ? "hidden lg:hidden" : "block"}`}>
            Lớp học
          </div>

          <button
              onClick={closeSidebar}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>

          <button
              onClick={() => setIsCollapsed((current) => !current)}
              className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:block"
          >
            <ChevronLeft size={20} className={`${isCollapsed ? "rotate-180" : ""} transition-transform`} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3 lg:p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemUrl = `/course/${id}/${item.path}`;
            const showChildren = item.key === "evaluations" && item.children && !isCollapsed;

            return (
                <div key={item.key} className="space-y-1">
                  <NavLink
                      to={itemUrl}
                      end={item.path === ""}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                          `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all lg:px-4 lg:py-3 lg:text-base ${
                              isActive
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                          }`
                      }
                  >
                    <Icon size={20} className="shrink-0" />
                    <span className={`${isCollapsed ? "lg:hidden" : "block"} whitespace-nowrap font-medium`}>
                  {item.label}
                </span>
                    {showChildren ? (
                        <ChevronDown
                            size={16}
                            className={`ml-auto shrink-0 ${isEvaluationRoute ? "rotate-180" : ""}`}
                        />
                    ) : null}
                  </NavLink>

                  {showChildren && isEvaluationRoute ? (
                      <div className="space-y-1 pl-4">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childUrl = `/course/${id}/${child.path}${child.search || ""}`;
                          const childActive =
                              location.pathname.endsWith(`/course/${id}/${child.path}`) &&
                              location.search === (child.search || "");

                          return (
                              <NavLink
                                  key={child.key}
                                  to={childUrl}
                                  onClick={closeSidebar}
                                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                                      childActive
                                          ? "bg-emerald-50 font-medium text-emerald-700"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-emerald-700"
                                  }`}
                              >
                                {ChildIcon ? <ChildIcon size={16} className="shrink-0" /> : null}
                                <span>{child.label}</span>
                              </NavLink>
                          );
                        })}
                      </div>
                  ) : null}
                </div>
            );
          })}
        </nav>
      </div>
  );
}