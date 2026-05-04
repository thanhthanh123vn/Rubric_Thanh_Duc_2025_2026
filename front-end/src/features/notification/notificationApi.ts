import noticationServiceApi from "@/services/axiosConfig";

export const notificationApi = {

    getNotifications: () => {
        return noticationServiceApi.get(`/getNotification/me}`);
    },


    markAsRead: (notificationId: string) => {
        return noticationServiceApi.put(`/${notificationId}/read`);
    }
};