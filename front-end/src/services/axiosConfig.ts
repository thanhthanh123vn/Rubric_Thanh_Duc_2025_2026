import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from 'axios';
const BASE = import.meta.env.VITE_API_BASE;
console.log(import.meta.env.VITE_API_BASE);
const attachToken = (config : InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
}
//user-service
export const api = axios.create({
    baseURL: `${BASE}/user-service`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const noticationServiceApi = axios.create({
    baseURL: `${BASE}/notification-service`,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const courseApi = axios.create({
    baseURL: `${BASE}/course-service`,

    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
courseApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
noticationServiceApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
export default api;
