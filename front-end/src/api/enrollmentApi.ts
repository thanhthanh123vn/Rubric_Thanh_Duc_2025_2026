
import {courseApi} from "@/services/axiosConfig.ts";
export const enrollmentService = {
    getStudentGrading: async (studentId:string)=>{
        const response = await courseApi.get(`/enrollments/students/${studentId}/transcript`);
        return response.data;
    }

}