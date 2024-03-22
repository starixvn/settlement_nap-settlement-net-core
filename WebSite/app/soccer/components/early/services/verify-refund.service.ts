import { BetTypes, ResultValue } from '../../../constants';
import { Injectable } from '@angular/core';
import { ResultDetail } from '../../../models';
import { ExternalResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ScoreSourceType } from '../../../../shared/constants';
import { PenaltyShootoutService } from './penalty-shootout.service';
import * as _ from 'lodash';

@Injectable()
export class VerifyRefundService {
    private readonly roundPenaltyShootout = 5;
    constructor(
        public penaltyService: PenaltyShootoutService) {
    }

    public isEmptyResultValue(list: ResultDetail[]) {
        let flag = false;
        list = list.filter((item) => item.isSettleDetermined || this.isHomeAwayPenaltyShootout(item));

        list.forEach((item: ResultDetail) => {
            const isEmpty = this.penaltyService.isEmptyHomeOrAwayValue(item);
            item.isResultWarning = isEmpty;
            if (!flag) {
                flag = isEmpty;
            }
        });
        return flag;
    }

    public isExistedNotTaken(list: ResultDetail[]) {
        list = list.filter((item) => this.isHomeAwayPenaltyShootout(item)
            || (_.isEqual(item.betType, BetTypes.PenaltyShootout1X2) && item.isSettleDetermined)
            || (_.isEqual(item.betType, BetTypes.PenaltyShootoutBothOneNeither) && item.isSettleDetermined)
            || (_.isEqual(item.betType, BetTypes.PenaltyWoodwork) && item.isSettleDetermined));
        let flag = false;
        list.forEach((item: ResultDetail) => {
            const isNotTaken = this.notTaken(item);
            if (!isNotTaken) {
                item.isResultWarning = true;
                if (!flag) {
                    flag = true;
                }
            }
        });

        return flag;
    }

    private isHomeAwayPenaltyShootout(item: ResultDetail) {
        return item.map <= this.roundPenaltyShootout &&
            _.includes([BetTypes.HomePenaltyShootout, BetTypes.AwayPenaltyShootout], item.betType);
    }

    private notTaken(item: ResultDetail) {
        if (_.isEqual(item.betType, BetTypes.PenaltyWoodwork)) {
            const bothNotTaken = _.isEqual(item.homeValue, ResultValue.NotTaken)
                && _.isEqual(item.awayValue, ResultValue.NotTaken);
            const isNotExistedNotTaken = (!_.isEqual(item.homeValue, ResultValue.NotTaken)
                && !_.isEqual(item.awayValue, ResultValue.NotTaken));
            return bothNotTaken ? false : !isNotExistedNotTaken;
        } else {
            return this.penaltyService.isSelectedNotTaken(item.homeValue);
        }
    }

    public isInconsistentValue(list: ResultDetail[]) {
        const result = _.find(list, (item: ResultDetail) => item.isInvalidValue && item.isSettleDetermined);
        return !_.isEmpty(result);
    }

    
    public isExistedDifferentValueConfirmed(externalResults: ExternalResultDetail[], list: ResultDetail[]) {
        let flag = false;
        list = list.filter((item) => item.resultSettingData.isConfirmedRefundSdt);
        list.forEach((item: ResultDetail) => {
            const resource = externalResults.find(item => item.sourceId === ScoreSourceType.confirmRefundSource && item.resourceId === item.resourceId);
            if (!_.isUndefined(resource) && (!_.isEqual(item.homeValue, resource.homeValue) || !_.isEqual(item.awayValue, resource.awayValue))) {
                flag = true;
            }
        });
        return flag;
    } 
}