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

    async updateExam(
        examId: string,
        payload: {
            examTitle?: string;
            durationMinutes?: number | null;
            startTime?: string | null;
            endTime?: string | null;
            sourceQuestionBankId?: string | null;
            questionIds?: string[];
        }
    ) {
        const res = await courseApi.put(`/assessments/paper/${examId}`, payload);
        return res.data;
    },


    async deleteExam(examId: string) {
        const res = await courseApi.delete(`/assessments/paper/${examId}`);
        return res.data;
    },
};