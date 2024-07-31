export class Thread {
    messageId: string;
    threadId: string;
    threadNameCreator: string;
    threadNameRecipient: string;

    constructor(obj?: any){
        this.messageId = obj ? obj.messageId : '';
        this.threadId = obj ? obj.threadId : '';
        this.threadNameCreator = obj ? obj.threadNameCreator : '';
        this.threadNameRecipient = obj ? obj.threadNameRecipient : '';
    }

    public toJSON(){
        return {
            messageId: this.messageId,
            threadId: this.threadId,
            threadNameCreator: this.threadNameCreator,
            threadNameRecipient: this.threadNameRecipient,
        }
    }
}