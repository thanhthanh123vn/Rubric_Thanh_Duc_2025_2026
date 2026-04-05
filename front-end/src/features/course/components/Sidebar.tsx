import React from "react";
import {
    FileText,
    ClipboardList,
    Users,
    Bell,
    Users2
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

const ClassSidebar = () => {
    const { id } = useParams(); // lấy id từ URL

    const menuItems = [
        {
            key: "posts",
            icon: FileText,
            label: "Bài đăng",
            path: "",
        },
        {
            key: "assignments",
            icon: ClipboardList,
            label: "Bài tập",
            path: "assignments",
        },
        {
            key: "students",
            icon: Users,
            label: "Sinh viên",
            path: "students",
        },
        {
            key: "notifications",
            icon: Bell,
            label: "Thông báo",
            path: "notifications",
        },
        {
            key: "groups",
            icon: Users2,
            label: "Quản lý nhóm",
            path: "groups",
        },
    ];

    return (
        <div className="w-[240px] bg-white border-r border-gray-200 rounded-2xl p-3 shadow-sm">
            <div className="text-gray-500 text-sm font-semibold px-3 py-2">
                Lớp học
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.key}
                            to={`/course/${id}/${item.path}`}
                            end={item.path === ""} // để active đúng cho posts
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span className="text-sm font-medium">
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