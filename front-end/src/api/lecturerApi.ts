import api, {courseApi} from "@/services/axiosConfig.ts";
import type {PostResponse} from "@/api/type.ts";

export const lecturerApi =  {

    getLecturerById: async (lecturerId: string) => {
        const response = await api.get(`/lecturer/lecturers/${lecturerId}`);
        return response.data;
    }
};