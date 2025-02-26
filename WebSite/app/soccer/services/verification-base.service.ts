import { Injectable } from "@angular/core";
import * as _ from 'lodash';
import { EventStatus } from "../../shared/constants";
import { Goal } from "../constants";
import { MatchDetailBase, ResultDetail } from "../models";

@Injectable()
export class VerificationBaseService {
    public isEmptyScore(value: string | number) {
        if (_.isNumber(value)) {
            return false;
        }
        return _.isNull(value) || _.isEmpty(value);
    }

    public isEmpty(value: string) {
        return _.isNull(value) || _.isEmpty(value);
    }

    public goalRecordExistSemicolon(matchDetail: MatchDetailBase) {
        return matchDetail.applyGoalRecord && matchDetail.goalRecord.indexOf(';') >= 0;
    }

    public goalRecordNotExistSemicolon(matchDetail: MatchDetailBase) {
        return matchDetail.applyGoalRecord && matchDetail.goalRecord.indexOf(';') < 0;
    }

    public isHtGoalRecordInvalid(matchDetail: MatchDetailBase) {
        const homeScore = Number(matchDetail.halfTimeHomeScore);
        const awayScore = Number(matchDetail.halfTimeAwayScore);
        const htGoalRecord = matchDetail.goalRecord.indexOf(';') < 0 ?
            matchDetail.goalRecord : matchDetail.goalRecord.slice(0, matchDetail.goalRecord.indexOf(';'));
        const goalRecordHomeScore = _.countBy(htGoalRecord, (item) => _.isEqual(item, Goal.home)).true ?? 0;
        const goalRecordAwayScore = _.countBy(htGoalRecord, (item) => _.isEqual(item, Goal.away)).true ?? 0;

        return (homeScore + awayScore) !== htGoalRecord.length || (goalRecordHomeScore !== homeScore || goalRecordAwayScore !== awayScore);
    }

    public isHtGoalRecordInvalidWithResultDetail(matchDetail: MatchDetailBase, halfTimeResult: ResultDetail) {
        const homeScore = Number(halfTimeResult.homeValue);
        const awayScore = Number(halfTimeResult.awayValue);
        const htGoalRecord = matchDetail.goalRecord.indexOf(';') < 0 ?
            matchDetail.goalRecord : matchDetail.goalRecord.slice(0, matchDetail.goalRecord.indexOf(';'));
        const goalRecordHomeScore = _.countBy(htGoalRecord, (item) => _.isEqual(item, Goal.home)).true ?? 0;
        const goalRecordAwayScore = _.countBy(htGoalRecord, (item) => _.isEqual(item, Goal.away)).true ?? 0;

        return (homeScore + awayScore) !== htGoalRecord.length || (goalRecordHomeScore !== homeScore || goalRecordAwayScore !== awayScore);
    }

    public isHTGoalRecordConsistentWithResultDetail(matchDetail: MatchDetailBase, halfTimeResult: ResultDetail) 
        {
            let isSuspendHalfTime = true;
            if ((!this.isEmptyScore(halfTimeResult.homeValue)
                || !this.isEmptyScore(halfTimeResult.awayValue)
                || matchDetail.goalRecord.indexOf(';') >= 0)
                && !this.isAlreadyRefundHT(matchDetail.betStatus)) {
                isSuspendHalfTime = false;
            }
    
            return matchDetail.applyGoalRecord && !isSuspendHalfTime && this.isHtGoalRecordInvalidWithResultDetail(matchDetail, halfTimeResult);
     
        }

    public isHTGoalRecordConsistent(matchDetail: MatchDetailBase) {
        let isSuspendHalfTime = true;
        if ((!this.isEmptyScore(matchDetail.halfTimeHomeScore)
            || !this.isEmptyScore(matchDetail.halfTimeAwayScore)
            || matchDetail.goalRecord.indexOf(';') >= 0)
            && !this.isAlreadyRefundHT(matchDetail.betStatus)) {
            isSuspendHalfTime = false;
        }

        return matchDetail.applyGoalRecord && !isSuspendHalfTime && this.isHtGoalRecordInvalid(matchDetail);
    }

    public isAlreadyRefundHT(betStatus: string) {
        return !this.isEmpty(betStatus) && _.includes(betStatus.toLowerCase(), EventStatus.refund.toLowerCase());
    }

    public isFullTimeGoalRecordInvalid(matchDetail: MatchDetailBase) {
        const homeScore = Number(matchDetail.finalHomeScore);
        const awayScore = Number(matchDetail.finalAwayScore);
        const fulltimeGoalRecord = matchDetail.goalRecord.replace(';', '');
        const goalRecordHomeScore = _.countBy(fulltimeGoalRecord, (item) => _.isEqual(item, Goal.home)).true ?? 0;
        const goalRecordAwayScore = _.countBy(fulltimeGoalRecord, (item) => _.isEqual(item, Goal.away)).true ?? 0;

        return matchDetail.applyGoalRecord && ((homeScore + awayScore) !== fulltimeGoalRecord.length
            || (goalRecordHomeScore !== homeScore || goalRecordAwayScore !== awayScore));
    }

    public isFullTimeGoalRecordInvalidWithResultDetail(matchDetail: MatchDetailBase, fullTimeResult: ResultDetail) {
        const homeScore = Number(fullTimeResult.homeValue);
        const awayScore = Number(fullTimeResult.awayValue);
        const fulltimeGoalRecord = matchDetail.goalRecord.replace(';', '');
        const goalRecordHomeScore = _.countBy(fulltimeGoalRecord, (item) => _.isEqual(item, Goal.home)).true ?? 0;
        const goalRecordAwayScore = _.countBy(fulltimeGoalRecord, (item) => _.isEqual(item, Goal.away)).true ?? 0;

        return matchDetail.applyGoalRecord && ((homeScore + awayScore) !== fulltimeGoalRecord.length
            || (goalRecordHomeScore !== homeScore || goalRecordAwayScore !== awayScore));
    }
}