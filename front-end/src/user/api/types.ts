export interface StudentProfile {
    studentId: string;
    fullName: string;
    className?: string;
    major?: string;
    cohort?: string;
    email?:string;
}

export interface LecturerProfile {
    lecturerId: string;
    fullName: string;
    department?: string;
    academicTitle?: string;
    email?:string;
    avatarUrl?: string;
    dateOfBirth?: string;
    cccd?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
}

export interface LoginResponse {
    fullName: string;
    token: string;
    role: "STUDENT" | "TEACHER" | "ADMIN" | "MAIN_LECTURER"| "HEAD_OF_DEPARTMENT"|"DEAN";
    userId: string;
    student?: StudentProfile;
    email?:string;

    lecturer?: LecturerProfile;
    avatarUrl?: string;
    refreshToken: string;
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
    userId: string;
    role: "STUDENT" | "TEACHER";
    fullName: string;
    studentId?: string;
    lecturerId?: string;
    avatarUrl?: string;
}
