import { courseApi } from "@/services/axiosConfig"; // Thay đổi đường dẫn import nếu cần


export interface GenerateExamRequest {
    assessmentId: string;
    questionBankId: string;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    cloId: string;
}

export const assessmentPaperApi = {
    generateExamPaper: async (data: GenerateExamRequest) => {

        const response = await courseApi.post("/assessments/paper/generate", data);
        return response.data;
    }
};