
import type { PostRequest, PostResponse } from '@/api/type.ts';
import {courseApi} from "@/services/axiosConfig.ts";

const postService = {
    /**
     * Tạo một bài đăng/thông báo mới cho lớp học phần
     */
    createPost: async (data: PostRequest): Promise<PostResponse> => {

        const response = await courseApi.post('/posts', data);
        return response.data;
    },


    getPostsByOffering: async (offeringId: string): Promise<PostResponse[]> => {
        const response = await courseApi.get(`/posts/course/${offeringId}`);
        return response.data;
    },
    getPostById: async (postId: string): Promise<PostResponse> => {
        const response = await courseApi.get(`/posts/${postId}`);
        return response.data;
    }
};

export default postService;