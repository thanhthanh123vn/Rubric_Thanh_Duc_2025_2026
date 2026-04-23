import axiosInstance from "../../../services/axiosConfig";
import type {LecturerProfile} from "@/pages/admin/api/type.ts";

const lecturerService = {

    getAllLecturers: async (page: number, size: number, keyword: string) => {
        const response = await axiosInstance.get(`/lecturer/lecturers`, {
            params: { page, size, keyword }
        });
        return response.data;
    },


    updateLecturer: async (id: string, data: Partial<LecturerProfile>) => {
        const response = await axiosInstance.put(`/lecturer/lecturers/${id}`, data);
        return response.data;
    },


    deleteLecturer: async (id: string) => {
        const response = await axiosInstance.delete(`/lecturer/lecturers/${id}`);
        return response.data;
    }
};

export default lecturerService;