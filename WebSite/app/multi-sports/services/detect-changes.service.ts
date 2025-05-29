import { Injectable } from '@angular/core';
import { Match } from "../models";
import * as _ from 'lodash';
import { MatchWaiting } from '../models/match-waiting.model';

@Injectable()
export class DetectChangesService {
    public detect(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.matchId === newMatch.matchId
            && (this.isInfoDifferent(oldMatch, newMatch)
                || this.isScoreDifferent(oldMatch, newMatch)
                || this.isStatusDifferent(oldMatch, newMatch)
                || this.isSuspenderDifferent(oldMatch, newMatch)
                || this.isSettlementDifferent(oldMatch, newMatch));
    }

    private isInfoDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.eventStatus !== newMatch.eventStatus
            || oldMatch.betStatus !== newMatch.betStatus
            || oldMatch.earlySettleStatus !== newMatch.earlySettleStatus
            || !_.isEqual(oldMatch.moreScores, newMatch.moreScores)
            || !_.isEqual(oldMatch.remark, newMatch.remark);
    }

    private isScoreDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.halfTimeHomeScore !== newMatch.halfTimeHomeScore
            || oldMatch.halfTimeAwayScore !== newMatch.halfTimeAwayScore
            || oldMatch.finalHomeScore !== newMatch.finalHomeScore
            || oldMatch.finalAwayScore !== newMatch.finalAwayScore
            || !_.isEqual(oldMatch.confirmHalfTimeScore, newMatch.confirmHalfTimeScore)
            || !_.isEqual(oldMatch.confirmFullTimeScore, newMatch.confirmFullTimeScore);
    }

    private isStatusDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return (
            this.isCalculatingDifferent(oldMatch, newMatch) ||
            this.isCalculatedDifferent(oldMatch, newMatch) ||
            this.isRefundDifferent(oldMatch, newMatch) ||
            this.isTicketDifferent(oldMatch, newMatch) ||
            this.isScoreExternalDifferent(oldMatch, newMatch)
        );
    }

    private isCalculatingDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.isCalculatingSingle !== newMatch.isCalculatingSingle || oldMatch.isCalculatingMP !== newMatch.isCalculatingMP;
    }

    private isCalculatedDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.isCalculated !== newMatch.isCalculated || oldMatch.isMultiCaled !== newMatch.isMultiCaled;
    }

    private isRefundDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.isRefund !== newMatch.isRefund || oldMatch.isCalRefund !== newMatch.isCalRefund;
    }

    private isTicketDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.isExistRunningTicket !== newMatch.isExistRunningTicket || oldMatch.isExistMarkedTicket !== newMatch.isExistMarkedTicket;
    }

    private isScoreExternalDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.isHalfTimeCal !== newMatch.isHalfTimeCal 
            || oldMatch.isNotConsistentExFtScore !== newMatch.isNotConsistentExFtScore 
            || oldMatch.isNotConsistentExHtScore !== newMatch.isNotConsistentExHtScore;
    }

    private isSuspenderDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.suspenderHalfTime !== newMatch.suspenderHalfTime
            || oldMatch.suspenderFullTime !== newMatch.suspenderFullTime
            || oldMatch.autoPayoutStatus !== newMatch.autoPayoutStatus
            || oldMatch.autoInstantStatus !== newMatch.autoInstantStatus;
    }

    private isSettlementDifferent(oldMatch: Match, newMatch: MatchWaiting) {
        return oldMatch.moreScores.halfTimeScore.isSettled !== newMatch.moreScores.halfTimeScore.isSettled
            || oldMatch.moreScores.finalScore.isSettled !== newMatch.moreScores.finalScore.isSettled;
    }
}