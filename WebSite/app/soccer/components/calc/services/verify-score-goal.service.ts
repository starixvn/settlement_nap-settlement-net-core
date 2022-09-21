import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { EventStatus, TicketStatusText } from "../../../../shared/constants";
import { ChildMatch, FantasyRelatedMatch, MatchDetail, Score } from '../models/match.model';
import { VerificationBaseService } from "../../../services/verification-base.service";

@Injectable()
export class VerifyScoreGoalService extends VerificationBaseService{
    public isSettledFirstHalf(betStatus: string) {
        return betStatus.includes(EventStatus.refundHalftime)
            || betStatus.includes(`${EventStatus.refund};`) || betStatus.includes(EventStatus.abandonedFirstHalf);
    }

    public isResultChangedFirstHalf(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        const isExistHalftime = !this.isEmptyScore(lastestMatchDetail.halfTimeHomeScore)
            && !this.isEmptyScore(lastestMatchDetail.halfTimeAwayScore);

        return isExistHalftime && (!_.isEqual(matchDetail.halfTimeHomeScore.toString(), lastestMatchDetail.halfTimeHomeScore.toString())
            || !_.isEqual(matchDetail.halfTimeAwayScore.toString(), lastestMatchDetail.halfTimeAwayScore.toString()));

    }

    public isGoalRecordChangedFirstHalf(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        if (!_.isNil(lastestMatchDetail.goalRecord)) {
            const htGoalRecord = matchDetail.goalRecord.slice(0, matchDetail.goalRecord.indexOf(';'));
            const lastestHtGoalRecord = lastestMatchDetail.goalRecord.slice(0, lastestMatchDetail.goalRecord.indexOf(';'));

            return !_.isEqual(htGoalRecord, lastestHtGoalRecord);
        }

        return false;
    }

    public isSettledFullTime(betStatus: string) {
        return betStatus.includes(EventStatus.refundFullTime)
            || betStatus.includes(`${EventStatus.refund};`) || betStatus.includes(EventStatus.abandoned);
    }

    public isResultChangedFullTime(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        const isExistFinalScore = !this.isEmptyScore(lastestMatchDetail.finalHomeScore)
            && !this.isEmptyScore(lastestMatchDetail.finalAwayScore);

        return isExistFinalScore && (!_.isEqual(matchDetail.finalHomeScore.toString(), lastestMatchDetail.finalHomeScore.toString())
            || !_.isEqual(matchDetail.finalAwayScore.toString(), lastestMatchDetail.finalAwayScore.toString()));
    }

    public isGoalRecordChangedFullTime(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        return !_.isNil(lastestMatchDetail.goalRecord) && !_.isEqual(matchDetail.goalRecord, lastestMatchDetail.goalRecord);
    }

    public isSettledAll(betStatus: string) {
        return betStatus.includes(EventStatus.refund) || betStatus.includes(EventStatus.abandoned);
    }

    public isGoalRecordChangedAll(matchDetail: MatchDetail, lastestMatchDetail: MatchDetail) {
        if (matchDetail.applyGoalRecord && !_.isNil(lastestMatchDetail.goalRecord)) {
            const separator = matchDetail.goalRecord.indexOf(";");
            const halftimeGoalRecord = matchDetail.goalRecord.slice(0, separator);
            const finalGoalRecord = matchDetail.goalRecord.slice(separator + 1);

            const separatorLastestMatchDetail = lastestMatchDetail.goalRecord.indexOf(";");
            const lastestHalftimeGoalRecord = lastestMatchDetail.goalRecord.slice(0, separatorLastestMatchDetail);
            const lastestFinalGoalRecord = lastestMatchDetail.goalRecord.slice(separatorLastestMatchDetail + 1);

            return (!_.isEqual(halftimeGoalRecord, lastestHalftimeGoalRecord)
                && _.isEqual(lastestMatchDetail.htStatus.toLowerCase(), TicketStatusText.calculated.toLowerCase()))
                || (!_.isEqual(finalGoalRecord, lastestFinalGoalRecord)
                    && _.isEqual(lastestMatchDetail.ftStatus, TicketStatusText.calculated));
        }

        return false;
    }

