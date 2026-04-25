import { courseApi } from "../../../services/axiosConfig";

export interface Assessment {
    assessmentId: string;
    title: string;
    type: string;
    weight: number;
    fileUrl?: string;
    offeringId: string;
    description?: string;
    endTime?: string;
}

export const assessmentService = {
    getAllAssessments: async (page: number, size: number, keyword: string) => {
        const response = await courseApi.get(`/assessments`, {
            params: { page, size, keyword }
        });
        return response.data;
    },
    createAssessment: async (data: Partial<Assessment>) => {
        const response = await courseApi.post(`/assessments`, data);
        return response.data;
    },
    updateAssessment: async (id: string, data: Partial<Assessment>) => {
        const response = await courseApi.put(`/assessments/${id}`, data);
        return response.data;
    },
    deleteAssessment: async (id: string) => {
        const response = await courseApi.delete(`/assessments/${id}`);
        return response.data;
    },


    createAssessmentForOffering: async (
        offeringId: string,
        data: FormData
    ) => {
        const response = await courseApi.post(
            `/offerings/${offeringId}/assessments`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    getAssessmentsByOffering: async (offeringId: string) => {
        const response = await courseApi.get(`/offerings/${offeringId}/assessments-list`);
        return response.data;
    },
    updateAssessmentWithFormData: async (assessmentId: string, formData: FormData) => {
        const response = await courseApi.put(
            `/api/v1/course-service/assessments/${assessmentId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    }
};