import React from 'react';
import {
    Users,
    BookOpen,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- MOCK DATA ---
const STATS = [
    { title: 'Tổng người dùng', value: '1,248', increase: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Khóa học đang mở', value: '42', increase: '+3 mới', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Rubric đã tạo', value: '156', increase: '+18%', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Tỷ lệ hoàn thành', value: '89%', increase: '+2.4%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
];

const RECENT_ACTIVITIES = [
    { id: 1, action: 'Giảng viên Trần B đã tạo Rubric mới cho môn Lập trình Web.', time: '10 phút trước', type: 'create' },
    { id: 2, action: 'Sinh viên Nguyễn Văn A đã nộp bài tập.', time: '1 giờ trước', type: 'submit' },
    { id: 3, action: 'Hệ thống tự động sao lưu dữ liệu thành công.', time: '3 giờ trước', type: 'system' },
    { id: 4, action: 'Thêm 50 sinh viên mới vào khóa học Cơ sở dữ liệu.', time: 'Hôm qua', type: 'user' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-6 md:pb-0">


            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
                <p className="text-sm text-slate-500 mt-1">Chào mừng trở lại! Dưới đây là tình hình hoạt động hôm nay.</p>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {STATS.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                {stat.increase}
              </span>
                            <span className="text-slate-400 ml-2">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Tình trạng phân bổ khóa học</h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                            Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Công nghệ phần mềm</span>
                                <span className="font-bold text-slate-800">450 SV</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Hệ thống thông tin</span>
                                <span className="font-bold text-slate-800">320 SV</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Khoa học dữ liệu</span>
                                <span className="font-bold text-slate-800">180 SV</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Mạng máy tính</span>
                                <span className="font-bold text-slate-800">210 SV</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: HOẠT ĐỘNG GẦN ĐÂY --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 md:p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Hoạt động gần đây</h3>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {RECENT_ACTIVITIES.map((activity) => (
                            <div key={activity.id} className="relative flex items-start gap-4">
                                {/* Icon Timeline */}
                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-100 shadow-sm shrink-0">
                                    {activity.type === 'create' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                    {activity.type === 'submit' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                    {activity.type === 'system' && <AlertCircle className="w-3.5 h-3.5 text-orange-500" />}
                                    {activity.type === 'user' && <Users className="w-3.5 h-3.5 text-purple-500" />}
                                </div>

                                {/* Nội dung */}
                                <div className="flex-1 min-w-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-sm text-slate-700 leading-snug">
                                        {activity.action}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400 font-medium">
                                        <Clock className="w-3 h-3" /> {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link to="/admin" className="block w-full text-center mt-6 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                        Xem toàn bộ nhật ký
                    </Link>
                </div>

            </div>
        </div>
    );
}