import {rubricServiceApi} from "@/services/axiosConfig.ts";

interface Clo{
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    courseId?: string;
}

export const getAllRubric =  () => {
    return rubricServiceApi.get('/rubrics')
}

export const getAllClo =  () => {
    return rubricServiceApi.get('/course-clo')
}

export const createClo = (data: Clo) => {
    return rubricServiceApi.post('/course-clo', data);
};