export class GetChildMatchesRequest {
    public matchIds: string;
    public mode: string;

    constructor(matchIds: string) {
        this.matchIds = matchIds.toString();
        this.mode = "CAL-MP";
    }
}