import { Injectable } from '@angular/core';
import { Match } from "../../shared/models";
import * as _ from 'lodash';

@Injectable()
export class DetectChangesService {
    public detect(oldMatch: Match, newMatch: Match) {
        return oldMatch.matchId === newMatch.matchId
        && (this.isInfoDifferent(oldMatch, newMatch)
        || this.isScoreDifferent(oldMatch, newMatch)
        || this.isStatusDifferent(oldMatch, newMatch)
        || this.isSuspenderDifferent(oldMatch, newMatch));
    }

    private isInfoDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.eventStatus !== newMatch.eventStatus
        || oldMatch.earlySettleStatus !== newMatch.earlySettleStatus
        || oldMatch.betStatus !== newMatch.betStatus
        //|| !_.isEqual(oldMatch.autoCalcSetting, newMatch.autoCalcSetting)
        || !_.isEqual(oldMatch.remark, newMatch.remark);
    }

    private isScoreDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.halfTimeHomeScore !== newMatch.halfTimeHomeScore
        || oldMatch.halfTimeAwayScore !== newMatch.halfTimeAwayScore
        || oldMatch.finalHomeScore !== newMatch.finalHomeScore
        || oldMatch.finalAwayScore !== newMatch.finalAwayScore;
    }

    private isStatusDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.isCalculatingSingle !== newMatch.isCalculatingSingle
        || oldMatch.isCalculatingMP !== newMatch.isCalculatingMP
        || oldMatch.isCalculated !== newMatch.isCalculated
        || oldMatch.isRefund !== newMatch.isRefund
        || oldMatch.isCalRefund !== newMatch.isCalRefund
        || oldMatch.isHalfTimeCal !== newMatch.isHalfTimeCal
        || oldMatch.isExistMarkedTicketParlay !== newMatch.isExistMarkedTicketParlay
        || oldMatch.isExistRunningTicketParlay !== newMatch.isExistRunningTicketParlay
        || oldMatch.isExistRunningTicket !== newMatch.isExistRunningTicket
        || oldMatch.isExistMarkedTicket !== newMatch.isExistMarkedTicket;
    }

    private isSuspenderDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.suspenderHalfTime !== newMatch.suspenderHalfTime
        || oldMatch.suspenderFullTime !== newMatch.suspenderFullTime
        || oldMatch.autoPayoutStatus !== newMatch.autoPayoutStatus
        || oldMatch.fastMarketStatus !== newMatch.fastMarketStatus;
    }
}