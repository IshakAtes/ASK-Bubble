export class Thread {
    emoji: string;
    userId: string;
    messageId: string;
    reactionId: string;

    constructor(obj?: any){
        this.emoji = obj ? obj.emoji : '';
        this.userId = obj ? obj.userId : '';
        this.messageId = obj ? obj.messageId : '';
        this.reactionId = obj ? obj.reactionId : '';
    }

    public toJSON(){
        return {
            emoji: this.emoji,
            userId: this.userId,
            messageId: this.messageId,
            reactionId: this.reactionId,
        }
    }
}