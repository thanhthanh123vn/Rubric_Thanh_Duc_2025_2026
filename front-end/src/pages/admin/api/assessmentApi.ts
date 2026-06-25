

// Cấu hình base URL tùy theo project của bạn
import {courseApi} from "@/services/axiosConfig.ts";

const API_URL = '/api/v1/course-service';

export interface Assessment {
    assessmentId: string;
    assessmentName: string;
    description: string;
    weight: number;
    assessmentType: string;
    endTime: string;
    rubricId?: string;

}

export const assessmentService = {

    getAssessmentsByOffering: async (offeringId: string) => {
        const response = await courseApi.get(`/offerings/${offeringId}/assessments-list`);
        return response.data;
    },


    createAssessment: async (offeringId: string, data: any, file?: File) => {
        const formData = new FormData();
        formData.append('assessmentName', data.assessmentName);
        formData.append('assessmentType', data.assessmentType);
        formData.append('endTime', data.endTime); // Format: yyyy-MM-dd'T'HH:mm:ss
        if (data.description) formData.append('description', data.description);
        if (data.weight) formData.append('weight', data.weight.toString());
        if (data.rubricId) formData.append('rubricId', data.rubricId);
        if (file) formData.append('file', file);

        const response = await courseApi.post(`/offerings/${offeringId}/assessments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },


    updateAssessment: async (assessmentId: string, data: any, file?: File) => {
        const formData = new FormData();
        formData.append('assessmentName', data.assessmentName);
        formData.append('assessmentType', data.assessmentType);
        formData.append('endTime', data.endTime);
        if (data.description) formData.append('description', data.description);
        if (data.weight) formData.append('weight', data.weight.toString());
        if (data.rubricId) formData.append('rubricId', data.rubricId);
        if (file) formData.append('file', file);

        const response = await courseApi.put(`/assessments/${assessmentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },


    deleteAssessment: async (assessmentId: string) => {
        const response = await courseApi.delete(`/assessments/${assessmentId}`);
        return response.data;
    }
};