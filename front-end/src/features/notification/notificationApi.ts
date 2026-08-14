import {notificationServiceApi} from "@/services/axiosConfig";

export const notificationApi = {

    getNotifications: () => {
        return notificationServiceApi.get(`/getNotification/me`);
    },


    markAsRead: (notificationId: string) => {
        return notificationServiceApi.put(`/${notificationId}/read`);
    },
    markAllAsRead: () => {
        return notificationServiceApi.put(`/user/read-all`);
    }
};