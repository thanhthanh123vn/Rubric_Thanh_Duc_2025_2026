import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Users, BookOpen, FileText, Settings, LogOut, LayoutDashboard, ChevronRight, GraduationCap, UserCheck
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


const adminMenuItems = [
    { title: 'Tổng quan', url: '/admin', icon: LayoutDashboard },
    {
        title: 'Người dùng',
        url: '/admin/users',
        icon: Users,
        subItems: [
            { title: 'User', url: '/admin/users/list-users', icon: Users },
            { title: 'Sinh viên', url: '/admin/users/list-students', icon: GraduationCap },
            { title: 'Giảng viên', url: '/admin/users/lecturers', icon: UserCheck }
        ]
    },

    { title: 'Khóa học', url: '/admin/courses', icon: BookOpen },
    { title: 'Rubrics', url: '/admin/rubrics', icon: FileText },
    { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
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
            <SidebarContent className="bg-white pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                        Hệ thống
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {adminMenuItems.map((item) => {
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
                                                                        {/* Đã thêm class flex và render icon ở đây */}
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