import api from '../../services/axiosConfig.ts';
import type {LoginRequest, LoginResponse, RegisterRequest} from './types';

const authService = {
    register: async (data: RegisterRequest): Promise<string> => {
        const response = await api.post<string>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    loginWithGoogle: () => {
        window.location.href = "http://localhost:8081/oauth2/authorization/google";
    },
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');

        return !!token;
    }

};
export const getProfile = async () => {

    const response = await api.get(`/sinhvien/profile/me`);
    return response.data;
};
export const updateProfile = async (studentId: string, data: any) => {
    const response = await api.put(`/sinhvien/profile/${studentId}`, data);
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
export default authService;