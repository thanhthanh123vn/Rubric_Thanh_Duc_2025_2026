export interface Type {
    id: string;
    fullName: string;
    email: string;
}
export interface MessageData {
    messageId?: string;
    senderId: string;
    content: string;

}