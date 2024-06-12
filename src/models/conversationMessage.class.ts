import { Timestamp } from "firebase/firestore";

export class ConversationMessage {
    conversationId: string;
    content: string;
    createdAt: any;
    createdBy: string;
    fileUrl: string;
    threadId: string;
    messageId: string;


    constructor(obj?: any){
        this.conversationId = obj ? obj.conversationId : '';
        this.content = obj ? obj.content : '';
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.threadId = obj ? obj.threadId : '';
        this.messageId = obj ? obj.messageId : '';
    }

    public toJSON(){
        return {
            conversationId: this.conversationId,
            content: this.content,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            threadId: this.threadId,
            messageId: this.messageId,
        }
    }

}