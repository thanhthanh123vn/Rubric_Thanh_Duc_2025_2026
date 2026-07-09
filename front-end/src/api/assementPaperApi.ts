import {courseApi} from "@/services/axiosConfig.ts";

export const assessmentPaperServiceApi = {
    async submitStudentExam(payload: {
        examId: string;
        answers: {
            questionId: string;
            type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER';
            selectedOptionIndex?: number;
            textAnswer?: string;
        }[];
        submittedAt: string;
        autoSubmit: boolean;
    }) {
        const res = await courseApi.post('/student/exams/submit', payload);
        return res.data;
    },
};