export class MatchWaitingRequest {
    public leagueIds: string;
    public matchIds: string;
    public fromDate: string;
    public toDate: string;

    constructor(leagueIds: string, matchIds: string, fromDate: string, toDate: string) {
        this.leagueIds = leagueIds;
        this.matchIds = matchIds;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}