    public verifyScoreHalfTime(matchDetail: MatchDetail) {
        if (this.isEmptyScore(matchDetail.halfTimeHomeScore) || this.isEmptyScore(matchDetail.halfTimeAwayScore)) {
            matchDetail.isWarningHalfTimeHomeScore = this.isEmptyScore(matchDetail.halfTimeHomeScore);
            matchDetail.isWarningHalfTimeAwayScore = this.isEmptyScore(matchDetail.halfTimeAwayScore);
            return true;
        }
        return false;
    }

    public verifyScoreFullTime(matchDetail: MatchDetail) {
        if (this.isEmptyScore(matchDetail.finalHomeScore) || this.isEmptyScore(matchDetail.finalAwayScore)) {
            matchDetail.isWarningFinalHomeScore = this.isEmptyScore(matchDetail.finalHomeScore);
            matchDetail.isWarningFinalAwayScore = this.isEmptyScore(matchDetail.finalAwayScore);
            return true;
        }
        return false;
    }

    public verifyScoreAll(matchDetail: MatchDetail) {
        const isHTEmpty = this.verifyScoreHalfTime(matchDetail);
        const isFTEmpty = this.verifyScoreFullTime(matchDetail);
        return isFTEmpty || isHTEmpty;
    }

    public isHalfTimeSettled(matchDetail: MatchDetail) {
        return matchDetail.isHalfTimeCal || (!this.isEmpty(matchDetail.betStatus) &&
            _.includes(matchDetail.betStatus.toLowerCase(), EventStatus.refundHalftime.toLowerCase()));
    }

    public isFullTimeSettled(matchDetail: MatchDetail) {
        return matchDetail.isCalculated ||
            (!this.isEmpty(matchDetail.betStatus)
                && (_.includes(matchDetail.betStatus.toLowerCase(), EventStatus.abandoned.toLowerCase()) ||
                    (_.includes(matchDetail.betStatus.toLowerCase(), EventStatus.refund.toLowerCase())
                        && !_.includes(matchDetail.betStatus.toLowerCase(), EventStatus.refundHalftime.toLowerCase()))));
    }

    public isRefundHalfTime(matchDetail: MatchDetail) {
        if (!_.isNil(matchDetail.betStatus) && matchDetail.betStatus.includes(`${EventStatus.refundHalftime};`)) {
            return true;
        }
        return false;
    }

    public sumScoreAndAutoFill(homeTeams: string[], awayTeams: string[], fantasyRelatedMatches: FantasyRelatedMatch[]) {
        let halfTimeHomeScore = 0;
        let halfTimeAwayScore = 0;
        let finalHomeScore = 0;
        let finalAwayScore = 0;
        _.forEach(fantasyRelatedMatches, (match) => {
            _.forEach(homeTeams, (teamId) => {
                if (_.isEqual(teamId, match.homeId.toString())) {
                    halfTimeHomeScore += Number(match.htHomeScore);
                    finalHomeScore += Number(match.finalHomeScore);
                } else if (_.isEqual(teamId, match.awayId.toString())) {
                    halfTimeHomeScore += Number(match.htAwayScore);
                    finalHomeScore += Number(match.finalAwayScore);
                }
            });

            _.forEach(awayTeams, (teamId) => {
                if (_.isEqual(teamId, match.homeId.toString())) {
                    halfTimeAwayScore += Number(match.htHomeScore);
                    finalAwayScore += Number(match.finalHomeScore);
                } else if (_.isEqual(teamId, match.awayId.toString())) {
                    halfTimeAwayScore += Number(match.htAwayScore);
                    finalAwayScore += Number(match.finalAwayScore);
                }
            });
        });

        return new Score(halfTimeHomeScore, halfTimeAwayScore, finalHomeScore, finalAwayScore);
    }

    public isScoresValid(home: number, away: number) {
        return !this.isEmptyScore(home) && !this.isEmptyScore(away);
    }

    public verifyScoreForChildMatch(matchDetail: MatchDetail, selectedChildMatches: ChildMatch[]) {
        return selectedChildMatches.length > 0 && _.isEqual(matchDetail.finalAwayScore.toString(), matchDetail.finalHomeScore.toString());
    }
}