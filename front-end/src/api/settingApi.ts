import {notificationServiceApi} from "@/services/axiosConfig.ts";


export interface SystemSettingDTO {
    systemName: string;
    contactEmail: string;
    timezone: string;
    twoFactorAuth: boolean;
    requireStrongPwd: boolean;
    emailNotifications: boolean;
    smsAlerts: boolean;
    theme: string;
    logoUrl?: string;
}

export const settingService = {
    // Lấy cấu hình hệ thống
    getSettings: async (): Promise<SystemSettingDTO> => {
        try {
            const response = await notificationServiceApi.get("/settings");
            return response.data;
        } catch (error) {
            console.error("Lỗi getSettings:", error);
            throw error;
        }
    },

    // Cập nhật cấu hình hệ thống
    updateSettings: async (data: SystemSettingDTO): Promise<SystemSettingDTO> => {
        try {
            const response = await notificationServiceApi.put("/settings", data);
            return response.data;
        } catch (error) {
            console.error("Lỗi updateSettings:", error);
            throw error;
        }
    },
};