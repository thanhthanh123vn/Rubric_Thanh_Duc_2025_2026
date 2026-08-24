import { courseApi } from "@/services/axiosConfig.ts";

export type CloPloStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type CloPloSubmissionType = "CLO" | "CLO_PLO_MAPPING";

export interface CloPloWorkflowState {
    submissionId: string | null;
    status: CloPloStatus;
    revisionNumber: number;
    submittedAt?: string | null;
    reviewedByName?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
}

export interface CloPloClo {
    cloId: string;
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    approvalStatus: CloPloStatus;
    submittedAt?: string | null;
    reviewedByName?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    mappedPloIds: string[];
}

export interface CloPloPlo {
    ploId: string;
    ploCode: string;
    description: string;
}

export interface CloPloSubmission {
    submissionId: string | null;
    courseId: string;
    courseCode: string;
    courseName: string;
    mainLecturerName?: string | null;
    submissionType?: CloPloSubmissionType | null;
    status: CloPloStatus;
    revisionNumber: number;
    submittedAt?: string | null;
    reviewedByName?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    cloWorkflow?: CloPloWorkflowState | null;
    mappingWorkflow: CloPloWorkflowState;
    clos: CloPloClo[];
    plos: CloPloPlo[];
}

const cloPloApprovalApi = {
    getCourseProfile: async (courseId: string): Promise<CloPloSubmission> =>
        (await courseApi.get(`/clo-plo-submissions/courses/${courseId}`)).data,
    saveMappings: async (courseId: string, mappings: Record<string, string[]>): Promise<CloPloSubmission> =>
        (await courseApi.put(`/clo-plo-submissions/courses/${courseId}/mappings`, { mappings })).data,
    submitClo: async (cloId: string): Promise<CloPloSubmission> =>
        (await courseApi.post(`/clo-plo-submissions/clos/${cloId}/submit`)).data,
    submitMapping: async (courseId: string): Promise<CloPloSubmission> =>
        (await courseApi.post(`/clo-plo-submissions/courses/${courseId}/submit-mapping`)).data,
    getApprovals: async (status: CloPloStatus): Promise<CloPloSubmission[]> => {
        const response = await courseApi.get("/clo-plo-submissions/approvals", { params: { status } });
        return Array.isArray(response.data) ? response.data : [];
    },
    review: async (submissionId: string, action: "APPROVE" | "REJECT", reason?: string): Promise<CloPloSubmission> =>
        (await courseApi.put(`/clo-plo-submissions/${submissionId}/review`, { action, reason })).data,
};

export default cloPloApprovalApi;
