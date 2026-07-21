import React, { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle2,
    Trash2,
    Mail,
    MailOpen,
    AlertCircle,
    Info,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {notificationApi} from "@/api/notificationApi.ts";

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'info' | 'warning' | 'success';
}

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');


    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {

                // const data = await notificationApi.getNotifications();


                const mockData: Notification[] = [
                    {
                        id: '1',
                        title: 'Hệ thống bảo trì',
                        message: 'Hệ thống sẽ bảo trì vào lúc 00:00 ngày mai. Vui lòng lưu lại công việc.',
                        time: '10 phút trước',
                        isRead: false,
                        type: 'warning'
                    },
                    {
                        id: '2',
                        title: 'Có sinh viên nộp bài trễ',
                        message: 'Sinh viên Nguyễn Văn A (22130260) vừa nộp bài tập "Báo cáo tiến độ" trễ 2 ngày.',
                        time: '1 giờ trước',
                        isRead: false,
                        type: 'info'
                    },
                    {
                        id: '3',
                        title: 'Tạo Rubric thành công',
                        message: 'Giảng viên Trần B đã tạo thành công bộ Rubric cho môn Lập trình Web.',
                        time: 'Hôm qua',
                        isRead: true,
                        type: 'success'
                    }
                ];

                setTimeout(() => {
                    setNotifications(mockData);
                    setIsLoading(false);
                }, 600);
            } catch (error) {
                toast.error('Lỗi khi tải thông báo');
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // --- CÁC HÀM XỬ LÝ ---
    const handleMarkAsRead = (id: string) => {
        // TODO: Gọi API cập nhật trạng thái đã đọc
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
        );
    };

    const handleMarkAllAsRead = () => {
        // TODO: Gọi API đánh dấu tất cả đã đọc
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        toast.success('Đã đánh dấu đọc tất cả');
    };

    const handleDelete = (id: string) => {
        // TODO: Gọi API xóa thông báo
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        toast.success('Đã xóa thông báo');
    };

    // --- LỌC DỮ LIỆU ---
    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Thông báo hệ thống</h2>
                            <p className="text-sm text-slate-500">Bạn có <span className="font-bold text-blue-600">{unreadCount}</span> thông báo chưa đọc</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || isLoading}
                        className="bg-white"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-slate-500" />
                        Đánh dấu đọc tất cả
                    </Button>
                </div>

                {/* Tabs Lọc */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${filter === 'unread' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Chưa đọc
                        {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {unreadCount}
              </span>
                        )}
                    </button>
                </div>

                {/* Danh sách thông báo */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-500">Đang tải thông báo...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Không có thông báo nào</h3>
                        <p className="text-slate-500 mt-1">Bạn đã xem hết tất cả thông báo hiện tại.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 md:p-5 flex gap-4 transition-colors hover:bg-slate-50 group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    {/* Icon loại thông báo */}
                                    <div className="shrink-0 mt-1">
                                        {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                                        {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                        {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                    </div>

                                    {/* Nội dung */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm md:text-base font-semibold truncate ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                                        </div>
                                        <p className={`text-sm mt-1 line-clamp-2 ${!notif.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                                            {notif.message}
                                        </p>
                                    </div>

                                    {/* Hành động (Hiện khi hover) */}
                                    <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Đánh dấu đã đọc"
                                                onClick={() => handleMarkAsRead(notif.id)}
                                            >
                                                <MailOpen className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Xóa thông báo"
                                            className="hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(notif.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}