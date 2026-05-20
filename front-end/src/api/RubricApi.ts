import {rubricServiceApi} from "@/services/axiosConfig.ts";
import type {CriteriaDTO} from "@/pages/mainlecturer/api/RubricAPI.ts";
export interface RubricDTO {
    id: string;
    name: string;
    description: string;
    defaultType: string;
    totalWeight: number;
    criteria: CriteriaDTO[];
}

export const getRubricById = async (id: string) => {
    return rubricServiceApi.get(`/rubrics/${id}`);
};