import api from "@/services/axiosConfig.ts";
import type {Department} from "@/api/lecturerApi.ts";

export const facultyService = {
    getAll: () => api.get('/faculties').then(res => res.data),
    create: (data: any) => api.post('/faculties', data),
    update: (id: string, data: any) => api.put(`/faculties/${id}`, data),
    delete: (id: string) => api.delete(`/faculties/${id}`)
}