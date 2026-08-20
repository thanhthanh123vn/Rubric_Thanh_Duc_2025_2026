import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notificationApi } from "@/features/notification/notificationApi";
import { connectWebSocket } from "@/notification/WebSocketNotication";
import { useAppSelector } from "@/hooks/useAppSelector";
import { toast } from "sonner"; // Thêm toast để thông báo khi xóa thành công

const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return "";
    const now = new Date();
    const past = new Date(timestamp);

    // Xử lý lỗi Invalid Date do format dữ liệu
    if (isNaN(past.getTime())) return "Gần đây";

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


            const data =  response;

            const mappedNotifs = data.map((n: any) => {
                const readStatus = n.read === true || n.is_read === 1 || n.is_read === true || n.isRead === true;

                // Parse createdAt, xử lý MongoDB "$date"
                let parsedCreatedAt = n.created_at || n.createdAt;
                if (parsedCreatedAt && typeof parsedCreatedAt === 'object' && parsedCreatedAt.$date) {
                    parsedCreatedAt = parsedCreatedAt.$date;
                }

                return {
                    id: n.id || n._id, // Support MongoDB _id
                    title: n.title,
                    content: n.content || n.message,
                    isRead: readStatus,
                    is_read: readStatus ? 1 : 0,
                    createdAt: parsedCreatedAt,
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
            console.error("Lỗi lấy thông báo:", error);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            const stompClient = connectWebSocket(user.userId, (newNotif: any) => {
                const readStatus = newNotif.read === true || newNotif.is_read === 1 || newNotif.is_read === true || newNotif.isRead === true;

                // Parse createdAt cho real-time
                let parsedCreatedAt = newNotif.created_at || newNotif.createdAt || new Date().toISOString();
                if (typeof parsedCreatedAt === 'object' && parsedCreatedAt.$date) {
                    parsedCreatedAt = parsedCreatedAt.$date;
                }

                const mappedRealtimeNotif = {
                    id: newNotif.id || newNotif._id,
                    title: newNotif.title,
                    content: newNotif.content || newNotif.message,
                    isRead: readStatus,
                    is_read: readStatus ? 1 : 0,
                    createdAt: parsedCreatedAt,
                    referenceUrl: newNotif.reference_url || newNotif.referenceUrl,
                    senderAvatar: newNotif.avatar_url || newNotif.senderAvatar,
                    senderName: newNotif.sender_id || newNotif.senderName
                };

                // FIX LỖI 2 THÔNG BÁO: Kiểm tra trùng id trước khi set
                setNotifications((prev) => {
                    const isExist = prev.some(n => n.id === mappedRealtimeNotif.id);
                    if (isExist) {
                        return prev;
                    }
                    return [mappedRealtimeNotif, ...prev];
                });
            });
            return () => {
                if (stompClient && stompClient.connected) {
                    stompClient.deactivate();
                }
            };
        }
    }, [user?.userId]);

    const unreadNotifications = notifications.filter(
        notification => notification.is_read === 0
    );

    const readNotifications = notifications.filter(
        notification => notification.is_read === 1
    );

    const unreadCount = unreadNotifications.length;

    const handleNotificationClick = async (n: any) => {
        if (n.is_read === 0 || !n.isRead) {
            try {
                await notificationApi.markAsRead(n.id);
                setNotifications(prev =>
                    prev.map(item =>
                        item.id === n.id
                            ? { ...item, isRead: true, is_read: 1 }
                            : item
                    )
                );
            } catch (error) {
                console.error("Lỗi cập nhật trạng thái đọc:", error);
                alert("Không thể đánh dấu đã đọc. Vui lòng kiểm tra kết nối mạng.");
                return;
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
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: 1 })));
        } catch (error) {
            console.error("Lỗi cập nhật tất cả trạng thái đọc:", error);
        }
    };

    // HÀM XỬ LÝ XÓA THÔNG BÁO
    const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation(); // Ngăn việc bấm xóa mà lại nhảy link chuyển trang
        try {
            await notificationApi.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success("Đã xóa thông báo");
        } catch (error) {
            console.error("Lỗi xóa thông báo:", error);
            toast.error("Không thể xóa thông báo lúc này");
        }
    };

    const renderNotificationItem = (n: any) => (
        <DropdownMenuItem
            key={n.id}
            className={`group flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-all duration-200 outline-none rounded-none border-b border-gray-50 last:border-0 
            ${n.is_read === 0
                ? "bg-[#ebf5ff] hover:bg-[#e1f0ff] focus:bg-[#e1f0ff]"
                : "bg-white hover:bg-gray-50 focus:bg-gray-50"
            }`}
            onClick={() => handleNotificationClick(n)}
        >
            <div className="relative shrink-0">
                <Avatar className={`h-12 w-12 sm:h-14 sm:w-14 border ${n.is_read === 0 ? "border-blue-200" : "border-gray-200"} transition-colors`}>
                    <AvatarImage src={n.senderAvatar || ""} alt="Avatar" className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                        {n.senderName ? n.senderName.charAt(0).toUpperCase() : "N"}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden pr-2">
                <span className={`text-[14px] sm:text-[15px] leading-tight mb-0.5 transition-colors ${n.is_read === 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                    {n.title || "Thông báo hệ thống"}
                </span>
                <p className={`text-[13px] sm:text-[14px] line-clamp-2 leading-snug ${n.is_read === 0 ? "text-gray-700" : "text-gray-500"}`}>
                    {n.content}
                </p>
                <span className={`text-[12px] font-medium mt-1.5 transition-colors ${n.is_read === 0 ? "text-blue-600" : "text-gray-400"}`}>
                    {formatTimeAgo(n.createdAt)}
                </span>
            </div>

            {/* Cột hiển thị chấm xanh (chưa đọc) HOẶC nút xóa (khi hover) */}
            <div className="shrink-0 w-6 flex flex-col items-center justify-center gap-2">
                {n.is_read === 0 && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm ring-4 ring-blue-100/50 group-hover:hidden" />
                )}
                <button
                    onClick={(e) => handleDeleteNotification(e, n.id)}
                    className={`p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all ${n.is_read === 0 ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`}
                    title="Xóa thông báo"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </DropdownMenuItem>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full hover:bg-gray-100 transition-colors">
                    <Bell className="h-6 w-6 text-gray-700" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] justify-center bg-red-500 text-white border-2 border-white shadow-sm transition-transform hover:scale-105"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[calc(100vw-32px)] sm:w-[400px] rounded-2xl shadow-xl border border-gray-100 p-0 overflow-hidden z-[100] bg-white"
                align="end"
                sideOffset={8}
                collisionPadding={16}
            >
                <DropdownMenuLabel className="font-bold flex justify-between items-center px-4 py-3.5 bg-white border-b border-gray-50">
                    <span className="text-lg sm:text-xl text-gray-900">Thông báo</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 h-8 font-medium transition-colors rounded-lg"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="w-4 h-4 sm:mr-1.5"/>
                            <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
                            <span className="sm:hidden">Đọc tất cả</span>
                        </Button>
                    )}
                </DropdownMenuLabel>

                <Tabs defaultValue="unread" className="w-full">
                    <div className="px-4 py-2 border-b border-gray-100 bg-white">
                        <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-50/80 p-1 rounded-xl">
                            <TabsTrigger
                                value="unread"
                                className="text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all font-medium"
                            >
                                Chưa đọc ({unreadNotifications.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="read"
                                className="text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all font-medium"
                            >
                                Đã đọc ({readNotifications.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="max-h-[50vh] sm:h-[380px] bg-white">
                        <TabsContent value="unread" className="m-0 border-0 outline-none">
                            {unreadNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 sm:h-full p-8 text-center text-sm text-gray-500">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-600">Không có thông báo mới nào</p>
                                </div>
                            ) : (
                                unreadNotifications.map(renderNotificationItem)
                            )}
                        </TabsContent>

                        <TabsContent value="read" className="m-0 border-0 outline-none">
                            {readNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 sm:h-full p-8 text-center text-sm text-gray-500">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                        <CheckCheck className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-600">Chưa có thông báo nào đã đọc</p>
                                </div>
                            ) : (
                                readNotifications.map(renderNotificationItem)
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <div className="bg-white p-2 border-t border-gray-50">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/notifications')}
                        className="w-full text-sm h-10 font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                        Xem tất cả thông báo
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}