import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from 'axios';

const attachToken = (config : InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
}
//user-service
export const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

//course-service
export const courseApi: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8082/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
courseApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

export default api;