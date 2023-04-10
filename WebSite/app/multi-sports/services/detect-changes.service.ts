import { Injectable } from '@angular/core';
import { Match } from "../models";
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
            || oldMatch.betStatus !== newMatch.betStatus
            || oldMatch.earlySettleStatus !== newMatch.earlySettleStatus
            || !_.isEqual(oldMatch.moreScores, newMatch.moreScores)
            || !_.isEqual(oldMatch.remark, newMatch.remark);
    }

    private isScoreDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.halfTimeHomeScore !== newMatch.halfTimeHomeScore
            || oldMatch.halfTimeAwayScore !== newMatch.halfTimeAwayScore
            || oldMatch.finalHomeScore !== newMatch.finalHomeScore
            || oldMatch.finalAwayScore !== newMatch.finalAwayScore
            || !_.isEqual(oldMatch.confirmHalfTimeScore, newMatch.confirmHalfTimeScore)
            || !_.isEqual(oldMatch.confirmFullTimeScore, newMatch.confirmFullTimeScore);
    }

    private isStatusDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.isCalculatingSingle !== newMatch.isCalculatingSingle
            || oldMatch.isCalculatingMP !== newMatch.isCalculatingMP
            || oldMatch.isCalculated !== newMatch.isCalculated
            || oldMatch.isMultiCaled !== newMatch.isMultiCaled
            || oldMatch.isRefund !== newMatch.isRefund
            || oldMatch.isCalRefund !== newMatch.isCalRefund
            || oldMatch.isExistRunningTicket !== newMatch.isExistRunningTicket
            || oldMatch.isExistMarkedTicket !== newMatch.isExistMarkedTicket
            || oldMatch.isHalfTimeCal !== newMatch.isHalfTimeCal
            || oldMatch.isNotConsistentExFtScore !== newMatch.isNotConsistentExFtScore
            || oldMatch.isNotConsistentExHtScore !== newMatch.isNotConsistentExHtScore;
    }

    private isSuspenderDifferent(oldMatch: Match, newMatch: Match) {
        return oldMatch.suspenderHalfTime !== newMatch.suspenderHalfTime
            || oldMatch.suspenderFullTime !== newMatch.suspenderFullTime
            || oldMatch.autoPayoutStatus !== newMatch.autoPayoutStatus;
    }
}