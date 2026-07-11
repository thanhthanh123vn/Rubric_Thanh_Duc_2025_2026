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
  browserId: string;
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
  browserId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  suspicious: boolean | null;
  suspiciousReason: string | null;
  note: string;
};

export type AttendanceLegendResponse = {
  legendId: string;
  offeringId: string;
  legendLabel: string;
  colorHex: string;
};

export type AttendanceOverviewDateResponse = {
  sessionId: string;
  attendanceId: string | null;
  attendanceDate: string;
  status: string;
  category: string;
  displayText: string;
  note: string | null;
  colorHex: string | null;
  legendLabel: string | null;
};

export type AttendanceStudentOverviewResponse = {
  studentId: string;
  studentName: string;
  email: string | null;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  resultStatus: string;
  attendanceDates: AttendanceOverviewDateResponse[];
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
  async getAttendanceOverviewByOffering(offeringId: string) {
    const response = await courseApi.get<AttendanceStudentOverviewResponse[]>(
      `/attendance-sessions/offering/${offeringId}/overview`,
    );
    return response.data;
  },
  async updateAttendanceOverviewCell(
    offeringId: string,
    payload: {
      studentId: string;
      sessionId: string;
      status: "PRESENT" | "ABSENT";
      note: string;
      category: string;
      colorHex?: string | null;
      legendLabel?: string | null;
    },
  ) {
    const response = await courseApi.put<AttendanceOverviewDateResponse>(
      `/attendance-sessions/offering/${offeringId}/overview/cell`,
      payload,
    );
    return response.data;
  },
  async getAttendanceLegendsByOffering(offeringId: string) {
    const response = await courseApi.get<AttendanceLegendResponse[]>(
      `/attendance-sessions/offering/${offeringId}/overview/legends`,
    );
    return response.data;
  },
  async upsertAttendanceLegend(
    offeringId: string,
    payload: {
      legendId?: string | null;
      legendLabel: string;
      colorHex: string;
    },
  ) {
    const response = await courseApi.put<AttendanceLegendResponse>(
      `/attendance-sessions/offering/${offeringId}/overview/legend`,
      payload,
    );
    return response.data;
  },
  async getAttendanceRecordsBySession(sessionId: string) {
    const response = await courseApi.get<AttendanceStudentResponse[]>(
      `/attendance-sessions/${sessionId}/records`,
    );
    return response.data;
  },
  async updateAttendanceStatus(
    sessionId: string,
    attendanceId: string,
    status: "PRESENT" | "ABSENT",
  ) {
    const response = await courseApi.put<AttendanceStudentResponse>(
      `/attendance-sessions/${sessionId}/records/${attendanceId}/status?status=${status}`,
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
