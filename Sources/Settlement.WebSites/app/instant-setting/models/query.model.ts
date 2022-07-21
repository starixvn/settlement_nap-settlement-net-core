export class TimeSettingQuery {
    leagueId: number;
    waitingTime: number;
    autoType: number;

    constructor(leagueId: number, waitingTime: number, autoType: number) {
        this.leagueId = leagueId;
        this.waitingTime = waitingTime;
        this.autoType = autoType;
    }
}