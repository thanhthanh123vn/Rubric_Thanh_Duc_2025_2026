import api from "@/services/axiosConfig.ts";


export const getLecturerByUser = async (userId) => {
    const response = await api.get(
        `/lecturer/lecturers/by-user/${userId}`
    );

    return response.data;
};


export const userService = {
    changePassword: async (data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => {
        const response = await api.put(
            "/auth/change-password",
            data
        );
        return response.data;
    },

}