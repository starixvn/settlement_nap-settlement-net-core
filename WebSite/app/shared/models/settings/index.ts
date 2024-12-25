import { AutoSettleType } from "../../constants/auto-settle-type.native";
import { TypeObject } from "../../constants/type-object.native";


export interface ResultSetting {
    settleType: AutoSettleType,
    settleTypeName: "Auto Payout" | "Direct Payout" | "Auto Refund",
    enabled: boolean,
    waitingTime: number,
    isApplyChildMatches: boolean
}

export type AutoSettleSettingRequest = {
    leagueId: number;
    matchId: number | null;
    typeObject: TypeObject
    resultSettings: ResultSetting[];
    oldResultSettings: ResultSetting[];
}