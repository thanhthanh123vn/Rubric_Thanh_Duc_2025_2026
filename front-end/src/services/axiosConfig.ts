import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getBrowserToken } from "@/utils/browserId.ts";
import { toast } from 'sonner';

const BASE = import.meta.env.VITE_API_BASE;

// 1. KHỞI TẠO CÁC AXIOS INSTANCE
export const api = axios.create({ baseURL: `${BASE}/user-service`, headers: { 'Content-Type': 'application/json' } });
export const notificationServiceApi = axios.create({ baseURL: `${BASE}/notification-service`, headers: { 'Content-Type': 'application/json' } });
export const rubricServiceApi = axios.create({ baseURL: `${BASE}/rubric-service`, headers: { 'Content-Type': 'application/json' } });
export const gradeSerciveApi = axios.create({ baseURL: `${BASE}/grading-service`, headers: { 'Content-Type': 'application/json' } });
export const courseApi = axios.create({ baseURL: `${BASE}/course-service`, headers: { 'Content-Type': 'application/json' } });


const allInstances = [api, notificationServiceApi, rubricServiceApi, gradeSerciveApi, courseApi];

// 2. REQUEST INTERCEPTOR: Tự động đính kèm Token vào Header
const attachToken = (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    config.headers['X-Device-Token'] = getBrowserToken();
    return config;
};

allInstances.forEach(instance => {
    instance.interceptors.request.use(attachToken, (error) => Promise.reject(error));
});

// 3. RESPONSE INTERCEPTOR: Xử lý tự động Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const setupResponseInterceptor = (instance: any) => {
    instance.interceptors.response.use(
        (response: any) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // Nếu gặp lỗi 401 (Hết hạn Token) và chưa từng thử lại request này
            if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;

                // Nếu đang trong tiến trình lấy token mới, cho các request khác vào hàng đợi
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.set('Authorization', `Bearer ${token}`);
                            }
                            return instance(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                isRefreshing = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!refreshToken) {
                        throw new Error("Không có refresh token");
                    }



                    const response = await axios.post(`${BASE}/user-service/auth/refresh-token`, {
                        refreshToken: refreshToken
                    });

                    // Tùy thuộc vào backend của bạn trả về field tên là 'token' hay 'accessToken'
                    const newAccessToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;

                    // Lưu token mới
                    localStorage.setItem('token', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Đính kèm token mới vào request vừa bị thất bại
                    if (originalRequest.headers) {
                        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
                    }

                    // Giải phóng hàng đợi
                    processQueue(null, newAccessToken);

                    // Gọi lại API ban đầu bị lỗi
                    return instance(originalRequest);

                } catch (refreshError) {
                    processQueue(refreshError as AxiosError, null);

                    // Refresh token cũng đã hết hạn -> Đăng xuất
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');

                    toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
                    window.location.href = '/login';

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};

// Áp dụng bộ lọc Refresh Token cho TẤT CẢ các microservice API
allInstances.forEach(setupResponseInterceptor);