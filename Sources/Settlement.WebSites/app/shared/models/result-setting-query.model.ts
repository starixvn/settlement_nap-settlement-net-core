export class ResultSettingQuery {
    public matchID: number;
    public type: number;
    public isEnabled: boolean;
    public resourceIds: string;

    constructor(matchId: number, type: number, isEnabled: boolean, resourceIds: string) {
        this.matchID = matchId;
        this.type = type;
        this.isEnabled = isEnabled;
        this.resourceIds = resourceIds;
    }
}