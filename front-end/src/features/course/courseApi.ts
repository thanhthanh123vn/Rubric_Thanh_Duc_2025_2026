import {courseApi} from "@/services/axiosConfig.ts";

export const getPost = (postId: string) => {
    const url = `/topic/offerings/${postId}/topics`
    console.log("👉 URL:", courseApi.defaults.baseURL + url)

    return courseApi.get(url)
}

