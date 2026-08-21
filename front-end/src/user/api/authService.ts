import {api} from '../../services/axiosConfig.ts';
import type {LecturerProfile, LoginRequest, LoginResponse, RegisterRequest} from './types';
import {data} from "autoprefixer";

const authService = {
    register: async (data: RegisterRequest): Promise<string> => {
        const response = await api.post<string>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', data);
        return response.data;
    },


    logout: async() => {
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        await api.post('/auth/logout');
        // window.location.href = '/login';
    },

    loginWithGoogle: () => {
        window.location.href = `${import.meta.env.VITE_AUTH_BASE ?? ''}/oauth2/authorization/google`;
    },
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');

        return !!token;
    },
    getProfileLecturer: async (): Promise<LecturerProfile> =>{
        const response = await api.get<LecturerProfile>('/lecturer/profile/me');
        return response.data;

    },
      updateProfileLecturer : async (data: any) => {
        const response = await api.put(`/lecturer/profile/me`, data);
        return response.data;
    }

};
export const getProfile = async () => {

    const response = await api.get(`/student/profile/me`);
    return response.data;
};
export const updateProfile = async (data: any) => {
    const response = await api.put(`/student/profile/me`, data);
    return response.data;
};
export const forgotPassword = async (email: string) => {
    const response = await api.post(`/auth/forgot-password`, { email });
    return response.status;
}


export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await api.post(`/auth/reset-password`, {
        email: email,
        otp: otp,
        newPassword: newPassword
    });
    return response.status;
}
export const uploadAvatar = async ( formData: FormData) => {
    const response = await api.post(
        `/users/me/avatar`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',

            }
        }
    );

    return response.data;
};
export default authService;
