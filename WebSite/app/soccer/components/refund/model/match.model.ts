import { GoalIcon, MatchDetailBase, ResultDetail } from "../../../models";
import { Permission } from "../../../../shared/models/sportsbook-sop/permission.model";

export interface Match {
    matchDetail: MatchDetail;
    permission: Permission;
    resultDetails: ResultDetail[];
    hedgeMatchDetail: HedgeMatchDetail;
    betDaq: BetDaq;
    betFair: BetFair;
}

export interface BetDaq {
    isMoveBetDaq: boolean;
    isExcludeBetDaq: boolean;
    isSettleAbandonedMatchBetDaq: boolean;
    isRefundRunningBetDaq: boolean;
    excludeTicketsInRefund: boolean;
    settleDeterminedBetDaq: boolean;
}

export interface BetFair {
    isMoveBetFair: boolean;
    isExcludeBetFair: boolean;
    isSettleAbandonedMatchBetFair: boolean;
    isRefundRunningBetFair: boolean;
    excludeTicketsInRefund: boolean;
    settleDeterminedBetFair: boolean;
}

export interface HedgeMatchDetail {
    matchId: number;
    matchCode: string;
    isDeterminedHedgeMatch: boolean;
    isUndecided: boolean;
}

export interface MatchDetail extends MatchDetailBase{
    isCalRefund: boolean;
    isSettleAbandonedMatchIBC: boolean;
    applyHedgeMatch: boolean;
}

export interface MatchMoveBet {
    matchId: number;
    matchCode: string;
    eventDate: string;
}
