import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationApi } from "@/features/notification/notificationApi.ts";
import { connectWebSocket } from "@/notification/WebSocketNotication";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const { user } = useSelector((state: any) => state.auth);

    useEffect(() => {
        if (user?.userId) {
            fetchNotifications();
        }
    }, [user?.userId]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getNotifications(user.userId);
            setNotifications(response.data);
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
                if (stompClient) stompClient.disconnect();
            };
        }
    }, [user?.id]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái đọc:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="font-bold flex justify-between items-center">
                    Thông báo
                    {unreadCount > 0 && <span className="text-[10px] font-normal text-muted-foreground">Chưa đọc ({unreadCount})</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Bạn không có thông báo nào
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex flex-col items-start p-4 focus:bg-accent cursor-pointer border-b last:border-0 ${!n.isRead ? "bg-blue-50/30" : ""}`}
                                onClick={() => handleMarkAsRead(n.id)}
                            >
                                <div className="flex justify-between w-full gap-2">
                  <span className={`text-sm font-semibold leading-none ${!n.isRead ? "text-blue-600" : ""}`}>
                    {n.title || "Thông báo hệ thống"}
                  </span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()} {/* format lại thời gian[cite: 1] */}
                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {n.content || n.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <Button variant="ghost" className="w-full text-xs h-9 font-medium text-primary">
                    Xem tất cả
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}