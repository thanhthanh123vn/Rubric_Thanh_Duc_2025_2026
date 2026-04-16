
// Trong file types.ts của Frontend
export interface LoginResponse {
    token: string;
    studentId: string;
    userName: string;
    role: string;
    fullName: string; // Chữ 'n' phải viết thường
}
export interface RegisterRequest {
    studentId: string;
    fullName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    identifier: string;
    password: string;
}


export interface UserProfile {
    studentId: string;
    role: string;
}