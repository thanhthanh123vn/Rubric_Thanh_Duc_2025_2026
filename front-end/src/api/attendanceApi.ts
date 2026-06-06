import { courseApi } from "@/services/axiosConfig.ts";

export type CreateAttendanceSessionPayload = {
  offeringId: string;
  attendanceDate: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  radius: number;
};

export type AttendanceSessionResponse = {
  sessionId: string;
  offeringId: string;
  qrToken: string;
  qrContent: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type StudentAttendanceCheckInPayload = {
  qrContent: string;
  latitude: number;
  longitude: number;
};

export type AttendanceCheckInResponse = {
  attendanceId: string;
  sessionId: string;
  offeringId: string;
  studentId: string;
  status: string;
  method: string;
  studyDate: string;
  checkinTime: string;
  note: string;
  message: string;
};

export type AttendanceHistoryResponse = {
  attendanceId: string;
  sessionId: string;
  studyDate: string;
  status: string;
  method: string | null;
  checkinTime: string | null;
  note: string;
};

export type AttendanceSessionSummaryResponse = {
  sessionId: string;
  offeringId: string;
  attendanceDate: string;
  startTime: string;
  endTime: string;
  status: string;
  checkedInCount: number;
};

export type AttendanceStudentResponse = {
  attendanceId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  email: string | null;
  status: string;
  method: string | null;
  checkinTime: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  sessionRadius: number | null;
  suspicious: boolean | null;
  suspiciousReason: string | null;
  note: string;
};

type ApiErrorResponse = {
  message?: string;
};

export const attendanceApi = {
  async createAttendanceSession(payload: CreateAttendanceSessionPayload) {
    const response = await courseApi.post<AttendanceSessionResponse>(
      "/attendance-sessions",
      payload,
    );
    return response.data;
  },
  async checkInByQr(payload: StudentAttendanceCheckInPayload) {
    const response = await courseApi.post<AttendanceCheckInResponse>(
      "/attendance/check-in",
      payload,
    );
    return response.data;
  },
  async getMyAttendanceHistory(offeringId: string) {
    const response = await courseApi.get<AttendanceHistoryResponse[]>(
      `/attendance/offering/${offeringId}/me`,
    );
    return response.data;
  },
  async getAttendanceSessionsByOffering(offeringId: string) {
    const response = await courseApi.get<AttendanceSessionSummaryResponse[]>(
      `/attendance-sessions/offering/${offeringId}`,
    );
    return response.data;
  },
  async getActiveAttendanceSession(offeringId: string) {
    const response = await courseApi.get<AttendanceSessionResponse>(
      `/attendance-sessions/offering/${offeringId}/active`,
    );
    return response.data;
  },
  async getAttendanceRecordsBySession(sessionId: string) {
    const response = await courseApi.get<AttendanceStudentResponse[]>(
      `/attendance-sessions/${sessionId}/records`,
    );
    return response.data;
  },
};

export function getAttendanceErrorMessage(error: unknown) {
  const fallbackMessage = "Khong the tao phien diem danh QR. Vui long thu lai.";

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as ApiErrorResponse;
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
