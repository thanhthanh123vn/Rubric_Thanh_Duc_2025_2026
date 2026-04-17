import {courseApi} from "@/services/axiosConfig.ts";

export const getPost = (postId: string) => {
    const url = `/topic/offerings/${postId}/topics`
    console.log(" URL:", courseApi.defaults.baseURL + url)

    return courseApi.get(url)
}


export const couserService = {

    enrollCourse: async (studentId: string, offeringId: string) => {
        const response = await courseApi.post('/v1/courses/enroll', null, {
            params: {
                studentId: studentId,
                offeringId: offeringId
            }
        });
        return response.data;
    },


    getDashboardCourses: async (studentId: string) => {
        const response = await courseApi.get(`/v1/courses/student/${studentId}/dashboard`);
        return response.data;
    }
};
export const enrollCourse = (studentId: string, offeringId: string) => {
    return courseApi.post(`/v1/courses/enroll?studentId=${studentId}&offeringId=${offeringId}`);
}