
import {courseApi} from "@/services/axiosConfig.ts";
import type {
    CreateGroupRequest,
    CreateTaskRequest,
    GroupResponse,
    GroupTaskResponse
} from "@/features/course/student/api/type.ts";


export const groupService = {

    createGroup: async (data: CreateGroupRequest) => {
        const response = await courseApi.post('/group/create', data);
        return response.data;
    },

    getMyGroups: async (offeringId: string, userId: string): Promise<GroupResponse[]> => {
        const response = await courseApi.get(`/group/offering/${offeringId}/user/me`);
        return response.data;
    },


    addMember: async (groupId: string, memberId: string): Promise<GroupResponse> => {
        const response = await courseApi.post(`/group/${groupId}/members?memberId=${memberId}`);
        // Giả sử Controller trả về ResponseEntity.ok(Map.of(..., "data", updatedGroup))
        return response.data.data;
    },

    removeMember: async (groupId: string, memberId: string): Promise<GroupResponse> => {
        const response = await courseApi.delete(`/group/${groupId}/members/${memberId}`);
        return response.data.data;
    },

    changeRole: async (groupId: string, memberId: string, role: string): Promise<GroupResponse> => {
        const response = await courseApi.put(`/group/${groupId}/members/${memberId}/role?role=${role}`);
        return response.data.data;
    },
    getTasks: async (groupId: string): Promise<GroupTaskResponse[]> => {
        const response = await courseApi.get(`/group/tasks/${groupId}`);
        return response.data.data;
    },
    createTask: async (data: CreateTaskRequest): Promise<GroupTaskResponse> => {
        const response = await courseApi.post(`/group/tasks`, data);
        return response.data.data;
    },
    updateTaskStatus: async (taskId: string, status: string): Promise<GroupTaskResponse> => {
        const response = await courseApi.put(`/group/tasks/${taskId}/status?status=${status}`);
        return response.data.data;
    },
    deleteTask: async (taskId: string) => {
        const response = await courseApi.delete(`/group/tasks/${taskId}`);
        return response.data;
    }
};