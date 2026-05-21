export interface SubmissionDTO {
    id: string;
    assessmentId: string;
    studentId: string;
    rubricId:string;
    fileUrl: string;
    submittedAt: string;
    status: string;
}