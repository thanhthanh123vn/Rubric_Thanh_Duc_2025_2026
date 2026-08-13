import { courseApi } from "@/services/axiosConfig.ts";

// 1. Định nghĩa các Interface dựa trên cấu trúc JSON của API
export interface DepartmentProgress {
    courseName: string;
    percent: number;
}

export interface RecentActivity {
    id: number;
    type: string;
    message: string | null;
    time: string | null;
    isUrgent: boolean;
}

export interface DeanDashboardData {
    totalLecturers: number;
    activeCourses: number;
    pendingRubrics: number;
    obeAchievementRate: number;
    departmentProgresses: DepartmentProgress[];
    recentActivities: RecentActivity[];
}


export const facultyService = {

    getOverViewHeadDeapartment: async (): Promise<DeanDashboardData> => {

        const response = await courseApi.get<DeanDashboardData>(`/faculty/head-department/overview`);
        return response.data;
    },
    getOverViewDeam: async (): Promise<DeanDashboardData> => {
        const response = await courseApi.get<DeanDashboardData>(`/faculty/dean/overview`);
        return response.data;

    },
    getCourseOffringDeam: async () => {

        const response = await courseApi.get<DeanDashboardData>(`/courses-offering/faculty/`);
        return response.data;
    }

}