import { AutoSettleType } from "../../../shared/constants/auto-settle-type.native";
import { TypeObject } from "../../../shared/constants/type-object.native";

export interface ResultSetting {
    settleType: AutoSettleType, 
    autoFunction: "Auto Payout" | "Direct Payout" | "Auto Refund",
    enabled: boolean,
    waitingTime: number,
    isApplyChildMatches: boolean
}


export type UpdateSettleSettings = {
    leagueId: number;
    matchId: number | null;
    typeObject: TypeObject
    isApplyAll: boolean;
    resultSettings: ResultSetting[];
    oldResultSettings: ResultSetting[];
}