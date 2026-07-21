import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminDashboardService, type DashboardOverviewResponse } from "@/api/adminApi.ts";

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardOverviewResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Gọi API thực tế
                const data = await adminDashboardService.getOverview();
                setDashboardData(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hiển thị loading trong lúc đợi API
    if (isLoading || !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <span className="text-slate-500 font-medium">Đang tải dữ liệu tổng quan...</span>
            </div>
        );
    }

    // Cấu hình UI cho 4 thẻ thống kê
    const STATS_CONFIG = [
        { title: 'Tổng người dùng', data: dashboardData.stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Khóa học đang mở', data: dashboardData.stats.activeCourses, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Rubric đã tạo', data: dashboardData.stats.totalRubrics, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Tỷ lệ hoàn thành', data: dashboardData.stats.completionRate, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-6 md:pb-0">
            {/* Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
                <p className="text-sm text-slate-500 mt-1">Chào mừng trở lại! Dưới đây là tình hình hoạt động hôm nay.</p>
            </div>

            {/* --- THỐNG KÊ TỔNG QUAN --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STATS_CONFIG.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stat.data.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                                {stat.data.increase}
                            </span>
                            <span className="text-slate-400 ml-2">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- CỘT TRÁI: PHÂN BỔ KHÓA HỌC --- */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Tình trạng phân bổ khóa học</h3>
                        <Link to="/admin/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                            Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {dashboardData.allocations.map((alloc) => (
                            <div key={alloc.id}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-slate-700">{alloc.name}</span>
                                    <span className="font-bold text-slate-800">{alloc.studentCount} SV</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    {/* Sử dụng template literal để gán width % và className màu sắc */}
                                    <div
                                        className={`${alloc.colorClass} h-full rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${alloc.percentage > 100 ? 100 : alloc.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- CỘT PHẢI: HOẠT ĐỘNG GẦN ĐÂY --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Hoạt động gần đây</h3>

                    <div className="space-y-6 relative flex-1 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {dashboardData.recentActivities.map((activity) => (
                            <div key={activity.id} className="relative flex items-start gap-4">
                                {/* Icon Timeline */}
                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-100 shadow-sm shrink-0">
                                    {activity.type === 'create' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                    {activity.type === 'submit' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                    {activity.type === 'system' && <AlertCircle className="w-3.5 h-3.5 text-orange-500" />}
                                    {activity.type === 'user' && <Users className="w-3.5 h-3.5 text-purple-500" />}
                                </div>

                                {/* Nội dung */}
                                <div className="flex-1 min-w-0 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-sm text-slate-700 leading-snug font-medium">
                                        {activity.action}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
                                        <Clock className="w-3.5 h-3.5" /> {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link to="/admin/logs" className="block w-full text-center mt-6 pt-4 border-t border-slate-100 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        Xem toàn bộ nhật ký
                    </Link>
                </div>
            </div>
        </div>
    );
}