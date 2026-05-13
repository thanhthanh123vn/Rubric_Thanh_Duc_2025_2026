import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // BỔ SUNG IMPORT NÀY
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationApi } from "@/features/notification/notificationApi";
import { connectWebSocket } from "@/notification/WebSocketNotication";
import { useAppSelector } from "@/hooks/useAppSelector";

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

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [user?.userId]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getNotifications();
            const sortedNotifs = response.data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sortedNotifs);
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            const stompClient = connectWebSocket(user.userId, (newNotif) => {
                setNotifications((prev) => [newNotif, ...prev]);
            });
            return () => {
                if (stompClient && stompClient.connected) {
                    stompClient.disconnect();
                }
            };
        }
    }, [user?.userId]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (n: any) => {
        if (!n.isRead) {
            try {
                await notificationApi.markAsRead(n.id);
                setNotifications(prev =>
                    prev.map(item => item.id === n.id ? { ...item, isRead: true } : item)
                );
            } catch (error) {
                console.error("Lỗi cập nhật trạng thái đọc:", error);
            }
        }

        if (n.referenceUrl) {
            navigate(n.referenceUrl);
        }
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.userId || unreadCount === 0) return;

        try {
            await notificationApi.markAllAsRead(user.userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Lỗi cập nhật tất cả trạng thái đọc:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full hover:bg-gray-100">
                    <Bell className="h-6 w-6 text-gray-700" />
                    {unreadCount > 0 && (
                        <Badge
                            // ĐÃ SỬA: Ép màu nền đỏ, chữ trắng, thêm viền trắng mỏng để nổi bật
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] justify-center bg-red-500 text-white border-2 border-white hover:bg-red-600 shadow-sm"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent

                className="w-[calc(100vw-32px)] sm:w-[400px] rounded-xl shadow-lg border-gray-100 p-0 overflow-hidden z-50"
                align="end"
                sideOffset={8}

                collisionPadding={16}
            >
                <DropdownMenuLabel className="font-bold flex justify-between items-center px-4 py-3 bg-white">
                    <span className="text-lg sm:text-xl">Thông báo</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 h-8"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="w-4 h-4 sm:mr-1"/>
                            <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
                            <span className="sm:hidden">Đọc tất cả</span>
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                <ScrollArea className="max-h-[60vh] sm:h-[420px] bg-white">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 sm:h-full p-8 text-center text-sm text-gray-500">
                            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mb-3" />
                            Bạn không có thông báo nào mới
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-colors focus:bg-gray-100 rounded-none border-b border-gray-50 last:border-0 
                                ${!n.isRead ? "bg-[#ebf5ff] hover:bg-[#e1f0ff]" : "bg-white hover:bg-gray-50"}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                {/* 1. Phần Avatar */}
                                <div className="relative shrink-0">
                                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-gray-200">
                                        <AvatarImage src={n.senderAvatar || ""} alt="Avatar" className="object-cover" />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                                            {n.senderName ? n.senderName.charAt(0).toUpperCase() : "N"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* 2. Phần Nội dung */}
                                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                                    <span className="text-[14px] sm:text-[15px] font-semibold text-gray-900 leading-tight mb-0.5">
                                        {n.title || "Thông báo hệ thống"}
                                    </span>
                                    <p className="text-[13px] sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
                                        {n.content || n.message}
                                    </p>
                                    <span className={`text-[12px] font-medium mt-1 ${!n.isRead ? "text-blue-600" : "text-gray-400"}`}>
                                        {formatTimeAgo(n.createdAt)}
                                    </span>
                                </div>

                                {/* 3. Dấu chấm xanh */}
                                <div className="shrink-0 ml-1 w-3 flex justify-center items-center">
                                    {!n.isRead && <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm" />}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>

                <DropdownMenuSeparator className="m-0" />
                <div className="bg-white p-2">
                    <Button variant="ghost" className="w-full text-sm h-10 sm:h-9 font-semibold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg">
                        Xem tất cả
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
