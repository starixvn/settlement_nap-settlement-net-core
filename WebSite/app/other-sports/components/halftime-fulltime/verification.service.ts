import { Injectable } from '@angular/core';
import { Match, MatchDetail } from '../../models';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { RequestService } from '../../services/request.service';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { CalculateAction, SportType } from '../../../shared/constants';
import { map } from 'rxjs/operators';
import { ResourcesIds } from '../../constants/resource-ids.native';

@Injectable()
export class VerificationService {
    constructor(
        private readonly requestService: RequestService,
        private readonly halfTimeFullTimeService: HalfTimeFullTimeService
    ) { }


    public isScoreFTInconsistent(betStatus: string, halfTime: ResultDetail, fullTime: ResultDetail,
        finalScoreAutoSum: ResultDetail, isScoreDirect: boolean) {
        return this.compareScore(betStatus, fullTime, finalScoreAutoSum, isScoreDirect) || this.isFtLessThanHt(halfTime, fullTime);
    }

    public isScoreHTInconsistent(betStatus: string, halfTime: ResultDetail, fullTime: ResultDetail,
        halfTimeScoreAutoSum: ResultDetail, isScoreDirect: boolean) {
        return this.compareScore(betStatus, halfTime, halfTimeScoreAutoSum, isScoreDirect)
            || this.isFtLessThanHt(halfTime, fullTime);
    }

    private isFtLessThanHt(halfTime: ResultDetail, fullTime: ResultDetail) {
        if (_.isNil(halfTime) || this.resultIsEmpty(fullTime) || this.resultIsEmpty(halfTime)) {
            return false;
        }

        if (Number(fullTime.homeValue) < Number(halfTime.homeValue) || Number(fullTime.awayValue) < Number(halfTime.awayValue)) {
            return true;
        }
        return false;
    }

    private compareScore(betStatus: string, resultDetail: ResultDetail, resultDetailAutoSum: ResultDetail, isScoreDirect: boolean) {
        return ((resultDetail.awayValue !== resultDetailAutoSum.awayValue) || (resultDetail.homeValue !== resultDetailAutoSum.homeValue))
            && _.includes(betStatus, "-") && !isScoreDirect && !this.resultIsEmpty(resultDetail);
    }

    public resultIsEmpty(item: ResultDetail) {
        return item.homeValue === null || _.isEmpty(item.homeValue)
            || item.awayValue === null || _.isEmpty(item.awayValue);
    }

    public verifyHalfTimeScore(halfTimeResult: ResultDetail, resultDetails: ResultDetail[], isScoreDirect: boolean, halfTimeNode: number) {
        if (isScoreDirect) {
            return this.resultIsEmpty(halfTimeResult);
        }

        for (let i = 0; i < halfTimeNode; i++) {
            if (_.isEmpty(resultDetails[i].homeValue) || _.isEmpty(resultDetails[i].awayValue)) {
                return true;
            }
        }
        return false;
    }

    public verifyAllScore(halfTime: ResultDetail, fullTime: ResultDetail,
        resultDetails: ResultDetail[], isScoreDirect: boolean, isCalcAll = false) {
        if (isScoreDirect) {
            const isFinalEmpty = this.resultIsEmpty(fullTime);
            const isHalfTimeEmpty = !_.isNil(halfTime) && this.resultIsEmpty(halfTime);
            return isCalcAll ? isFinalEmpty || isHalfTimeEmpty : isFinalEmpty;
        }
        return _.find(resultDetails, item => {
            if (_.isEqual(item.resourceId, ResourcesIds.ot)) {
                return (_.isEmpty(item.homeValue) && !_.isEmpty(item.awayValue))
                    || (_.isEmpty(item.awayValue) && !_.isEmpty(item.homeValue))
            }
            return _.isEmpty(item.homeValue) || _.isEmpty(item.awayValue);
        });
    }

    public verifyFinalHasDrawScore(matchDetail: MatchDetail, fullTime: ResultDetail) {
        const otPenShootout = 23;

       return matchDetail.childMatchType === otPenShootout 
            && matchDetail.sportType === SportType.iceHockey
            && fullTime
            && _.isEqual(fullTime.homeValue,fullTime.awayValue);
    }

    public VerifyChangedSettledTickets(matchId: number, resultDetails: ResultDetail[],
        isScoreDirect: boolean, action: string, halfTimeNode: number) {
        const query = {
            matchId
        };
        const needConfirm = this.requestService.getLastestResult(query).pipe(map((lastestMatch: Match) => {
            switch (action) {
                case CalculateAction.calculateHalfTime:
                    return this.halfTimeFullTimeService.compareHalfTimeScore(resultDetails, lastestMatch, isScoreDirect, halfTimeNode);
                case CalculateAction.calculateFullTime:
                    return this.halfTimeFullTimeService.compareFullTimeScore(resultDetails, lastestMatch, isScoreDirect);
                default:
                    return this.halfTimeFullTimeService.compareAllScore(resultDetails, lastestMatch, isScoreDirect);
            }
        }));

        return firstValueFrom(needConfirm);
    }

    public isScoreMismatched(halfTime: ResultDetail, fulltime: ResultDetail, matchDetail: MatchDetail,
        halfTimeOriginal: ResultDetail, fullTimeOriginal: ResultDetail) {
        if (!_.isNil(halfTime)) {
            this.halfTimeFullTimeService.isScoreMismatchHalfTime(halfTime, matchDetail, halfTimeOriginal);
        }
        this.halfTimeFullTimeService.isScoreMismatchFullTime(fulltime, matchDetail, fullTimeOriginal);
    }

    public isSourceSufficient(actionType: string, matchDetail: MatchDetail, fullTimeTrader: ResultDetail,
        halfTimeTrader: ResultDetail) {
        if (_.isEqual(actionType, CalculateAction.calculateHalfTime)) {
            return this.existHalfTimeExternalScore(matchDetail, halfTimeTrader);
        } else if (_.isEqual(actionType, CalculateAction.calculateFullTime)) {
            return this.existFullTimeExternalScore(matchDetail, fullTimeTrader);
        } else {
            return this.existHalfTimeExternalScore(matchDetail, halfTimeTrader)
                && this.existFullTimeExternalScore(matchDetail, fullTimeTrader);
        }
    }

    private existHalfTimeExternalScore(matchDetail: MatchDetail, halfTimeTrader: ResultDetail) {
        return _.isNil(halfTimeTrader) || this.halfTimeFullTimeService.isExistProviderScore(matchDetail)
            || this.halfTimeFullTimeService.isScoreConfirmed(matchDetail, halfTimeTrader);
    }

    private existFullTimeExternalScore(matchDetail: MatchDetail, fullTimeTrader: ResultDetail) {
        return this.halfTimeFullTimeService.isExistProviderScore(matchDetail, false)
            || this.halfTimeFullTimeService.isScoreConfirmed(matchDetail, fullTimeTrader);
    }

    public isConsistent(actionType: string, halfTime: ResultDetail, hasHalfTime: boolean, fullTime: ResultDetail) {
        return _.isEqual(actionType, CalculateAction.calculateHalfTime) ? halfTime.isScoreMismatched :
            _.isEqual(actionType, CalculateAction.calculateFullTime) ? fullTime.isScoreMismatched
                : ((hasHalfTime && halfTime.isScoreMismatched) || fullTime.isScoreMismatched);
    }
}