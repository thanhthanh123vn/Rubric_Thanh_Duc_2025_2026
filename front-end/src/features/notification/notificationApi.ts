import {notificationServiceApi} from "@/services/axiosConfig";

export type NotificationItem = {
    id: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    referenceUrl?: string | null;
    courseId?: string | null;
    notificationType?: string | null;
    senderId?: string | null;
    senderName?: string | null;
    senderAvatar?: string | null;
};

export const notificationApi = {

    getNotifications: async () => {
        const response = await notificationServiceApi.get<NotificationItem[]>(`/getNotification/me`);
        return response.data;
    },


    markAsRead: (notificationId: string) => {
        return notificationServiceApi.put(`/${notificationId}/read`);
    },
    markAllAsRead: () => {
        return notificationServiceApi.put(`/user/read-all`);
    }
};
