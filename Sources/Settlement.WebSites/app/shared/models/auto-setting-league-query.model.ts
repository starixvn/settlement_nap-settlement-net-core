export class AutoSettingLeagueQuery {
    leagueId: number;
    autoType: number;
    isEnabled: boolean;
    isApplyAll: boolean;

    constructor(leagueId: number, autoType: number, isEnabled: boolean, isApplyAll: boolean) {
        this.leagueId = leagueId;
        this.autoType = autoType;
        this.isEnabled = isEnabled;
        this.isApplyAll = isApplyAll;
    }
}