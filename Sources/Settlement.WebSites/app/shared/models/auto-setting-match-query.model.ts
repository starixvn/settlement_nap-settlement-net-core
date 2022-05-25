export class AutoSettingMatchQuery {
    matchId: number;
    autoType: number;
    isEnabled: boolean;

    constructor(matchId: number, autoType: number, isEnabled: boolean) {
        this.matchId = matchId;
        this.autoType = autoType;
        this.isEnabled = isEnabled;
    }
}