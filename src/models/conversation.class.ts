export class Conversation {
    conversationId: string;
    conversationName: string;
    createdBy: string;
    fileUrl: string;
    recipientId: string;
    


    constructor(obj?: any){
        this.conversationId = obj ? obj.conversationId : '';
        this.conversationName = obj ? obj.conversationName : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.recipientId = obj ? obj.recipientId : '';
       
    }

    public toJSON(){
        return {
            conversationId: this.conversationId,
            conversationName: this.conversationName,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            recipientId: this.recipientId,
        }
    }

}