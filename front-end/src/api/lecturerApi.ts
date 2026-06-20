import api, {courseApi} from "@/services/axiosConfig.ts";
import type {PostResponse} from "@/api/type.ts";
export interface Department {
    departmentId: string;
    departmentName: string;
}
export const lecturerApi =  {

    getLecturerById: async (lecturerId: string) => {
        const response = await api.get(`/lecturer/lecturers/${lecturerId}`);
        return response.data;
    }
};

export const getAllDepartments = async (): Promise<Department[]> => {

    const response = await api.get('/departments');
    return response.data;
};