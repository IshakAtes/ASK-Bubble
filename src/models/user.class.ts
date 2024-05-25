export class User {
    email: string;
    name: string;
    password: string;
    status: string;
    avatarUrl: string;


    constructor(obj?: any){
        this.email = obj ? obj.email : '';
        this.name = obj ? obj.name : '';
        this.password = obj ? obj.password : '';
        this.status = obj ? obj.status : '';
        this.avatarUrl = obj ? obj.avatarUrl : '';
    }

    public toJSON(){
        return {
            email: this.email,
            name: this.name,
            password: this.password,
            status: this.status,
            avatarUrl: this.avatarUrl,
        }
    }

}