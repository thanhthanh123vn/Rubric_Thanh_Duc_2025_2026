
import api from "@/user/api/axiosConfig.ts";
import type {PageResponse, User} from "@/pages/admin/api/type.ts";


const userService = {

    getAllUser: async (page: number = 0, size: number = 10, keyword?: string): Promise<PageResponse<User>> => {
        const response = await api.get<PageResponse<User>>('/users', {
            params: {
                page: page,
                size: size,
                keyword: keyword
            }
        });
        return response.data;
    },
    createUser: async (userData: unknown ): Promise<User> => {
        const response = await api.post<User>('/auth/register', userData);
        return response.data;
    },
    getUserById: async (userId: string): Promise<User> => {
        const response = await api.get<User>(`/users/${userId}`);
        return response.data;
    },


    updateUser: async (userId: string, userData: unknown ): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}`, userData);
        return response.data;
    },
    deleteUser: async (userId: string): Promise<string> => {
        const response = await api.delete<string>(`/users/${userId}`);
        return response.data;
    }
};

export default userService;