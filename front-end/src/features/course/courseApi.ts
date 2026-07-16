import {courseApi} from "@/services/axiosConfig.ts";

export type GradebookStudent = {
    studentId: string;
    fullName: string;
    attendanceScore?: number | null;
    attendanceWarningCount?: number | null;
    assignmentScore?: number | null;
    componentScore?: number | null;
    examScore?: number | null;
    totalScore?: number | null;
    letterGrade?: string | null;
};

export type CourseGradebook = {
    offeringId: string;
    attendanceWeight: number;
    assignmentWeight: number;
    componentWeight: number;
    examWeight: number;
    students: GradebookStudent[];
};

export type GradebookScorePayload = {
    studentId: string;
    attendanceScore: number | null;
    attendanceWarningCount?: number | null;
    assignmentScore: number | null;
    examScore: number | null;
};

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
    unenrollCourse: async (studentId: string, offeringId: string) => {

        const response = await courseApi.delete('/courses/enroll', {
            params: {
                studentId: studentId,
                offeringId: offeringId
            }
        });
        return response.data;
    },
    uploadSyllabus: async (courseId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await courseApi.post(
            `/courses/${courseId}/upload-syllabus`,
            formData,
            {
                headers: {

                    "Content-Type": "multipart/form-data",
                }
            }
        );
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
    getGradebook: async (offeringId: string): Promise<CourseGradebook> => {
        const response = await courseApi.get(`/courses/offering/${offeringId}/gradebook`);
        return response.data;
    },
    updateGradebookConfig: async (
        offeringId: string,
        attendanceWeight: number,
        assignmentWeight: number,
    ): Promise<CourseGradebook> => {
        const response = await courseApi.put(`/courses/offering/${offeringId}/gradebook/config`, {
            attendanceWeight,
            assignmentWeight,
        });
        return response.data;
    },
    updateGradebookScores: async (
        offeringId: string,
        scores: GradebookScorePayload[],
    ): Promise<CourseGradebook> => {
        const response = await courseApi.put(`/courses/offering/${offeringId}/gradebook/scores`, scores);
        return response.data;
    },
    importGradebook: async (offeringId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await courseApi.post(
            `/courses/offering/${offeringId}/gradebook/import`,
            formData,
            {headers: {"Content-Type": "multipart/form-data"}},
        );
        return response.data;
    },
    downloadGradebookTemplate: async (offeringId: string): Promise<Blob> => {
        const response = await courseApi.get(
            `/courses/offering/${offeringId}/gradebook/template`,
            {responseType: "blob"},
        );
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


    getOBEProgressByStudent : async (offeringId: string) => {
            const response = await courseApi.get(`/courses/offering/${offeringId}/OBE`)
            return response.data;
    },
    getOBEProgress : async (offeringId: string) => {
            const response = await courseApi.get(`/obe/teacher/offerings/${offeringId}`)
            return response.data;
    },
    getCLoDetail : async (offeringId: string,cloId : string) => {
        const response = await courseApi.get(`/obe/teacher/offerings/${offeringId}/clos/${cloId}`)
        return response.data;
    },
    getAssessmentByOffering: async (offeringId : string) =>{
        const response = await courseApi.get(`/offerings/${offeringId}/assessments`);
        return response.data;
    },
    getAssessmentDetail : async (assessmentId: string)=> {
        const response = await courseApi.get(`/assessments/${assessmentId}`)
        console.log(assessmentId)
        return response.data;
    },
    submitAssignment : async (assignmentId: string, formData: FormData) => {
        const response = await courseApi.post(
            `/assessments/${assignmentId}/submit`,formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            },
        )
        console.log(response)
        return response.data;
    }
};
export const enrollCourse = async (offeringId: string) => {

    const response = await courseApi.post(`/courses/enroll`, {
        offeringId: offeringId
    });
    return response.data;
}
