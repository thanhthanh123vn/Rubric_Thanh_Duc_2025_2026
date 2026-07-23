import axios from 'axios';
import {courseApi} from "@/services/axiosConfig.ts";

// Định nghĩa kiểu dữ liệu trả về từ Backend
export interface StudentScheduleResponse {
    scheduleId: string;
    offeringId: string;
    offeringName: string;
    courseName: string;
    room: string;
    classType: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    colorTheme: string;
}



export const courseScheduleApi = {
    // API lấy lịch học theo mã sinh viên
    getStudentSchedule: async (): Promise<StudentScheduleResponse[]> => {
        try {
            const response = await courseApi.get(`/course-schedules/student`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy lịch học:", error);
            throw error;
        }
    }
};