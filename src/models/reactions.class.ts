export class Reaction {
    emoji: string;
    userId: string;

    constructor(obj?: any){
        this.emoji = obj ? obj.emoji : '';
        this.userId = obj ? obj.userId : '';
    }

    public toJSON(){
        return {
            emoji: this.emoji,
            userId: this.userId,
        }
    }
}