import {courseApi} from "@/services/axiosConfig.ts";


export const assessmentCommentApi = {
    getComments: async (assessmentId: string) => {

        const response = await courseApi.get(`/assessments/${assessmentId}/comments`);
        return response.data;
    },

    addComment: async (assessmentId: string, content: string) => {
        const response = await courseApi.post(`/assessments/${assessmentId}/comments`, {
            content: content
        });
        return response.data;
    },
    getAssessmentDetail: async (assessmentId: string) => {
        const response = await courseApi.get(`/assessments/${assessmentId}/detail`);
        return response.data;
    },

    unsubmitAssignment: async (assessmentId: string) => {
        const response = await courseApi.delete(`/assessments/${assessmentId}/unsubmit`);
        return response.data;
    }
};