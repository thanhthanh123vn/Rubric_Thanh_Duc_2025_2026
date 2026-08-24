import { courseApi } from "@/services/axiosConfig.ts";

export type AssignmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AssignmentLecturer {
    lecturerId: string;
    lecturerName: string;
}

export interface TeachingAssignmentProposal {
    proposalId: string;
    offeringId: string;
    offeringName: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    department: string;
    semester: string;
    lecturers: AssignmentLecturer[];
    previousLecturers: AssignmentLecturer[];
    requestedBy: string;
    requestedByName: string;
    requestNote?: string;
    status: AssignmentStatus;
    reviewedBy?: string;
    reviewedByName?: string;
    reviewNote?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const teachingAssignmentApi = {
    getAll: async (status = "ALL"): Promise<TeachingAssignmentProposal[]> => {
        const response = await courseApi.get("/teaching-assignments", { params: { status } });
        return Array.isArray(response.data) ? response.data : [];
    },
    create: async (payload: { offeringId: string; lecturerIds: string[]; note?: string }) => {
        const response = await courseApi.post("/teaching-assignments", payload);
        return response.data as TeachingAssignmentProposal;
    },
    update: async (proposalId: string, payload: { offeringId: string; lecturerIds: string[]; note?: string }) => {
        const response = await courseApi.put(`/teaching-assignments/${proposalId}`, payload);
        return response.data as TeachingAssignmentProposal;
    },
    cancel: async (proposalId: string) => {
        const response = await courseApi.delete(`/teaching-assignments/${proposalId}`);
        return response.data as TeachingAssignmentProposal;
    },
    review: async (proposalId: string, action: "APPROVE" | "REJECT", note?: string) => {
        const response = await courseApi.put(`/teaching-assignments/${proposalId}/review`, { action, note });
        return response.data as TeachingAssignmentProposal;
    },
};

export default teachingAssignmentApi;
