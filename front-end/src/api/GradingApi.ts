import {courseApi, gradeSerciveApi, rubricServiceApi} from "@/services/axiosConfig.ts";


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
export const gradingApi = {


    saveGrades: async (payload: { assessmentId: string; grades: any[] }) => {
        const res = await gradeSerciveApi.post('/exams/save-grades', payload);
        return res.data;
    },

    getStudentsToGrade: async (offeringId: string, assessmentId: string) => {
        const res = await gradeSerciveApi.get(`/exams/${offeringId}/students/${assessmentId}`);
        return res.data;
    },
};