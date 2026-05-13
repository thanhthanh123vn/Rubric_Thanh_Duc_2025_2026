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
    assigneeId: string;
    assignerId: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    deadline: string;
    createdAt: string;
}

export interface CreateTaskRequest {
    groupId: string;
    title: string;
    description: string;
    assigneeId: string;
    deadline?: string;
}