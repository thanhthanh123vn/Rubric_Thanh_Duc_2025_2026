import type {PageResponse, StudentProfile} from "@/pages/admin/api/type.ts";
import api from "@/user/api/axiosConfig.ts";

const sinhVienService = {

    getAllSinhVien: async (page: number = 0, size: number = 10, keyword: string = ""): Promise<PageResponse<StudentProfile>> => {
        const response = await api.get<PageResponse<StudentProfile>>('/sinhvien', {
            params: { page, size, keyword }
        });
        return response.data;
    },


    getProfile: async (studentId: string): Promise<StudentProfile> => {
        const response = await api.get<StudentProfile>(`/sinhvien/profile/${studentId}`);
        return response.data;
    },


    deleteSinhVien: async (studentId: string): Promise<string> => {
        const response = await api.delete<string>(`/sinhvien/${studentId}`);
        return response.data;
    },
    updateProfile: async (studentId: string, formData: Partial<StudentProfile>): Promise<StudentProfile> => {
        const response = await api.put<StudentProfile>(`/sinhvien/profile/${studentId}`, formData);
        return response.data;
    }
};

export default sinhVienService;