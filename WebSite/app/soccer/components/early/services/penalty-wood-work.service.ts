import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { ResultValue } from '../../../constants';
import { ResultDetail, Score } from '../../../models';
import { PenaltyShootoutService } from './penalty-shootout.service';
@Injectable()
export class PenaltyWoodWorkService {
    constructor(
        public penaltyService: PenaltyShootoutService) {
    }
    public resetResultValue(currentValue: string, selectedValue: string) {
        if (_.isEqual(selectedValue, ResultValue.NotTaken)) {
            return ResultValue.NotTaken;
        } else {
            return _.isEqual(currentValue, ResultValue.NotTaken) ? "" : currentValue;
        }
    }

    public isInvalidResult(resultDetails: ResultDetail[], selectedItem: ResultDetail) {
        const listPenaltyShootoutRound = this.penaltyService.listPenaltyShootoutRound(resultDetails);
        const selectedScoreByRound = listPenaltyShootoutRound[selectedItem.map - 1];
        return this.isInvalidHomeOrAwayResult(selectedItem, selectedScoreByRound);
    }

    public isInvalidHomeOrAwayResult(selectedItem: ResultDetail, selectedScoreByRound: Score) {
        const homeValue = this.penaltyService.getScoreValue(selectedItem.homeValue);
        const awayValue = this.penaltyService.getScoreValue(selectedItem.awayValue);

        if (_.isEmpty(selectedScoreByRound.homeValue) && !_.isEmpty(homeValue)
            || _.isEmpty(selectedScoreByRound.awayValue) && !_.isEmpty(awayValue)) {
            return true;
        } else if (!_.isEmpty(selectedScoreByRound.homeValue) && _.isEmpty(homeValue)
            && !_.isEmpty(selectedScoreByRound.awayValue) && _.isEmpty(awayValue)) {
            return false;
        } else {
            return this.homeAwayPenaltyNotMachWithWoodwork(selectedScoreByRound, homeValue, awayValue);
        }
    }

    private homeAwayPenaltyNotMachWithWoodwork(selectedScoreByRound: Score, homeValue: string, awayValue: string) {
        return (_.isEqual(selectedScoreByRound.homeValue, ResultValue.NotTaken)
            && !_.isEqual(homeValue, ResultValue.NotTaken))
            || (!_.isEqual(selectedScoreByRound.homeValue, ResultValue.NotTaken)
                && _.isEqual(homeValue, ResultValue.NotTaken))

            || (_.isEqual(selectedScoreByRound.awayValue, ResultValue.NotTaken)
                && !_.isEqual(awayValue, ResultValue.NotTaken))
            || (!_.isEqual(selectedScoreByRound.awayValue, ResultValue.NotTaken)
                && _.isEqual(awayValue, ResultValue.NotTaken));
    }
}