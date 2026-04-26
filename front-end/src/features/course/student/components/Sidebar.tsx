import React, { useState } from "react";
import {
    FileText,
    ClipboardList,
    Users,
    Bell,
    Users2,
    BarChart3,
    ChevronLeft,
    X, Plus
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ClassSidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const { id } = useParams();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { key: "posts", icon: FileText, label: "Bài đăng", path: "" },
        { key: "assignments", icon: ClipboardList, label: "Bài tập", path: "assignments" },
        { key: "obe", icon: BarChart3, label: "Tiến độ OBE", path: "obe" },
        { key: "groups", icon: Users2, label: "Nhóm của tôi", path: "groups" },
        { key: "students", icon: Users, label: "Sinh viên", path: "students" },
        { key: "notifications", icon: Bell, label: "Thông báo", path: "notifications" },
    ];

    return (
        <div
            className={`
            fixed lg:sticky lg:top-0 h-screen left-0 z-40 
            ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${isCollapsed ? "lg:w-20" : "w-[280px] lg:w-72"}
            bg-white border-r border-gray-200
            transition-all duration-300 ease-in-out
            flex flex-col shadow-2xl lg:shadow-none
        `}
        >
            {/* ... Phần code bên trong giữ nguyên ... */}

            {/* HEADER */}
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between h-16 lg:h-[73px]">
                <div className={`font-bold text-emerald-700 text-lg ${isCollapsed ? "hidden lg:hidden" : "block"}`}>
                    Lớp học
                </div>

                {/* Mobile Close */}
                <button
                    onClick={onClose}
                    className="p-2 lg:hidden hover:bg-gray-100 rounded-lg text-gray-500"
                >
                    <X size={20} />
                </button>

                {/* Collapse */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                    <ChevronLeft
                        size={20}
                        className={`${isCollapsed ? "rotate-180" : ""} transition-transform`}
                    />
                </button>
            </div>

            {/* MENU */}
            {/* MENU */}
            <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.key}
                            to={`/course/${id}/${item.path}`}
                            end={item.path === ""}

                            onClick={() => {

                                if (onClose) {
                                    onClose();
                                }
                            }}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                                }`
                            }
                        >
                            <Icon size={22} className="shrink-0" />

                            <span
                                className={`font-medium text-sm lg:text-base ${
                                    isCollapsed ? "lg:hidden" : "block"
                                } whitespace-nowrap`}
                            >
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default ClassSidebar;