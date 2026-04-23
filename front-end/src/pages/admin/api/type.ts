export interface User {
    userId: string;
    studentId : string;
    username?: string;
    avatarUrl?: string;
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
    avatarUrl: string;
    nationality: string;
    cccd: string;
    studentId: string;
    fullName: string;
    className:string
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    address: string;
}export interface ScheduleResponse {
    id: string;
    title: string;
    room: string;
    type: string;
    day: number;
    startHour: number;
    duration: number;
    color: string;
}

export interface ScheduleRequest {
    offeringId: string;
    room: string;
    type: string;
    day: number;
    startTime: string;
    endTime: string;
    color: string;
}

export interface LecturerProfile {
    lecturerId: string;
    userId: string;
    fullName: string;
    email: string;
    department: string;
    academicTitle: string;
}
export interface Course {
    courseId: string;
    courseName: string;
    credits: number;
    description?: string;
    status: string;
}