export class ChannelMessage {
    channelId: string;
    content: string;
    createdAt: Date;
    createdBy: string;
    fileUrl: string;
    threadId: string;


    constructor(obj?: any){
        this.channelId = obj ? obj.channelId : '';
        this.content = obj ? obj.content : '';
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.threadId = obj ? obj.threadId : '';
    }

    public toJSON(){
        return {
            channelId: this.channelId,
            content: this.content,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            threadId: this.threadId,
        }
    }

}