export interface StudentProfile {
    studentId: string;
    fullName: string;
    className?: string;
    major?: string;
    cohort?: string;
}

export interface LecturerProfile {
    lecturerId: string;
    fullName: string;
    department?: string;
    academicTitle?: string;
}

export interface LoginResponse {
    fullName: string;
    token: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    userId: string;
    student?: StudentProfile;
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