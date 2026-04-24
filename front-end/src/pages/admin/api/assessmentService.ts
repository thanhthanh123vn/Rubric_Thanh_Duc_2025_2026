import { courseApi } from "../../../services/axiosConfig";

export interface Assessment {
    assessmentId: string;
    title: string;
    type: string;
    weight: number;
    courseId: string;
    description?: string;
}

export const assessmentService = {
    getAllAssessments: async (page: number, size: number, keyword: string) => {
        const response = await courseApi.get(`/api/v1/course-service/assessments`, {
            params: { page, size, keyword }
        });
        return response.data;
    },
    createAssessment: async (data: Partial<Assessment>) => {
        const response = await courseApi.post(`/api/v1/course-service/assessments`, data);
        return response.data;
    },
    updateAssessment: async (id: string, data: Partial<Assessment>) => {
        const response = await courseApi.put(`/api/v1/course-service/assessments/${id}`, data);
        return response.data;
    },
    deleteAssessment: async (id: string) => {
        const response = await courseApi.delete(`/api/v1/course-service/assessments/${id}`);
        return response.data;
    }
};