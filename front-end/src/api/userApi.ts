import api from "@/services/axiosConfig.ts";


export const getLecturerByUser = async (userId) => {
    const response = await api.get(
        `/lecturer/lecturers/by-user/${userId}`
    );

    return response.data;
};