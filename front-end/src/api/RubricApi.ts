import {courseApi, rubricServiceApi} from "@/services/axiosConfig.ts";
import type {CriteriaDTO} from "@/pages/mainlecturer/api/RubricAPI.ts";
import type {Level} from "@/api/rubricType.ts";
export interface RubricDTO {
    id: string;
    rubricName: string;
    description: string;
    defaultType: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}
export interface CriteriaPayload {
    id?: string;
    name: string;
    cloId: string | null;
    weight: number;
    levels:Level[];
}


export interface CreateRubricPayload {
    rubricName: string;
    courseId: string;
    description?: string;
    submitForApproval: boolean;
    criteria: CriteriaPayload[];
}

export const getRubricById = async (id: string) => {
    return rubricServiceApi.get(`/rubrics/${id}`);
};
export const getRubricMatrixById = async (id: string) => {
    return rubricServiceApi.get(`/rubrics/matrix/${id}`);
};

export const rubricApi = {

    getApprovals: async (status: string = 'PENDING') => {
        const response = await rubricServiceApi.get(`/rubrics/approvals?status=${status}`);
        return response.data;
    },


    reviewRubric: (rubricId: string, action: 'APPROVE' | 'REJECT', feedback: string) => {
        return rubricServiceApi.put(`/rubrics/${rubricId}/review`, {
            action,
            feedback
        });
    },
    createRubric: (data: {
        rubricName: string;
        criteria: { cloId: string; id: string; name: string; weight: number; levels: Level[] }[];
        description: string;
        submitForApproval: boolean;
        courseId: string
    }) => {
        return rubricServiceApi.post('/rubrics', data);
    },

    getMyRubrics: () => {
        return rubricServiceApi.get('/rubrics/me');
    },
    getOverview: async () =>{
        const response = await courseApi.get("/student/dashboard/overview");
        return response.data;
    }

};