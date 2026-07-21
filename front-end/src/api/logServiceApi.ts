import { courseApi } from "@/services/axiosConfig.ts";

export const logService = {
    getLogs: async (levelFilter: string, searchQuery: string, page: number = 0, size: number = 20) => {

        const level = levelFilter === 'ALL' ? '' : levelFilter;

        const response = await courseApi.get("/courses/system-logs", {
            params: {
                level: level,
                keyword: searchQuery,
                page: page,
                size: size
            }
        });
        return response.data;
    }
}