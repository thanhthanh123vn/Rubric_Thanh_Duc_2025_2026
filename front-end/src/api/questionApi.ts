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
    clos: any[];
}
export const questionApi = {
    getQuestionsByCourse: async (
        courseId: string
    ): Promise<Question[]> => {
        const response = await courseApi.get<Question[]>(
            `/questions/course/${courseId}`
        );
        return response.data;
    },

    createQuestion: (courseId: string, data: any) =>
        courseApi.post<Question>(
            `/questions/course/${courseId}`,
            data
        ),

    deleteQuestion: (questionId: string) =>
        courseApi.delete(`/questions/${questionId}`),
    importQuestions: (courseId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return courseApi.post(
            `/questions/course/${courseId}/import`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },
};