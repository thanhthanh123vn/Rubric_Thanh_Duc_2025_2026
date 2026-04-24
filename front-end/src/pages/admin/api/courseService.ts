import { courseApi } from "@/services/axiosConfig.ts";
import type {Course} from "./type";

const courseService = {
    getAllCourses: async (page: number, size: number, keyword: string) => {
        const response = await courseApi.get(`/courses`, {
            params: { page, size, keyword }
        });
        return response.data;
    },
    createCourse: async (data: Partial<Course>) => {
        const response = await courseApi.post(`/courses`, data);
        return response.data;
    },
    updateCourse: async (id: string, data: Partial<Course>) => {
        const response = await courseApi.put(`/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string) => {
        const response = await courseApi.delete(`/courses/${id}`);
        return response.data;
    },

    assignLecturer: async (courseId: string, lecturerId: string) => {

        const response = await courseApi.post(`/courses/${courseId}/assign-lecturer`, {
            lecturerId: lecturerId
        });
        return response.data;
    }
};

export default courseService;
