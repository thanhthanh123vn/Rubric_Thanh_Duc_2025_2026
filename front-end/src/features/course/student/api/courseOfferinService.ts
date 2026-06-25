

import {courseApi} from "@/services/axiosConfig.ts";
import type {CourseOfferingResponse} from "@/pages/admin/api/type.ts";


export const courseOfferingService = {



    getOfferingsByCourseId: async (courseId: string): Promise<CourseOfferingResponse[]> => {
        const response = await courseApi.get(`/courses-offering/${courseId}/offerings`);
        return response.data;
    },

    getOfferings: async (): Promise<CourseOfferingResponse[]> => {
        const respone = await courseApi.get('courses-offering/offerings');
        return respone.data;
    }
};