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
    getNotificationsSent: async () => {
        const response = await notificationServiceApi.get<NotificationItem[]>(`/getNotification/sent`);
        return response.data;
    },

    markAsRead: (notificationId: string) => {
        return notificationServiceApi.put(`/${notificationId}/read`);
    },
    markAllAsRead: () => {
        return notificationServiceApi.put(`/user/read-all`);
    },
    deleteNotification: async (notificationId: string) => {
        return await notificationServiceApi.delete(`/${notificationId}`);
    },
    updateNotification: async (notificationId: string, data: { title: string; content: string }) => {
        const response = await notificationServiceApi.put(`/${notificationId}`, data);
        return response.data;
    },
    broadcastNotification: (data: {
        title: string;
        message: string;
        recipientRole: string;
    }) => {
        return notificationServiceApi.post("/notifications/broadcast", data);
    },

};
