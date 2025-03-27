import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { EventStatus, TicketStatusText } from "../../../../shared/constants";
import { ChildMatch, FantasyRelatedMatch, MatchDetail, Score } from '../models/match.model';
import { VerificationBaseService } from "../../../services/verification-base.service";
import { ResultDetail } from "../../../models";
import { ResourceIds } from '../../../constants';

@Injectable()
export class VerifyScoreGoalService extends VerificationBaseService {
    public isSettledFirstHalf(betStatus: string) {
        return betStatus.includes(EventStatus.refundHalftime)
            || betStatus.includes(`${EventStatus.refund};`) || betStatus.includes(EventStatus.abandonedFirstHalf);
    }

    public isResultChangedFirstHalf(halfTimeResult: ResultDetail, lastestMatchDetail: MatchDetail) {
        const isExistHalftime = !this.isEmptyScore(lastestMatchDetail.halfTimeHomeScore?.toString())
            && !this.isEmptyScore(lastestMatchDetail.halfTimeAwayScore?.toString());

        return isExistHalftime && (!_.isEqual(halfTimeResult.homeValue, lastestMatchDetail.halfTimeHomeScore?.toString())
            || !_.isEqual(halfTimeResult.awayValue, lastestMatchDetail.halfTimeAwayScore?.toString()));

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

    public isResultChangedFullTime(fullTimeResult: ResultDetail, lastestMatchDetail: MatchDetail) {
        const isExistFinalScore = !this.isEmptyScore(lastestMatchDetail.finalHomeScore?.toString())
            && !this.isEmptyScore(lastestMatchDetail.finalAwayScore?.toString());

        return isExistFinalScore && (!_.isEqual(fullTimeResult.homeValue, lastestMatchDetail.finalHomeScore?.toString())
            || !_.isEqual(fullTimeResult.awayValue, lastestMatchDetail.finalAwayScore?.toString()));
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

    public verifyScore(resultDetail: ResultDetail, matchDetail: MatchDetail, isHalfTime = true) {
        if (this.isEmptyScore(resultDetail.homeValue) || this.isEmptyScore(resultDetail.awayValue)) {
            if (isHalfTime) {
                matchDetail.isWarningHalfTimeHomeScore = this.isEmptyScore(resultDetail.homeValue);
                matchDetail.isWarningHalfTimeAwayScore = this.isEmptyScore(resultDetail.awayValue);
            } else {
                matchDetail.isWarningFinalHomeScore = this.isEmptyScore(resultDetail.homeValue);
                matchDetail.isWarningFinalAwayScore = this.isEmptyScore(resultDetail.awayValue);
            }
            return true;
        }
        return false;
    }

    public verifyScoreAll(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
        const isHTEmpty = this.verifyScore(resultDetails.find(r => r.resourceId === ResourceIds.halfTime), matchDetail, true);
        const isFTEmpty = this.verifyScore(resultDetails.find(r => r.resourceId === ResourceIds.fullTime), matchDetail, false);
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

    public isScoresValid(home: string, away: string) {
        return !this.isEmptyScore(home) && !this.isEmptyScore(away);
    }

    public isValidResult(resultDetail: ResultDetail) {
        return !this.isEmptyScore(resultDetail.homeValue) && !this.isEmptyScore(resultDetail.awayValue);
    }

    public isHtFtNotConsistent(halfTimeResult: ResultDetail, fullTimeResult: ResultDetail) {
        return this.isValidResult(halfTimeResult) 
            && this.isValidResult(fullTimeResult) 
            && (+halfTimeResult.homeValue > +fullTimeResult.homeValue
            || +halfTimeResult.awayValue > +fullTimeResult.awayValue);
    }

    public verifyScoreForChildMatch(fulltimeResult: ResultDetail, selectedChildMatches: ChildMatch[]) {
        return selectedChildMatches.length > 0 && _.isEqual(fulltimeResult.homeValue?.toString(), fulltimeResult.awayValue?.toString());
    }

    public tryGetValidResult(primaryResult: ResultDetail, resultDetails: ResultDetail[]): [boolean, ResultDetail | undefined] {
        if (!this.isValidResult(primaryResult)) {
            return [false, undefined];
        }

        const filteredResults = [primaryResult, ...resultDetails]
            .filter(result => result && result.resourceId === primaryResult.resourceId)
            .filter(result => !_.isEmpty(result.homeValue) && !_.isEmpty(result.awayValue));

        const uniqueResults = _.uniqWith(filteredResults, (a, b) =>
            a.homeValue === b.homeValue && a.awayValue === b.awayValue
        );

        return [uniqueResults.length === 1, uniqueResults[0]];
    }

    public isMismatched(resultDetails: ResultDetail[]) {
        const filteredResults = resultDetails.filter(result => result && !_.isEmpty(result.homeValue) && !_.isEmpty(result.awayValue));
        const isDifferent = _.uniqWith(filteredResults, (a, b) => a.homeValue === b.homeValue && a.awayValue === b.awayValue).length > 1;
        return isDifferent;
    }
}