import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, FileCheck2, TrendingUp,
    Activity, Clock, ChevronRight, Award, AlertCircle
} from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Link } from 'react-router-dom';


const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, bgClass }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${bgClass} text-white shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
        </div>
    </div>
);

export default function DeanDashboard() {

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const deanName = user?.fullName || "Trưởng Khoa";


    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);


    const recentActivities = [
        { id: 1, type: 'rubric', message: 'Bộ môn Hệ Thống Thông Tin trình duyệt 5 Rubric mới.', time: '2 giờ trước', isUrgent: true },
        { id: 2, type: 'course', message: 'Bộ môn KHMT hoàn tất phân công giảng dạy Học kỳ 1.', time: 'Hôm qua', isUrgent: false },
        { id: 3, type: 'report', message: 'Báo cáo đánh giá chất lượng học phần môn CSDL đã sẵn sàng.', time: 'Hôm qua', isUrgent: false },
        { id: 4, type: 'rubric', message: 'Bộ môn CNPM cập nhật lại ma trận chuẩn đầu ra.', time: '3 ngày trước', isUrgent: false },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Lời chào & Tóm tắt chung */}
            <div className="bg-indigo-700 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-indigo-200/50">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 text-indigo-600 opacity-50">
                    <Award className="w-64 h-64" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Xin chào, {deanName}! 👋</h2>
                    <p className="text-indigo-100 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                        Chào mừng bạn đến với hệ thống quản lý chuẩn đầu ra và chất lượng giảng dạy.
                        Học kỳ hiện tại đang diễn ra đúng tiến độ, có <strong className="text-white">5 Rubric</strong> đang chờ bạn phê duyệt.
                    </p>
                    <div className="flex gap-3">
                        <Link to="/dean/rubrics">
                            <button className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
                                Duyệt Rubric ngay
                            </button>
                        </Link>
                        <Link to="/dean/reports">
                            <button className="bg-indigo-600 border border-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-500 transition-colors">
                                Xem báo cáo Khoa
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Khung Thống kê Nhanh (Quick Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Tổng số Giảng viên"
                    value="128"
                    icon={Users}
                    trend="+4 mới" trendUp={true}
                    bgClass="bg-blue-500"
                />
                <StatCard
                    title="Học phần đang mở"
                    value="86"
                    icon={BookOpen}
                    trend="Học kỳ 1" trendUp={true}
                    bgClass="bg-emerald-500"
                />
                <StatCard
                    title="Rubric chờ duyệt"
                    value="5"
                    icon={FileCheck2}
                    trend="Cần xử lý" trendUp={false}
                    bgClass="bg-amber-500"
                />
                <StatCard
                    title="Tỷ lệ đạt chuẩn OBE"
                    value="92%"
                    icon={TrendingUp}
                    trend="+2.5%" trendUp={true}
                    bgClass="bg-indigo-500"
                />
            </div>

            {/* Phần Biểu đồ và Hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột trái: Tiến độ các Bộ môn (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Tiến độ thiết lập Rubric</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Tỷ lệ hoàn thiện theo từng Bộ môn</p>
                        </div>
                        <button className="text-indigo-600 text-sm font-medium hover:underline">Xem chi tiết</button>
                    </div>

                    <div className="space-y-6 mt-4">
                        {/* Mock Progress Bars */}
                        {[
                            { name: 'Hệ Thống Thông Tin', percent: 100, color: 'bg-emerald-500' },
                            { name: 'Công Nghệ Phần Mềm', percent: 85, color: 'bg-indigo-500' },
                            { name: 'Khoa Học Máy Tính', percent: 60, color: 'bg-amber-500' },
                            { name: 'An Toàn Thông Tin', percent: 40, color: 'bg-rose-500' },
                        ].map((dept, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-slate-700">{dept.name}</span>
                                    <span className="text-slate-500">{dept.percent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className={`${dept.color} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${dept.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột phải: Hoạt động gần đây (1/3 width) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-800">Hoạt động cấp Khoa</h3>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="relative pl-4 border-l-2 border-slate-100 pb-2">
                                <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${activity.isUrgent ? 'bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]' : 'bg-slate-300'}`}></div>
                                <p className={`text-sm ${activity.isUrgent ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                    {activity.message}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[11px] font-medium">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-2xl flex justify-center items-center gap-1 transition-colors">
                        Xem tất cả hoạt động <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}