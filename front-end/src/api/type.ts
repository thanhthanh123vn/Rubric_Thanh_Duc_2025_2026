export interface SubmissionDTO {
    id: string;
    assessmentId: string;
    studentId: string;
    rubricId:string;
    fileUrl: string | null;
    submittedLink?: string | null;
    submittedAt: string;
    status: string;
}

export interface SubmissionStatusDTO {
    id: string;
    assessmentId: string;
    studentId: string;
    rubricId?: string | null;
    fileUrl: string | null;
    submittedLink?: string | null;
    submittedAt?: string | null;
    status: string;
    submitted: boolean;
}

export interface SyllabusFile {
    id: string;
    fileName: string;
    fileUrl: string;
}


export interface CourseResponse {
    id: string;
    courseCode: string;
    courseName: string;

    syllabusFiles?: SyllabusFile[];
}
export interface PostRequest {
    offeringId: string;
    title:string;
    content: string;
    fileIds: string[];
}

export interface PostResponse {
    id: string;
    offeringId: string;
    authorId: string;
    content: string;
    title:string;
    createdAt: string;
    authorName?: string;
    files:SyllabusFile[];
}
