import {courseApi} from "@/services/axiosConfig.ts";

export const getPost = (postId: string) => {
    const url = `/topic/offerings/${postId}/topics`
    console.log(" URL:", courseApi.defaults.baseURL + url)

    return courseApi.get(url)
}


export const courseService = {

    enrollCourse: async (studentId: string, offeringId: string) => {
        const response = await courseApi.post('/courses/enroll', null, {
            params: {
                studentId: studentId,
                offeringId: offeringId
            }
        });
        return response.data;
    },
    getCourseById: async (offeringId: string) => {

        const response = await courseApi.get(`/courses/offering/${offeringId}/course`);
        return response.data;
    },
    getTopicsByOfferingId : async (offeringId: string) => {
        const response = await courseApi.get(`/topic/offerings/${offeringId}/topics`);
        return response.data;
    },
    createTopic : async (offeringId: string, content: string, postType: string = "NORMAL") => {
        const response = await courseApi.post(`/topic/offerings/${offeringId}/topics`, {
            content: content,
            postType: postType
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
    },

    getCommentsByPostId: async (postId: string) => {
        const response = await courseApi.get(`/topic/offerings/${postId}/comments`);
        return response.data;
    },
    createComment: async (postId: string, content: string) => {
        const response = await courseApi.post(`/topic/offerings/${postId}/comments`, { content });
        return response.data;
    },


};
export const enrollCourse = async (offeringId: string) => {

    const response = await courseApi.post(`/courses/enroll`, {
        offeringId: offeringId
    });
    return response.data;
}