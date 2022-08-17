export class Result {
    public errCode: number;
    public errMsg: string;
    public resultCommand: ResultCommand[];
    public isSuccessful: boolean;
    public childMatchIds: string;
}

export class ResultCommand {
    public siteDbGroupId: number;
    public serviceCommand: string;
}