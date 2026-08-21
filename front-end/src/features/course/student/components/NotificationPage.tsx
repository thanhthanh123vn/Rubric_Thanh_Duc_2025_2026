import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notificationApi } from "@/features/notification/notificationApi";
import { connectWebSocket } from "@/notification/WebSocketNotication";
import { useAppSelector } from "@/hooks/useAppSelector";
import Header from "@/components/home/Header";
import Sidebar from "@/features/course/student/components/Sidebar.tsx";
import {toast} from "sonner";


const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return "";
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;

    return past.toLocaleDateString("vi-VN");
};

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) user = JSON.parse(localUser);
    }

    // 1. Lấy dữ liệu thông báo lần đầu
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await notificationApi.getNotifications();
                const mappedNotifs = response.map((n: any) => {

                    const readStatus = n.read === true || n.is_read === 1 || n.is_read === true || n.isRead === true;
                    return {
                        id: n.id,
                        title: n.title,
                        content: n.content || n.message,
                        isRead: readStatus,
                        is_read: readStatus ? 1 : 0,
                        createdAt: n.created_at || n.createdAt,
                        referenceUrl: n.reference_url || n.referenceUrl,
                        senderAvatar: n.avatar_url || n.senderAvatar,
                        senderName: n.sender_id || n.senderName
                    };
                });

                const sortedNotifs = mappedNotifs.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setNotifications(sortedNotifs);
            } catch (error) {
                console.error("Lỗi tải trang thông báo:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.userId) {
            fetchNotifications();
        }
    }, [user?.userId]);

    // 2. Kết nối WebSocket để nhận realtime
    useEffect(() => {
        if (!user?.userId) return;

        const stompClient = connectWebSocket(user.userId, (newNotif: any) => {
            // SỬA LỖI TẠI ĐÂY: Thêm newNotif.read === true
            const readStatus = newNotif.read === true || newNotif.is_read === 1 || newNotif.is_read === true || newNotif.isRead === true;
            const mappedRealtimeNotif = {
                id: newNotif.id,
                title: newNotif.title,
                content: newNotif.content || newNotif.message,
                isRead: readStatus,
                is_read: readStatus ? 1 : 0,
                createdAt: newNotif.created_at || newNotif.createdAt || new Date().toISOString(),
                referenceUrl: newNotif.reference_url || newNotif.referenceUrl,
                senderAvatar: newNotif.avatar_url || newNotif.senderAvatar,
                senderName: newNotif.sender_id || newNotif.senderName
            };
            setNotifications((prev) => [mappedRealtimeNotif, ...prev]);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, [user?.userId]);

    // 3. Xử lý logic click/xóa
    const handleNotificationClick = async (n: any) => {
        if (n.is_read === 0 || !n.isRead) {
            try {
                await notificationApi.markAsRead(n.id);
                setNotifications(prev =>
                    prev.map(item => item.id === n.id ? { ...item, isRead: true, is_read: 1 } : item)
                );
            } catch (error) {
                console.error("Lỗi cập nhật trạng thái:", error);
            }
        }
        if (n.referenceUrl) navigate(n.referenceUrl);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: 1 })));
        } catch (error) {
            console.error("Lỗi cập nhật tất cả trạng thái:", error);
        }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await notificationApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Đã xóa thông báo");
        } catch (error) {
            console.error("Lỗi khi xóa thông báo:", error);
            toast.error("Không thể xóa thông báo lúc này");
        }
    };

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header cố định phía trên */}
            <Header />

            {/* Bố cục chuẩn gồm Sidebar và Main Content */}
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-4 pb-20 lg:p-6">
                    <div className="mx-auto max-w-4xl space-y-6">

                        {/* Tiêu đề & Nút đánh dấu tất cả đã đọc */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Bell className="h-6 w-6 text-emerald-600" />
                                    Thông báo của bạn
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Bạn có <span className="font-semibold text-emerald-600">{unreadCount}</span> thông báo chưa đọc
                                </p>
                            </div>

                            {unreadCount > 0 && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl"
                                >
                                    <CheckCheck className="w-4 h-4 mr-2" />
                                    Đánh dấu tất cả đã đọc
                                </Button>
                            )}
                        </div>

                        {/* Danh sách thông báo */}
                        <div className="bg-white rounded-[28px] shadow-sm border border-slate-200 overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p>Đang tải thông báo...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <Bell className="w-16 h-16 text-gray-200 mb-4" />
                                    <p className="text-lg font-medium">Bạn chưa có thông báo nào</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`group flex items-start gap-4 p-5 cursor-pointer transition-all hover:bg-slate-50 
                                                ${n.is_read === 0 ? "bg-emerald-50/40" : "bg-white"}`}
                                        >
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-slate-200 shadow-sm">
                                                    <AvatarImage src={n.senderAvatar || ""} alt="Avatar" className="object-cover" />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg">
                                                        {n.senderName ? n.senderName.charAt(0).toUpperCase() : "N"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {n.is_read === 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border-2 border-white"></span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nội dung */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className={`text-base mb-1 ${n.is_read === 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                                        {n.title || "Thông báo hệ thống"}
                                                    </h3>
                                                    <span className="shrink-0 text-xs text-gray-400 font-medium whitespace-nowrap pt-1">
                                                        {formatTimeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${n.is_read === 0 ? "text-gray-700" : "text-gray-500"}`}>
                                                    {n.content}
                                                </p>
                                            </div>

                                            {/* Nút thao tác (Hover) */}
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {n.referenceUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-full"
                                                        title="Mở liên kết"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => handleDeleteNotification(e, n.id)}
                                                    className="h-8 w-8 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-full"
                                                    title="Xóa thông báo"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
