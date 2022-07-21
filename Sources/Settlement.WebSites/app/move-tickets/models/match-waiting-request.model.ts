export class MatchWaitingRequest {
    public matchCode: string;
    public leagueIds: string;
    public fromDate: string;
    public toDate: string;

    constructor(matchCode: string, leagueIds: string, fromDate: string, toDate: string) {
        this.matchCode = matchCode;
        this.leagueIds = leagueIds;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}