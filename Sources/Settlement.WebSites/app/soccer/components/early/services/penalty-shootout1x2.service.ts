import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Score } from '../../../models';
import { ResultValue } from '../../../constants';
import { PenaltyShootoutService } from './penalty-shootout.service';
@Injectable()
export class PenaltyShootout1x2Service {
    constructor(
        public penaltyService: PenaltyShootoutService) {
    }
    public resetValuePenaltyShootout1X2(score: Score): string {
        if (this.penaltyService.isEmptyScore(score.homeValue, score.awayValue)) {
            return "";
        } else if (_.isEqual(score.homeValue, ResultValue.Score)) {
            return this.resetValueWhenHomeScore(score.awayValue);
        } else if (_.isEqual(score.awayValue, ResultValue.Score)) {
            return this.resetValueWhenAwayScore(score.homeValue);
        } else {
            return this.resetValueWhenHomeOrAwayMiss(score.homeValue, score.awayValue);
        }
    }

    private resetValueWhenHomeScore(awayValue: string) {
        if (_.isEqual(awayValue, ResultValue.Miss)) {
            return ResultValue.Home;
        } else if (_.isEqual(awayValue, ResultValue.NotTaken)) {
            return ResultValue.HomeScoreAwayNotTaken;
        } else {
            return ResultValue.Draw;
        }
    }

    private resetValueWhenAwayScore(homeValue: string) {
        return _.isEqual(homeValue, ResultValue.Miss) ? ResultValue.Away : ResultValue.HomeNotTakenAwayScore;
    }

    private resetValueWhenHomeOrAwayMiss(homeValue: string, awayValue: string) {
        if (_.isEqual(homeValue, ResultValue.Miss) && _.isEqual(awayValue, ResultValue.Miss)) {
            return ResultValue.Draw;
        } else if (_.isEqual(homeValue, ResultValue.Miss) && _.isEqual(awayValue, ResultValue.NotTaken)) {
            return ResultValue.HomeMissAwayNotTaken;
        } else if (_.isEqual(awayValue, ResultValue.Miss) && _.isEqual(homeValue, ResultValue.NotTaken)) {
            return ResultValue.HomeNotTakenAwayMiss;
        } else {
            return "";
        }
    }
}