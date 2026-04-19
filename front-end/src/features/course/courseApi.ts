import {courseApi} from "@/services/axiosConfig.ts";

export const getPost = (postId: string) => {
    const url = `/topic/offerings/${postId}/topics`
    console.log(" URL:", courseApi.defaults.baseURL + url)

    return courseApi.get(url)
}


export const couserService = {

    enrollCourse: async (studentId: string, offeringId: string) => {
        const response = await courseApi.post('/courses/enroll', null, {
            params: {
                studentId: studentId,
                offeringId: offeringId
            }
        });
        return response.data;
    },


    getDashboardCourses: async () => {
        const response = await courseApi.get(`/courses/student/me/dashboard`);
        return response.data;
    },
    getStudentsByOffering: async (offeringId: string) => {
        const response = await courseApi.get(`/courses/offering/${offeringId}/students`);
        return response.data;
    }
};
export const enrollCourse = async (offeringId: string) => {

    const response = await courseApi.post(`/courses/enroll`, {
        offeringId: offeringId
    });
    return response.data;
}