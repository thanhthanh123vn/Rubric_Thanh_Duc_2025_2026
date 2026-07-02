import { courseApi } from "@/services/axiosConfig";

export interface QuestionBankRequest {
    name: string;
    offeringId: string;
    isPublic?: boolean;
    sharePermissions?: string[];
}

export interface QuestionBankResponse {
    id: string;
    name: string;
    offeringId: string;
    lecturerId: string;
    isPublic?: boolean;
    courseName?: string;
    sharePermissions?: string[];
}

export const questionBankApi = {
    getQuestionBanksByCourse:async (offeringId: string) => {

        const response = await courseApi.get(`/question-banks/course/${offeringId}`);
        return response.data;
    },
    getMyQuestionBanks: async (): Promise<QuestionBankResponse[]> => {
        const response = await courseApi.get(`/question-banks/lecturer/me`);
        return response.data;
    },
    getPublicQuestionBanks: async (): Promise<QuestionBankResponse[]> => {
        const response = await courseApi.get(`/question-banks/public`);
        return response.data;
    },
    getQuestionBankById: async (id: string): Promise<QuestionBankResponse> => {
        const response = await courseApi.get(`/question-banks/${id}`);
        return response.data;
    },
    
    getQuestionBanksByCourseForDep:async (offeringId: string) => {

        const response = await courseApi.get(`/question-banks/course/dep/${offeringId}`);
        return response.data;
    },
    getQuestionsByLecturerUserId:async ()=>{
        const response = await courseApi.get(`/question-banks/lecturer`);
        return response.data;
    },
    getQuestionsByLecturer: async (lecturerId: string) => {

        const response = await courseApi.get(`/api/v1/course-service/questions/lecturer/${lecturerId}`);
        return response.data;
    },
    createQuestionBank: async (data: QuestionBankRequest) => {
        const response = await courseApi.post("/question-banks", data);
        return response.data;
    },
    updateQuestionBank: async (id: string, data: QuestionBankRequest) => {
        const response = await courseApi.put(`/question-banks/${id}`, data);
        return response.data;
    },
    deleteQuestionBank: async (id: string) => {
        const response = await courseApi.delete(`/question-banks/${id}`);
        return response.data;
    },
    getPublicDepartmentBanks:async(offeringId: string) =>{
        const response = await courseApi.get(`/question-banks/department/public/${offeringId}`);
        return response.data;
    }

};
export const DepquestionBankApi = {
    getQuestionBanksByCourse:async (offeringId: string) => {

        const response = await courseApi.get(`/question-banks/course/dep/${offeringId}`);
        return response.data;
    },
};
