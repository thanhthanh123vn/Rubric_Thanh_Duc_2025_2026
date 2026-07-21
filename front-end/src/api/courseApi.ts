import axios from "axios";
import {courseApi} from "@/services/axiosConfig.ts";


export interface GradebookStudent {
    studentId: string;
    fullName: string;
    attendanceScore: number | null;
    assignmentScore: number | null;
    examScore: number | null;
    letterGrade: string | null;
}

export interface CourseGradebook {
    attendanceWeight: number;
    assignmentWeight: number;
    students: GradebookStudent[];
}

export interface GradebookScorePayload {
    studentId: string;
    attendanceScore: number | null;
    assignmentScore: number | null;
    examScore: number | null;
}




export const courseService = {


    getGradebook: async (offeringId: string): Promise<CourseGradebook> => {
        const response = await courseApi.get(`/offerings/${offeringId}/gradebook`);

        return response.data;
    },

    // Gọi API Lưu cấu hình tỷ trọng
    updateGradebookConfig: async (
        offeringId: string,
        attendanceWeight: number,
        assignmentWeight: number
    ): Promise<CourseGradebook> => {
        const response = await courseApi.put(`/offerings/${offeringId}/gradebook/config`, {
            attendanceWeight,
            assignmentWeight
        });
        return response.data.data;
    },


    updateGradebookScores: async (
        offeringId: string,
        payload: GradebookScorePayload[]
    ): Promise<CourseGradebook> => {
        const response = await courseApi.put(`/offerings/${offeringId}/gradebook/scores`, payload);
        return response.data.data;
    },


    importGradebook: async (offeringId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await courseApi.post(`/offerings/${offeringId}/gradebook/import`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    },


    downloadGradebookTemplate: async (offeringId: string): Promise<Blob> => {
        const response = await courseApi.get(`/offerings/${offeringId}/gradebook/template`, {
            responseType: "blob"
        });
        return response.data;
    }
};