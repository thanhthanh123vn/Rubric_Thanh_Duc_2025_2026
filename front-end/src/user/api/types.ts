
export interface LoginResponse {
    token: string;
    studentId: string;
    role: string;
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