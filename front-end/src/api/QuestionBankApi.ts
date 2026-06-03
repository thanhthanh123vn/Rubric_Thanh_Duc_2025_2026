import { courseApi } from "@/services/axiosConfig";


export interface QuestionBankRequest {
    name: string;
    offeringId: string;
}

export const questionBankApi = {
    getQuestionBanksByCourse:async (offeringId: string) => {
        const response = await courseApi.get(`/question-banks/course/${offeringId}`);
        return response.data;
    },
    createQuestionBank: async (data: QuestionBankRequest) => {
        const response = await courseApi.post(
            "/question-banks",
            data
        );
        return response.data;
    },
    updateQuestionBank : async (id:string ,data: QuestionBankRequest) => {
        const response = await courseApi.put(`/question-banks/${id}`, data);
        return response.data;

    },
    deleteQuestionBank : async (id:string ) => {
        const response = await courseApi.delete(`/question-banks/${id}`);
        return response.data;
    }

};