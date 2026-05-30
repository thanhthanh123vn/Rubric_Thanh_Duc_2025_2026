import {courseApi, gradeSerciveApi, rubricServiceApi} from "@/services/axiosConfig.ts";


export const fetchSubmissionsPending = async (assessmentId: string) => {
    const response = await courseApi.get(
        `/assessments/${assessmentId}/submissions`
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