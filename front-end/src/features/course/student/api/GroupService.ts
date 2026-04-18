
import {courseApi} from "@/services/axiosConfig.ts";
import type {CreateGroupRequest, GroupResponse} from "@/features/course/student/api/type.ts";


export const groupService = {


    createGroup: async (data: CreateGroupRequest) => {
        const response = await courseApi.post('/v1/group/create', data);
        return response.data;
    },


    getMyGroups: async (offeringId: string, userId: string): Promise<GroupResponse[]> => {
        const response = await courseApi.get(`/v1/group/offering/${offeringId}/user/${userId}`);
        return response.data;
    }

};