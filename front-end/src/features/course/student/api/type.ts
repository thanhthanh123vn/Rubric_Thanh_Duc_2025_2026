export interface Type {
    id?: string;
    userId?: string;
    studentId: string;
    fullName: string;
    email: string;
}
export interface MessageData {
    messageId?: string;
    senderId: string;
    content: string;
    offeringId: string;

}
export interface CreateGroupRequest {
    offeringId: string;
    createdById: string;
    groupName: string;
    topic?: string;
    memberIds: string[];
}


export interface ParticipantResponse {
    id: string;
    userId: string;
    role: string;
}

export interface GroupResponse {
    id: string;
    groupName: string;
    topic: string;
    createdById: string;
    conversationId: string;
    participants: ParticipantResponse[];
}
export interface GroupTaskResponse {
    id: string;
    title: string;
    description: string;
    assigneeId: string | null;
    assignToGroup?: boolean;
    assignerId: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    deadline: string;
    createdAt: string;
}

export interface CreateTaskRequest {
    groupId: string;
    title: string;
    description: string;
    assigneeId?: string;
    assignToGroup?: boolean;
    deadline?: string;
}
export interface AssessmentSubmission {
    assessmentId: string;
    description: string;
    assessmentName: string;
    assessmentType?: string | null;
    fileUrl: string | null;
    weight: number;
    endTime: string;

    submissionId: string | null;
    submissionAt: string | null;

    calculatedScore: number | null;
    lecturerComment: string | null;

    rubricId: string;


    clos: Record<string, string>;

    submittedFileUrl: string | null;
    submittedLink: string | null;
    rubricDetails?: {
        criteriaId: string | null;
        criteriaName: string | null;
        levelId: string | null;
        levelName: string | null;
        score: number | null;
        maxScore: number | null;
    }[];


}
export interface SyllabusFile {
    id: string;
    fileName: string;
    fileUrl: string;
}

export interface Course {
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    description: string;
    department: string;
    syllabusFiles: SyllabusFile[];
}

export interface CourseOfferingResponse {
    offeringId: string;
    offeringName: string;
    course: Course;
    lecturerId: string;
    lecturerName: string;
    semester: string;
    year: string;
    capacity: number | null;
    maxStudents: number;
    startDate: string;
    endDate: string;
    status: string;
}
export interface LecturerOption {
    lecturerId: string;
    fullName: string;
    role: 'TEACHER' | 'MAIN_LECTURER';
    department: string;
}
