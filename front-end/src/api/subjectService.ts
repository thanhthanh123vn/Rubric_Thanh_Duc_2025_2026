import api from "@/services/axiosConfig.ts";


export const subjectService = {
    getAll: () => api.get('/departments').then(res => res.data),
    create: (data: any) => api.post('=/departments', data),
    update: (id: string, data: any) => api.put(`/departments/${id}`, data),
    delete: (id: string) => api.delete(`/departments/${id}`)
};