export class MatchDetail {
    public matchId: number;
    public leagueId: number;
    public matchCode: string;
    public kickOffTime: string;
    public eventDate: string;
    public eventName: string;
    public eventStatus: string;
    public isYesterdayMatch: boolean;
    public number: string;
}

export class ReCalculationModel {
    public matchDetail: MatchDetail;
    public apiUrl: string;
    constructor(matchDetail: MatchDetail){
        this.matchDetail = matchDetail;
    }
}