import { courseApi } from "@/services/axiosConfig.ts";

export interface CloAnalytics {
    cloId: string;
    cloCode: string;
    cloDescription: string;
    progressPercent: number;
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    below40: number;
    from40to70: number;
    above70: number;
}

export interface OfferingObeAnalytics {
    offeringId: string;
    totalStudents: number;
    overallProgress: number;
    clos: CloAnalytics[];
}

export interface CloDetail {
    cloId: string;
    cloCode: string;
    cloDescription: string;
    students: Array<{ studentId: string; fullName: string; score: number }>;
    assessments: Array<{ assessmentId: string; assessmentName: string; weight: number; achievementPercent: number }>;
}

const obeAnalyticsApi = {
    getOffering: async (offeringId: string): Promise<OfferingObeAnalytics> => {
        const response = await courseApi.get(`/obe/teacher/offerings/${offeringId}`);
        return response.data;
    },
    getCloDetail: async (offeringId: string, cloId: string): Promise<CloDetail> => {
        const response = await courseApi.get(`/obe/teacher/offerings/${offeringId}/clos/${cloId}`);
        return response.data;
    },
};

export default obeAnalyticsApi;
