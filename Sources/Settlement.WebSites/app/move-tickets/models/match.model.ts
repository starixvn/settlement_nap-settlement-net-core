import { Remark } from "../../shared/models";

export class Match {
    public matchId: number;
    public matchCode: string;
    public kickOffTime: string;
    public homeName: string;
    public awayName: string;
    public leagueName: string;
    public eventStatus: string;
    public remark: Remark;
    public hasChildMatch: boolean;
}