import axiosInstance from "../../../services/axiosConfig"; // Đường dẫn file config axios của bạn
import type {Course} from "./type";

const courseService = {
    getAllCourses: async (page: number, size: number, keyword: string) => {
        const response = await axiosInstance.get(`/courses`, {
            params: { page, size, keyword }
        });
        return response.data;
    },
    createCourse: async (data: Partial<Course>) => {
        const response = await axiosInstance.post(`/courses`, data);
        return response.data;
    },
    updateCourse: async (id: string, data: Partial<Course>) => {
        const response = await axiosInstance.put(`/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string) => {
        const response = await axiosInstance.delete(`/courses/${id}`);
        return response.data;
    }
};

export default courseService;