import { BetDaq, BetFair, HedgeMatchDetail, MatchDetail } from "./match.model";
import * as _ from 'lodash';
import { CalculateAction } from "../../../../shared/constants";
export class RefundQuery {
    public matchId: number;
    public hedgeMatchId: number;
    public isApplyHedging: boolean;
    public actionName: string;
    public goalRecord: string;
    public halfTimeHomeScore: string;
    public halfTimeAwayScore: string;
    public finalHomeScore: string;
    public finalAwayScore: string;
    public isSettleAbandonedMatchBetDaq: boolean;
    public isSettleAbandonedMatchBetFair: boolean;
    public isSettleAbandonedMatchIBC: boolean;
    public excludeTicketBetDaqInRefund: boolean;
    public excludeTicketBetFairInRefund: boolean;
    public isExistFgLg: boolean;
    public isExistHtFgLg: boolean;
    public isDeterminedHedgeMatch: boolean;
    public isEnabledGoalRecordFt: boolean;
    public isEnabledGoalRecordHt: boolean;

    constructor(matchDetail: MatchDetail, hedgeMatch: HedgeMatchDetail, actionName: string,
         betDaq: BetDaq, betFair: BetFair, isDeterminedHedgeMatch: boolean) {
        this.matchId = matchDetail.matchId;
        this.isApplyHedging = !_.isNull(hedgeMatch);
        this.hedgeMatchId = this.isApplyHedging ? hedgeMatch.matchId : 0;
        this.actionName = actionName;
        this.goalRecord = matchDetail.isSettleAbandonedMatchIBC ?
            (matchDetail.applyGoalRecord ? matchDetail.goalRecord : matchDetail.originalGoalRecord) : '';
        this.halfTimeHomeScore = matchDetail.halfTimeHomeScore;
        this.halfTimeAwayScore = matchDetail.halfTimeAwayScore;
        this.finalHomeScore = matchDetail.finalHomeScore;
        this.finalAwayScore = matchDetail.finalAwayScore;
        this.isSettleAbandonedMatchBetFair = _.isEqual(actionName, CalculateAction.refundHalfTime) ?
            false : betFair.settleDeterminedBetFair;
        this.isSettleAbandonedMatchBetDaq = _.isEqual(actionName, CalculateAction.refundHalfTime) ?
            false : betDaq.settleDeterminedBetDaq;
        this.isSettleAbandonedMatchIBC = matchDetail.isSettleAbandonedMatchIBC;
        this.excludeTicketBetDaqInRefund = betDaq.excludeTicketsInRefund;
        this.excludeTicketBetFairInRefund = betFair.excludeTicketsInRefund;
        this.isExistFgLg = matchDetail.isExistFgLg;
        this.isExistHtFgLg = matchDetail.isExistHtFgLg;
        this.isDeterminedHedgeMatch = this.isApplyHedging ? isDeterminedHedgeMatch : false;
        this.isEnabledGoalRecordFt = matchDetail.isEnabledGoalRecordFt;
        this.isEnabledGoalRecordHt = matchDetail.isEnabledGoalRecordHt;
    }
}