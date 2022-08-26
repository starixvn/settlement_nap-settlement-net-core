export class MatchWaitingRequest {
    public matchCode: string;
    public leagueIds: string;
    public sportTypes: string;
    public fromDate: string;
    public toDate: string;

    constructor(leagueIds: string, sportTypes: string, fromDate: string, toDate: string) {
        this.leagueIds = leagueIds;
        this.sportTypes = sportTypes;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}