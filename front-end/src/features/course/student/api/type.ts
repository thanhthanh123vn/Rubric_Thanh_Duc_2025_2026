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