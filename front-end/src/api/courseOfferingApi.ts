import { courseApi } from "@/services/axiosConfig";


export const courseOfferingApiService = {

    createOffering: async (courseId: string, payload: any) => {
        const response = await courseApi.post(`/courses-offering/${courseId}/offerings`, payload);
        return response.data;
    },


    updateOffering: async (offeringId: string, payload: any) => {
        const response = await courseApi.put(`/courses-offering/${offeringId}`, payload);
        return response.data;
    },


    deleteOffering: async (offeringId: string) => {
        const response = await courseApi.delete(`/courses-offering/${offeringId}`);
        return response.data;
    }
};