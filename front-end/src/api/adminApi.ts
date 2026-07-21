
import {courseApi} from "@/services/axiosConfig.ts";

export interface DashboardOverviewResponse {
    stats: {
        totalUsers: {
            value: string;
            increase: string;
        };
        activeCourses: {
            value: string;
            increase: string;
        };
        totalRubrics: {
            value: string;
            increase: string;
        };
        completionRate: {
            value: string;
            increase: string;
        };
    };
    allocations: Allocation[];
    recentActivities: RecentActivity[];
}

export interface Allocation {
    id: string;
    name: string;
    studentCount: number;
    percentage: number;
    colorClass: string;
}

export interface RecentActivity {
    id: string;
    action: string;
    time: string;
    type: string;
}

export const adminDashboardService = {
    getOverview: async (): Promise<DashboardOverviewResponse> => {
        const response = await courseApi.get<DashboardOverviewResponse>(
            "/admin/dashboard/overview"
        );

        return response.data;
    },
};