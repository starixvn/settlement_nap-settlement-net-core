import { Injectable } from "@angular/core";
import { CalculateAction } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { BetDaq, BetFair, Match, MatchDetail } from "../model/match.model";
import { VerifyMatchService } from "./verify-match.service";
import * as _ from "lodash";

@Injectable()
export class VerifyActionService {
    constructor(
        private readonly verifyMatchService: VerifyMatchService) { }
    public createContentSpecificBetTypes(betDaq: BetDaq, betFair: BetFair) {
        if (betDaq.settleDeterminedBetDaq && betFair.settleDeterminedBetFair) {
            return `${Language.specificBetType.betDaq} and ${Language.specificBetType.betFair}`;
        } else if (betDaq.settleDeterminedBetDaq) {
            return Language.specificBetType.betDaq;
        } else if (betFair.settleDeterminedBetFair) {
            return Language.specificBetType.betFair;
        } else {
            return "";
        }
    }

    public verifyFulltime(matchDetail: MatchDetail) {
        if (this.verifyMatchService.validateScoreFullTime(matchDetail)) {
            return Language.warningInputScore;
        } else if (this.verifyMatchService.goalRecordExistSemicolon(matchDetail) &&
            this.verifyMatchService.isRefundHalfTimeBetStatus(matchDetail)) {
            return Language.soccer.noNeedSemicolonOnGoalRecord;
        } else if (!this.verifyMatchService.isRefundHalfTimeBetStatus(matchDetail)
            && this.verifyMatchService.goalRecordNotExistSemicolon(matchDetail)) {
            return Language.soccer.needSemicolonOnGoalRecord;
        } else if (this.verifyMatchService.isFullTimeGoalRecordInvalid(matchDetail)) {
            matchDetail.isWarningGoalRecord = true;
            return Language.soccer.goalRecordNotConsistent;
        } else if (matchDetail.applyGoalRecord && this.verifyMatchService.isHTGoalRecordConsistent(matchDetail)) {
            return Language.soccer.halfTimeGoalRecordNotConsistent;
        }else if (matchDetail.isScoreInconsistent) {
            return Language.soccer.confirmWithInconsistentScore;
        } else {
            return "";
        }
    }

    public verifyAll(matchDetail: MatchDetail) {
        if (this.verifyMatchService.validateScoreHalfTime(matchDetail)) {
            return Language.warningInputScore;
        } else if (this.verifyMatchService.goalRecordExistSemicolon(matchDetail)) {
            return Language.soccer.noNeedSemicolonOnGoalRecord;
        } else if (matchDetail.applyGoalRecord && this.verifyMatchService.isHtGoalRecordInvalid(matchDetail)) {
            return Language.soccer.halfTimeGoalRecordNotConsistent;
        }else if (matchDetail.isScoreInconsistent) {
            return Language.soccer.confirmWithInconsistentScore;
        } else {
            return "";
        }
    }

    public getMessageConfirm(actionName: string, match: Match) {
        const isAbandonedMatch = match.matchDetail.isSettleAbandonedMatchIBC || match.betDaq.settleDeterminedBetDaq ||
            match.betFair.settleDeterminedBetFair;
        if (_.isEqual(actionName, CalculateAction.refund)) {
            return isAbandonedMatch ? Language.soccer.refundAllAbandoned : Language.soccer.refundAllNormal;
        } else {
            return isAbandonedMatch ? Language.soccer.refundFullTimeAbandoned : Language.soccer.refundFullTimeNormalNotSdt;
        }
    }
}