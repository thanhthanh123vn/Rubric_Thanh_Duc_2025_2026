import {courseApi, gradeSerciveApi, rubricServiceApi} from "@/services/axiosConfig.ts";
import type { FeedbackTemplateDTO } from "@/api/type";


export const fetchSubmissionsPending = async (assessmentId: string) => {
    const response = await courseApi.get(
        `/assessments/${assessmentId}/submissions`
    );
    return response.data;
};

export const fetchSubmissionStatuses = async (assessmentId: string) => {
    const response = await courseApi.get(
        `/assessments/${assessmentId}/submission-statuses`
    );
    return response.data;
};

export const getRubricById = async (id: string) => {
    return rubricServiceApi.get(`/rubrics/${id}`);
};

export const submitStudentGrade = async (gradeData: any) => {

    const response = await gradeSerciveApi.post(`/grade/submit`, gradeData);
    return response.data;
};

export const fetchFeedbackTemplates = async (userId: string) => {
    const response = await gradeSerciveApi.get<FeedbackTemplateDTO[]>(`/feedback-templates`, {
        params: { userId },
    });
    return response.data;
};

export const createFeedbackTemplate = async (payload: { userId: string; content: string }) => {
    const response = await gradeSerciveApi.post<FeedbackTemplateDTO>(`/feedback-templates`, payload);
    return response.data;
};

export const deleteFeedbackTemplate = async (templateId: number, userId: string) => {
    await gradeSerciveApi.delete(`/feedback-templates/${templateId}`, {
        params: { userId },
    });
};
