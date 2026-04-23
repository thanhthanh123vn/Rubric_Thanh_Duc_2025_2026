import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, Settings, LogOut, ChevronRight,
    GraduationCap, UserCheck, ShieldCheck, Key, List, FileText,
    Calendar, ClipboardList, CheckCircle, TableProperties, Settings2,
    BarChartBig, Table, Building2, Building, Network, Bell, PieChart, Shield, Library
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from '../../components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';

// --- ĐỊNH NGHĨA CẤU TRÚC MENU THEO NHÓM ---
const menuGroups = [
    {
        label: 'Chính',
        items: [
            { title: 'Tổng quan', url: '/admin', icon: LayoutDashboard },
            { title: 'Thông báo', url: '/admin/announcements', icon: Bell },
        ]
    },
    {
        label: 'Đào tạo & Nhân sự',
        items: [
            {
                title: 'Người dùng',
                url: '/admin/users',
                icon: Users,
                subItems: [
                    { title: 'Sinh viên', url: '/admin/users/list-students', icon: GraduationCap },
                    { title: 'Giảng viên', url: '/admin/users/list-lecturers', icon: UserCheck },
                    { title: 'Admin', url: '/admin/users/list-admins', icon: ShieldCheck },
                    { title: 'Phân quyền', url: '/admin/users/list-users', icon: Key }
                ]
            },
            {
                title: 'Khoa / Bộ môn',
                url: '/admin/departments',
                icon: Building2,
                subItems: [
                    { title: 'Danh sách Khoa', url: '/admin/departments/list', icon: Building },
                    { title: 'Bộ môn', url: '/admin/departments/subjects', icon: Network }
                ]
            },
            {
                title: 'Khóa học',
                url: '/admin/courses',
                icon: BookOpen,
                subItems: [
                    { title: 'Danh sách khóa học', url: '/admin/courses/list', icon: List },
                    { title: 'Quản lý Syllabus', url: '/admin/courses/syllabus', icon: FileText }
                ]
            },
            {
                title: 'Lớp học',
                url: '/admin/classes',
                icon: Library,
                subItems: [
                    { title: 'Danh sách Lớp', url: '/admin/classes/list', icon: List },
                    { title: 'Thời khóa biểu', url: '/admin/classes/schedule', icon: Calendar }
                ]
            }
        ]
    },
    {
        label: 'Kiểm tra & Đánh giá',
        items: [
            {
                title: 'Bài tập',
                url: '/admin/assignments',
                icon: ClipboardList,
                subItems: [
                    { title: 'Danh sách bài tập', url: '/admin/assignments/list', icon: List },
                    { title: 'Chấm điểm', url: '/admin/assignments/grading', icon: CheckCircle }
                ]
            },
            {
                title: 'Quản lý Rubric',
                url: '/admin/rubrics',
                icon: TableProperties,
                subItems: [
                    { title: 'Danh sách Rubric', url: '/admin/rubrics/list', icon: List },
                    { title: 'Tiêu chí & Mức điểm', url: '/admin/rubrics/criteria', icon: Settings2 }
                ]
            },
            {
                title: 'Điểm & Đánh giá',
                url: '/admin/grades',
                icon: BarChartBig,
                subItems: [
                    { title: 'Bảng điểm', url: '/admin/grades/board', icon: Table },
                    { title: 'Chấm điểm theo Rubric', url: '/admin/grades/rubric-grading', icon: CheckCircle }
                ]
            }
        ]
    },
    {
        label: 'Hệ thống',
        items: [
            { title: 'Báo cáo & Thống kê', url: '/admin/reports', icon: PieChart },
            { title: 'Cài đặt hệ thống', url: '/admin/settings', icon: Settings },
            { title: 'Bảo mật & Logs', url: '/admin/security', icon: Shield },
        ]
    }
];

export const AdminSidebar: React.FC = () => {
    const location = useLocation();

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-200/60 shadow-sm bg-white hidden md:flex">
            {/* Header Sidebar */}
            <SidebarHeader className="bg-white border-b border-slate-200/60 h-16 flex items-center justify-center px-4 z-50">
                <Link to="/admin" className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                        R
                    </div>
                    <span className="font-bold text-lg text-slate-800 truncate group-data-[collapsible=icon]:hidden tracking-tight">
                        Rubric Admin
                    </span>
                </Link>
            </SidebarHeader>

            {/* Menu chính */}
            <SidebarContent className="bg-white pt-4 pb-10">
                {menuGroups.map((group, groupIndex) => (
                    <SidebarGroup key={groupIndex} className="mb-2">
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 px-4">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1.5">
                                {group.items.map((item) => {
                                    // Xác định xem mục hiện tại có đang được active (chọn) không
                                    const isActive = item.url === '/admin'
                                        ? location.pathname === '/admin' || location.pathname === '/admin/'
                                        : location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);

                                    // 1. NẾU CÓ MENU CON (SUB-ITEMS)
                                    if (item.subItems) {
                                        return (
                                            <Collapsible
                                                key={item.title}
                                                asChild
                                                defaultOpen={isActive}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            className={`h-11 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                                        >
                                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                                            <span>{item.title}</span>
                                                            <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.subItems.map((subItem) => {
                                                                const isSubActive = location.pathname === subItem.url;
                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.title}>
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            className={`rounded-lg transition-colors ${isSubActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                                                                        >
                                                                            <Link to={subItem.url} className="flex items-center gap-2">
                                                                                <subItem.icon className={`w-4 h-4 ${isSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                                                                <span>{subItem.title}</span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                );
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    }

                                    // 2. NẾU LÀ MENU BÌNH THƯỜNG (KHÔNG CÓ MENU CON)
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                className={`h-11 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                <Link to={item.url}>
                                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Đăng xuất */}
            <SidebarFooter className="border-t border-slate-200/60 p-4 bg-slate-50/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-11 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors" tooltip="Đăng xuất">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};