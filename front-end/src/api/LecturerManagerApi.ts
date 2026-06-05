
import type { PostRequest, PostResponse } from '@/api/type.ts';
import {courseApi} from "@/services/axiosConfig.ts";

const lecturerManagerService = {



    getLecturerByUserId: async (offeringId: string): Promise<PostResponse[]> => {
        const response = await courseApi.get(`/posts/course/${offeringId}`);
        return response.data;
    }

};

export default lecturerManagerService;