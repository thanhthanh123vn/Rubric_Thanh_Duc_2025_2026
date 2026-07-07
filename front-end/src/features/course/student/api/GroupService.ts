
import axios from "axios";
import {courseApi} from "@/services/axiosConfig.ts";
import type {
    CreateGroupRequest,
    CreateTaskRequest,
    GroupResponse,
    GroupTaskResponse,
    UpdateTaskStatusRequest
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

    getGroupsByOffering: async (offeringId: string): Promise<GroupResponse[]> => {
        const response = await courseApi.get(`/group/offering/${offeringId}`);
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
        try {
            const response = await courseApi.post(`/group/tasks`, data);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Không thể tạo công việc.");
            }

            throw error;
        }
    },
    updateTaskStatus: async (taskId: string, data: UpdateTaskStatusRequest): Promise<GroupTaskResponse> => {
        try {
            const formData = new FormData();

            if (data.resultNote?.trim()) {
                formData.append("resultNote", data.resultNote.trim());
            }

            if (data.resultLink?.trim()) {
                formData.append("resultLink", data.resultLink.trim());
            }

            if (data.file) {
                formData.append("file", data.file);
            }

            const hasBodyData = Array.from(formData.keys()).length > 0;
            const response = await courseApi.put(
                `/group/tasks/${taskId}/status?status=${encodeURIComponent(data.status)}`,
                hasBodyData ? formData : null,
            );
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Không thể cập nhật công việc.");
            }

            throw error;
        }
    },
    deleteTask: async (taskId: string) => {
        const response = await courseApi.delete(`/group/tasks/${taskId}`);
        return response.data;
    }
};
