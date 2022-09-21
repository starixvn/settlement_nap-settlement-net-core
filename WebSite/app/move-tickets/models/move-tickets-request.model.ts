export class MoveTicketsRequest {
    public matchId: string;

    constructor(matchId: string) {
        this.matchId = matchId.toString();
    }
}