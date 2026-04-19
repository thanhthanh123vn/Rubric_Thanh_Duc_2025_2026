import type {PageResponse, StudentProfile} from "@/pages/admin/api/type.ts";
import api from "@/services/axiosConfig.ts";

class ScheduleRequest {
}

class ScheduleResponse {
}

const sinhVienService = {

    getAllSinhVien: async (page: number = 0, size: number = 10, keyword: string = ""): Promise<PageResponse<StudentProfile>> => {
        const response = await api.get<PageResponse<StudentProfile>>('/sinhvien', {
            params: { page, size, keyword }
        });
        return response.data;
    },


    getProfile: async (): Promise<StudentProfile> => {
        const response = await api.get<StudentProfile>('/sinhvien/profile/me');
        return response.data;
    },


    deleteSinhVien: async (formData: Partial<StudentProfile>): Promise<StudentProfile> => {
        const response = await api.put<StudentProfile>('/sinhvien/profile/me', formData);
        return response.data;
    },

    updateProfile: async (formData: Partial<StudentProfile>): Promise<StudentProfile> => {

        const response = await api.put<StudentProfile>('/sinhvien/profile/me', formData);
        return response.data;
    },
    getSchedules: async (): Promise<ScheduleResponse[]> => {

        const response = await api.get<ScheduleResponse[]>(`v1/schedules/my-schedule`);

        return response.data;
    },
    getAllSystemSchedules: async (): Promise<ScheduleResponse[]> => {
        const response = await api.get<ScheduleResponse[]>(`/schedules`);
        return response.data;
    },


    getScheduleById: async (scheduleId: string): Promise<ScheduleResponse> => {
        const response = await api.get<ScheduleResponse>(`/v1/schedules/${scheduleId}`);
        return response.data;
    },


    createSchedule: async (data: ScheduleRequest): Promise<ScheduleResponse> => {
        const response = await api.post<ScheduleResponse>(`/v1/schedules`, data);
        return response.data;
    },


    updateSchedule: async (scheduleId: string, data: ScheduleRequest): Promise<ScheduleResponse> => {
        const response = await api.put<ScheduleResponse>(`/v1/schedules/${scheduleId}`, data);
        return response.data;
    },


    deleteSchedule: async (scheduleId: string): Promise<void> => {
        const response = await api.delete<void>(`/schedules/${scheduleId}`);
        return response.data;
    }
};

export default sinhVienService;