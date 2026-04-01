import api from '../api/axiosConfig';
import {LoginRequest, LoginResponse, RegisterRequest} from './types';

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
        window.location.href = "http://localhost:8083/oauth2/authorization/google";
    },
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');

        return !!token;
    }

};

export default authService;