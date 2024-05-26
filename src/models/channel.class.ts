export class Channel {
    createdAt: Date;
    createdBy: string;
    description: string;
    members: Array<string>;
    name: string;


    constructor(obj?: any){
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.description = obj ? obj.description : '';
        this.members = obj ? obj.members : '';
        this.name = obj ? obj.name : '';
    }

    public toJSON(){
        return {
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            description: this.description,
            members: this.members,
            name: this.name,
        }
    }

}