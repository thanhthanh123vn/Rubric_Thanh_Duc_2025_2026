import { notificationServiceApi } from "@/services/axiosConfig";

export interface NotificationResponse {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationApi = {
    getAdminNotifications: async (): Promise<NotificationResponse[]> => {
        const response = await notificationServiceApi.get<NotificationResponse[]>(
            "/getNotification/me"
        );
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await notificationServiceApi.put(`/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await notificationServiceApi.put("/me/read-all");
    },

    deleteNotification: async (id: string): Promise<void> => {
        await notificationServiceApi.delete(`/${id}`);
    },

    broadcastNotification: (data: {
        title: string;
        message: string;
        recipientRole: string;
    }) => {
        return notificationServiceApi.post("/notifications/broadcast", data);
    },
};