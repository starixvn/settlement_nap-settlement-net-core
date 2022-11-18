export class MatchWaitingRequest {
    public leagueIds: string;
    public matchIds: string;
    public fromDate: string;
    public toDate: string;
    public overStatus: string;
    public matchCode: string;

    constructor(leagueIds: string, matchIds: string, fromDate: string, toDate: string, overStatus: string, matchCode: string) {
        this.leagueIds = leagueIds;
        this.matchIds = matchIds;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.overStatus = overStatus;
        this.matchCode = matchCode;
    }
}