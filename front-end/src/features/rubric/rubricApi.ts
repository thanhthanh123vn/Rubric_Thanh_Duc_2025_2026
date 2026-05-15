import {rubricServiceApi} from "@/services/axiosConfig.ts";

export const getAllRubric =  () => {
    return rubricServiceApi.get('/rubrics')
}