import { AutoSetting, GoalIcon, Match, MoreScore } from "../../shared/models";

export class CalculationMatch extends Match {
    autoCalcSetting: AutoSetting;
    instantScoreDiff: number;
    instantStatus: string;
    instantStatusId: number;
    instantCalculationType: number;
    isFtCalculated: boolean;
    instantHomeScore: string;
    instantAwayScore: string;
    instantKey: number;
    liveAwayScore: string;
    liveHomeScore: string;
    directWaitingTime: number;
    instantWaitingTime: number;
    goalIcon: GoalIcon;
    childMatchType: number;
    isTraderConfirmFt: boolean;
    isTraderConfirmHt: boolean;
    moreScores: MoreScore;
    enabledAutoRefundMatch: boolean;
    refundWaitingTimeMatch: number;
    isAutoPayoutForMatch: boolean;
    directWaitingTimeMatch: number;
}