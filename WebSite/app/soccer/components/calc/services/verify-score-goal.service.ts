import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { EventStatus, TicketStatusText } from "../../../../shared/constants";
import { ChildMatch, FantasyRelatedMatch, MatchDetailSoccer as MatchDetail, Score } from '../models/match.model';
import { VerificationBaseService } from "../../../services/verification-base.service";
import { ResultDetail, ExternalResultDetail } from "../../../../shared/models/sportsbook-sop";
import { GeneralResultDetail } from "../../../../shared/models";

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

    public verifyScore(resultDetail: ResultDetail) {
        if (this.isEmptyScore(resultDetail.homeValue) || this.isEmptyScore(resultDetail.awayValue)) {
            resultDetail.isResultWarning = true;
            return true;
        }
        return false;
    }

    public verifyScoreAll(resultDetails: ResultDetail[]) {
        return resultDetails.filter(this.verifyScore.bind(this)).length > 0;
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

    public isValidResult(resultDetail: GeneralResultDetail) {
        return !this.isEmptyScore(resultDetail.homeValue) && !this.isEmptyScore(resultDetail.awayValue);
    }

    public isHtFtNotConsistent(halfTimeResult: GeneralResultDetail, fullTimeResult: GeneralResultDetail) {
        return this.isValidResult(halfTimeResult)
            && this.isValidResult(fullTimeResult)
            && (+halfTimeResult.homeValue > +fullTimeResult.homeValue
                || +halfTimeResult.awayValue > +fullTimeResult.awayValue);
    }

    public verifyScoreForChildMatch(fulltimeResult: ResultDetail, selectedChildMatches: ChildMatch[]) {
        return selectedChildMatches.length > 0 && _.isEqual(fulltimeResult.homeValue?.toString(), fulltimeResult.awayValue?.toString());
    }

    public tryGetValidResult(externalResultDetails: ExternalResultDetail[], resultDetails: ResultDetail[]): [boolean, GeneralResultDetail | undefined] {
        for (const result of externalResultDetails) {
            if (!this.isValidResult(result)) {
                return [false, undefined];
            }
        }

        const filteredResults = ([...externalResultDetails, ...resultDetails] as GeneralResultDetail[])
            .filter(result => !_.isEmpty(result.homeValue) && !_.isEmpty(result.awayValue));

        if (filteredResults.length === 1) {
            return [false, undefined];
        }

        const uniqueResults = _.uniqWith(filteredResults, (a, b) =>
            a.homeValue === b.homeValue && a.awayValue === b.awayValue
        );

        return [uniqueResults.length === 1, uniqueResults[0]];
    }
}