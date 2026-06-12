import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, ClipboardCheck, Layers,
    Activity, Clock, ChevronRight, GraduationCap, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Link } from 'react-router-dom';
import {Button} from "@/components/ui/button.tsx";


const StatCard = ({ title, value, icon: Icon, trend, trendUp, bgClass }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${bgClass} text-white shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
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

export default function DepartmentDashboard() {
    // Lấy thông tin user (Trưởng bộ môn)
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const hodName = user?.fullName || "Trưởng Bộ môn";
    const userDept = user?.department || "Hệ Thống Thông Tin";

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập delay gọi API lấy thống kê bộ môn
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Dữ liệu mẫu cho Hoạt động gần đây của Bộ môn
    const recentActivities = [
        { id: 1, message: 'Giảng viên Trần Lê Như Quỳnh vừa nộp Rubric Đồ án.', time: '1 giờ trước', isUrgent: true },
        { id: 2, message: 'Đã hoàn tất phân công 10/12 lớp học phần HK1.', time: 'Hôm qua', isUrgent: false },
        { id: 3, message: 'Cập nhật đề cương môn Cấu trúc dữ liệu.', time: '2 ngày trước', isUrgent: false },
        { id: 4, message: 'Giảng viên Phan Văn Đức mở đánh giá Giữa kỳ.', time: '3 ngày trước', isUrgent: false },
    ];

    // Dữ liệu mẫu cho Công việc cần xử lý
    const pendingTasks = [
        { id: 'T1', title: 'Duyệt Rubric môn Phát triển Web', type: 'RUBRIC', author: 'Lê Thị Cẩm Tú', status: 'PENDING' },
        { id: 'T2', title: 'Phân công GV lớp IT202_01', type: 'ASSIGNMENT', author: 'Hệ thống', status: 'URGENT' },
        { id: 'T3', title: 'Duyệt Rubric Đồ án Cơ sở', type: 'RUBRIC', author: 'Trần Lê Như Quỳnh', status: 'PENDING' },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Lời chào & Tóm tắt chung */}
            <div className="bg-teal-700 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-teal-200/50">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 text-teal-600 opacity-40">
                    <GraduationCap className="w-56 h-56" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/50 border border-teal-600 rounded-full text-xs font-semibold mb-4">
                        <Layers className="w-3.5 h-3.5" />
                        Bộ môn: {userDept}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Xin chào, {hodName}! 👋</h2>
                    <p className="text-teal-100 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                        Tổng quan tình hình hoạt động của bộ môn. Hiện tại có <strong className="text-white">2 Rubric</strong> và <strong className="text-white">2 Lớp học phần</strong> đang chờ bạn xử lý.
                    </p>
                    <div className="flex gap-3">
                        <Link to="/department/rubrics">
                            <button className="bg-white text-teal-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-50 transition-colors">
                                Duyệt Rubric
                            </button>
                        </Link>
                        <Link to="/department/offerings">
                            <button className="bg-teal-600 border border-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-500 transition-colors">
                                Phân công giảng dạy
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Khung Thống kê Nhanh (Quick Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Giảng viên trực thuộc"
                    value="24"
                    icon={Users}
                    trend="Đủ nhân sự" trendUp={true}
                    bgClass="bg-blue-500"
                />
                <StatCard
                    title="Lớp học phần (HK này)"
                    value="42"
                    icon={BookOpen}
                    trend="+5 so với HK trước" trendUp={true}
                    bgClass="bg-teal-500"
                />
                <StatCard
                    title="Rubric chờ duyệt"
                    value="2"
                    icon={ClipboardCheck}
                    trend="Cần xử lý" trendUp={false}
                    bgClass="bg-amber-500"
                />
                <StatCard
                    title="Lớp chưa phân công"
                    value="2"
                    icon={AlertCircle}
                    trend="Gấp" trendUp={false}
                    bgClass="bg-rose-500"
                />
            </div>

            {/* Phần Công việc và Hoạt động */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột trái: Công việc cần xử lý (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Công việc cần xử lý</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Danh sách các tác vụ đang chờ hành động từ bạn</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {pendingTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${task.type === 'RUBRIC' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {task.type === 'RUBRIC' ? <ClipboardCheck className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{task.title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {task.type === 'RUBRIC' ? 'Người nộp: ' : 'Trạng thái: '}
                                            <span className="font-medium text-slate-700">{task.author}</span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Link to={task.type === 'RUBRIC' ? "/department/rubrics" : "/department/offerings"}>
                                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-medium text-teal-700 border-teal-200 hover:bg-teal-50">
                                            Xử lý ngay
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {pendingTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                                <p>Tuyệt vời! Không có công việc nào đang tồn đọng.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột phải: Hoạt động bộ môn (1/3 width) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-800">Hoạt động bộ môn</h3>
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