export interface User {
    userId: string;
    studentId : string;
    username?: string;
    fullName: string;
    email?: string;
    role: string;
    authProvider?: string;
}
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface StudentProfile {
    studentId: string;
    fullName: string;
    className:string
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    address: string;
}

