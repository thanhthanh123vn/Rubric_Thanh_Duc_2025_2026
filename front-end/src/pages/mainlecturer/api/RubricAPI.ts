import {rubricServiceApi} from "@/services/axiosConfig.ts";




export interface RubricDTO {
    rubricId: string; // Đây sẽ là "R1", "R2", "R3"
    rubricName: string;
    description: string;
    defaultType: string;
}


export const getAllRubrics = async (): Promise<RubricDTO[]> => {
    const response = await rubricServiceApi.get("/rubric");
    return response.data;
};