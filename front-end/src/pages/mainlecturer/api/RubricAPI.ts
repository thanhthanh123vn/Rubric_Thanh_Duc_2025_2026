import {rubricServiceApi} from "@/services/axiosConfig.ts";

interface RubricDetailResponse {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}
export interface CriteriaDTO {
    id: string;
    name: string;
    weight: number;
    cloId: string;
}

export interface RubricDTO {
    id: string;
    name: string;
    description: string;
    defaultType: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}

export const getAllRubrics = async (): Promise<RubricDTO[]> => {
    const response = await rubricServiceApi.get("/rubrics");
    return response.data;
};

export const getRubricById = (id: string) => {
    return rubricServiceApi.get(`/rubrics/${id}`);
};
export const updateRubric = async (id: string, data: RubricDetailResponse) => {
    return await rubricServiceApi.put(`/rubrics/${id}`, data);
};