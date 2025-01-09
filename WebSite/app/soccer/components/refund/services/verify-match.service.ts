import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { BetStatus } from "../../../constants";
import { EventStatus, SettlementStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { MatchDetail } from "../model/match.model";
import { ResourceIds } from "../../../constants/resourceIds.native";
import { MainRefundButtonStatus, SubRefundAllButtonStatus, SubRefundFTButtonStatus } from "../model/button-status.model";
import { VerificationBaseService } from "../../../services/verification-base.service";

@Injectable()
export class VerifyMatchService extends VerificationBaseService {
    public setDisableRefund(matchDetail: MatchDetail, resultDetails: ResultDetail[]) {
        const halfTimeStatusId = (_.find(resultDetails, item => item.resourceId === ResourceIds.halfTime) ??
            new ResultDetail()).settlementStatusId;
        const fullTimeStatusId = (_.find(resultDetails, item => item.resourceId === ResourceIds.fullTime) ??
            new ResultDetail()).settlementStatusId;
        const betStatus = (matchDetail.betStatus ?? "").toLowerCase();

        if (this.isRefundFulltime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
            return new MainRefundButtonStatus(true, false, true);
        } else if (this.isRefundAll(betStatus, halfTimeStatusId, fullTimeStatusId)) {
            return new MainRefundButtonStatus(true, true, false);
        } else if (this.isRefundHalfTime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
            return new MainRefundButtonStatus(false, false, true);
        } else if (this.isRefundHalfTimeAndFullTimeCalculated(betStatus, halfTimeStatusId, fullTimeStatusId)) {
            return new MainRefundButtonStatus(false, true, true);
        } else if (this.isRefundHalftimeFullTime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
            return new MainRefundButtonStatus(false, false, true);
        } else if (matchDetail.isCalculated) {
            return new MainRefundButtonStatus(true, true, true);
        } else {
            return new MainRefundButtonStatus(false, false, false);
        }
    }

    private isRefundFulltime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
        return _.isEqual(halfTimeStatusId, SettlementStatusId.Calculated) &&
            ((_.includes(betStatus, BetStatus.abandoned2H) && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H))
                || (_.includes(betStatus, BetStatus.refundFT) && _.isEqual(fullTimeStatusId, SettlementStatusId.RefundFullTime)));
    }

    private isRefundAll(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
        return (_.includes(betStatus, `${BetStatus.refunded};`) && _.isEqual(halfTimeStatusId, SettlementStatusId.Refund)
            && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund))
            || (_.includes(betStatus, BetStatus.abandoned1H)
                && _.isEqual(halfTimeStatusId, SettlementStatusId.Abandoned1H)
                && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned1H));
    }

    private isRefundHalfTime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
        return _.includes(betStatus, BetStatus.refundHT)
            && _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
            && _.isEqual(fullTimeStatusId, SettlementStatusId.Running);
    }

    private isRefundHalfTimeAndFullTimeCalculated(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
        return _.includes(betStatus, BetStatus.refundHT)
            && _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
            && _.isEqual(fullTimeStatusId, SettlementStatusId.Calculated);
    }

    private isRefundHalftimeFullTime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
        return _.includes(betStatus, `${BetStatus.refunded};`) &&
            ((_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime) && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H))
            || (_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime) && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund)));
    }

    public setDisableSubRefundFT(halfTimeStatusId: number, fullTimeStatusId: number) {
        if (this.isRefundAllPos(halfTimeStatusId, fullTimeStatusId)) {
            return new SubRefundFTButtonStatus(true, false);
        } else if (this.isRefundAllSus(halfTimeStatusId, fullTimeStatusId)) {
            return new SubRefundFTButtonStatus(false, true);
        } else {
            return new SubRefundFTButtonStatus(false, false);
        }
    }

    private isRefundAllPos(halfTimeStatusId: number, fullTimeStatusId: number) {
        return (_.isEqual(halfTimeStatusId, SettlementStatusId.Calculated)
            && _.isEqual(fullTimeStatusId, SettlementStatusId.RefundFullTime))
            || (_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
                && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund));
    }

    private isRefundAllSus(halfTimeStatusId: number, fullTimeStatusId: number) {
        return _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H) &&
            (_.isEqual(halfTimeStatusId, SettlementStatusId.Calculated)
                || _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime));
    }

    public setDisableSubRefundAll(halfTimeStatusId: number, fullTimeStatusId: number) {
        if (_.isEqual(halfTimeStatusId, SettlementStatusId.Refund) && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund)) {
            return new SubRefundAllButtonStatus(false, true);
        } else if (_.isEqual(halfTimeStatusId, SettlementStatusId.Abandoned1H) &&
            _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned1H)) {
            return new SubRefundAllButtonStatus(true, false);
        } else {
            return new SubRefundAllButtonStatus(false, false);
        }
    }

    public validateScoreFullTime(matchDetail: MatchDetail) {
        matchDetail.isWarningFinalAwayScore = this.isEmptyScore(matchDetail.finalAwayScore);
        matchDetail.isWarningFinalHomeScore = this.isEmptyScore(matchDetail.finalHomeScore);
        return matchDetail.isWarningFinalAwayScore || matchDetail.isWarningFinalHomeScore;
    }

    public validateScoreHalfTime(matchDetail: MatchDetail) {
        matchDetail.isWarningHalfTimeAwayScore = this.isEmptyScore(matchDetail.halfTimeAwayScore);
        matchDetail.isWarningHalfTimeHomeScore = this.isEmptyScore(matchDetail.halfTimeHomeScore);
        return matchDetail.isWarningHalfTimeAwayScore || matchDetail.isWarningHalfTimeHomeScore;
    }

    public isRefundHalfTimeBetStatus(matchDetail: MatchDetail) {
        return !_.isNil(matchDetail.betStatus) &&
            (_.includes(matchDetail.betStatus, `${EventStatus.refundHalftime};`) || _.includes(matchDetail.betStatus, `${EventStatus.refund};`));
    }
}