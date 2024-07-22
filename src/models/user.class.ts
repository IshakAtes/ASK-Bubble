export class User {
    email: string;
    name: string;
    password: string;
    status: string;
    avatarUrl: string | undefined | null;
    userId: string;
    logIn: string;
    usedLastTwoEmojis: Array<string>;
    uid: string;

    constructor(obj?: any){
        this.email = obj ? obj.email : '';
        this.name = obj ? obj.name : '';
        this.password = obj ? obj.password : '';
        this.status = obj ? obj.status : '';
        this.avatarUrl = obj ? obj.avatarUrl : '/assets/img/unUsedDefault.png';
        this.userId = obj ? obj.userId : '';
        this.logIn = obj && obj.logIn || 'https://bubble.ishakates.com/';
        this.usedLastTwoEmojis = obj && obj.usedLastTwoEmojis ? obj.usedLastTwoEmojis : [];
        this.uid = obj ? obj.uid : '';
    }

    public toJSON(){
        return {
            email: this.email,
            name: this.name,
            password: this.password,
            status: this.status,
            avatarUrl: this.avatarUrl,
            userId: this.userId,
            logIn: this.logIn,
            usedLastTwoEmojis: this.usedLastTwoEmojis,
            uid: this.uid
        }
    }
}
