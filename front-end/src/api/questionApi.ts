import { courseApi } from "@/services/axiosConfig";
export interface AnswerOption {
    id: string;
    content: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    content: string;
    type: "MULTIPLE_CHOICE" | "ESSAY";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    options: AnswerOption[];
    cloIds: any[];
}
export const questionApi = {
    getQuestionsByCourse: async (
        offeringId: string
    ): Promise<Question[]> => {
        const response = await courseApi.get<Question[]>(
            `/questions/course/${offeringId}`
        );
        return response.data;
    },
    getQuestionsByCourseIdAndBankID: async (
        offeringId: string,
        bankId:string
    ): Promise<Question[]> => {
        const response = await courseApi.get<Question[]>(
            `/questions/course/${offeringId}/bank/${bankId}`
        );
        return response.data;
    },

    createQuestion: (offeringId: string, data: any) =>
        courseApi.post<Question>(
            `/questions/course/${offeringId}`,
            data
        ),
    updateQuestion: (id: string, data: any) =>
        courseApi.put<Question>(
            `/questions/course/${id}`,
            data
        ),

    deleteQuestion: (questionId: string) =>
        courseApi.delete(`/questions/course/${questionId}`),
    importQuestions: (offeringId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return courseApi.post(
            `/questions/course/${offeringId}/import`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },
    importQuestionsToBank: async (
        offeringId: string,

        file: File,
        bankId: string,
    ) => {

        const formData = new FormData();

        formData.append("file", file);

        return await courseApi.post(
            `/questions/course/${offeringId}/bank/${bankId}/import`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },
    countQuestion: async (offeringIds: string[]) => {
        const response = await courseApi.post("/questions/course/counts", offeringIds);
        return response.data;
    },
    countQuestionsByBank: async (
        offeringId: string,
        bankId: string
    ) => {

        const response = await courseApi.get(
            `/questions/course/${offeringId}/bank/${bankId}/count`
        );

        return response.data;
    },
};