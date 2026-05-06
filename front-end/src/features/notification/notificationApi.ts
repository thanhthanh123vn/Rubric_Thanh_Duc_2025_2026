import {notificationServiceApi} from "@/services/axiosConfig";

export const notificationApi = {

    getNotifications: () => {
        return notificationServiceApi.get(`/getNotification/me`);
    },


    markAsRead: (notificationId: string) => {
        return notificationServiceApi.put(`/${notificationId}/read`);
    },
    markAllAsRead: (userId: string) => {
        return notificationServiceApi.put(`/user/${userId}/read-all`);
    }
};