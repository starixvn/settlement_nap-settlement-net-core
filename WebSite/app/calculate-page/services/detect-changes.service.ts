import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { CalculationMatch } from '../models';

@Injectable()
export class DetectChangesService {
    public detect(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return oldMatch.matchId === newMatch.matchId
            && (this.isInfoDifferent(oldMatch, newMatch)
                || this.isScoreDifferent(oldMatch, newMatch)
                || this.isStatusDifferent(oldMatch, newMatch)
                || this.isSuspenderDifferent(oldMatch, newMatch));
    }

    private isInfoDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.eventStatus, newMatch.eventStatus)
            || !_.isEqual(oldMatch.earlySettleStatus, newMatch.earlySettleStatus)
            || !_.isEqual(oldMatch.betStatus, newMatch.betStatus)
            //|| !_.isEqual(oldMatch.autoCalcSetting, newMatch.autoCalcSetting)
            || !_.isEqual(oldMatch.remark, newMatch.remark)
            || !_.isEqual(oldMatch.goalIcon, newMatch.goalIcon);
    }

    private isScoreDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.halfTimeHomeScore, newMatch.halfTimeHomeScore)
            || !_.isEqual(oldMatch.halfTimeAwayScore, newMatch.halfTimeAwayScore)
            || !_.isEqual(oldMatch.finalHomeScore, newMatch.finalHomeScore)
            || !_.isEqual(oldMatch.finalAwayScore, newMatch.finalAwayScore);
    }

    private isStatusDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.isCalculatingSingle, newMatch.isCalculatingSingle)
            || !_.isEqual(oldMatch.isCalculatingMP, newMatch.isCalculatingMP)
            || !_.isEqual(oldMatch.isCalculated, newMatch.isCalculated)
            || !_.isEqual(oldMatch.isRefund, newMatch.isRefund)
            || !_.isEqual(oldMatch.isCalRefund, newMatch.isCalRefund)
            || !_.isEqual(oldMatch.isHalfTimeCal, newMatch.isHalfTimeCal)
            || !_.isEqual(oldMatch.isExistRunningTicket, newMatch.isExistRunningTicket)
            || !_.isEqual(oldMatch.isExistMarkedTicket, newMatch.isExistMarkedTicket)
            || oldMatch.isNotConsistentExFtScore !== newMatch.isNotConsistentExFtScore
            || oldMatch.isNotConsistentExHtScore !== newMatch.isNotConsistentExHtScore;
    }

    private isSuspenderDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.suspenderHalfTime, newMatch.suspenderHalfTime)
            || !_.isEqual(oldMatch.suspenderFullTime, newMatch.suspenderFullTime)
            || !_.isEqual(oldMatch.autoPayoutStatus, newMatch.autoPayoutStatus)
            || !_.isEqual(oldMatch.fastMarketStatus, newMatch.fastMarketStatus);
    }

    public detectDiffAutoCalculationMatch(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return oldMatch.matchId === newMatch.matchId
            && (this.isStatusAutoCalculationDifferent(oldMatch, newMatch)
            || this.isScoreAndTimeDifferent(oldMatch, newMatch));
    }

    private isScoreAndTimeDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.instantHomeScore, newMatch.instantHomeScore)
            || !_.isEqual(oldMatch.instantAwayScore, newMatch.instantAwayScore)
            || !_.isEqual(oldMatch.liveAwayScore, newMatch.liveAwayScore)
            || !_.isEqual(oldMatch.liveHomeScore, newMatch.liveHomeScore)
            || !_.isEqual(oldMatch.directWaitingTime, newMatch.directWaitingTime)
            || !_.isEqual(oldMatch.instantWaitingTime, newMatch.instantWaitingTime)
            || !_.isEqual(oldMatch.confirmHalfTimeScore, newMatch.confirmHalfTimeScore)
            ||!_.isEqual(oldMatch.confirmFullTimeScore, newMatch.confirmFullTimeScore)
            || !_.isEqual(oldMatch.isTraderConfirmHt, newMatch.isTraderConfirmHt)
            || !_.isEqual(oldMatch.isTraderConfirmFt, newMatch.isTraderConfirmFt);
    }

    private isStatusAutoCalculationDifferent(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
        return !_.isEqual(oldMatch.autoCalcSetting, newMatch.autoCalcSetting)
        || !_.isEqual(oldMatch.instantScoreDiff, newMatch.instantScoreDiff)
        || !_.isEqual(oldMatch.instantStatus, newMatch.instantStatus)
        || !_.isEqual(oldMatch.instantStatusId, newMatch.instantStatusId)
        || !_.isEqual(oldMatch.instantCalculationType, newMatch.instantCalculationType)
        || !_.isEqual(oldMatch.isFtCalculated, newMatch.isFtCalculated)
        || !_.isEqual(oldMatch.instantKey, newMatch.instantKey)
        || !_.isEqual(oldMatch.referenceActions, newMatch.referenceActions);
    }
}