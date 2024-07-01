import { Remark } from "./remark.model";

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


export type ChangeHoldMatchSettingQuery = {
    matchId: string;
    remark: Remark;
    holdSettings: HoldSetting[];
    orgHoldSettings: HoldSetting[];
};

type HoldSetting = {
    name: string;
    value: any;
    isApplyChild: boolean;
};