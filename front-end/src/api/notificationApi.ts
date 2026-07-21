import {notificationServiceApi} from "@/services/axiosConfig";

// export const notificationApi = {
//
//     getNotifications: () => {
//         return notificationServiceApi.get(`/getNotification/me`);
//     },
// }
//
// import { courseApi } from "@/services/axiosConfig.ts";

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
        const response = await courseApi.get<NotificationResponse[]>("/admin/notifications");
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await courseApi.patch(`/admin/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await courseApi.patch("/admin/notifications/read-all");
    },

    deleteNotification: async (id: string): Promise<void> => {
        await courseApi.delete(`/admin/notifications/${id}`);
    }
};