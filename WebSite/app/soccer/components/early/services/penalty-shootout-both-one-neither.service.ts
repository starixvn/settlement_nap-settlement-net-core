import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Score } from '../../../models';
import { ResultValue } from '../../../constants';
import { PenaltyShootoutService } from './penalty-shootout.service';
@Injectable()
export class PenaltyShootoutBothOneNeitherService {
    constructor(
        public penaltyService: PenaltyShootoutService) {
    }
    public resetValuePenalyShootoutBothOneNeither(score: Score): string {
        if (this.penaltyService.isEmptyScore(score.homeValue, score.awayValue)) {
            return "";
        } else if (_.isEqual(score.homeValue, ResultValue.Score)) {
            return this.bothOneNeitherWhenHomeScore(score.awayValue);
        } else if (_.isEqual(score.awayValue, ResultValue.Score)) {
            return this.bothOneNeitherWhenAwayScore(score.homeValue);
        } else {
            return this.bothOneNeitherWhenHomeOrAwayMiss(score.homeValue, score.awayValue);
        }
    }

    private bothOneNeitherWhenHomeScore(awayValue: string) {
        if (_.isEqual(awayValue, ResultValue.Miss)) {
            return ResultValue.One;
        } else if (_.isEqual(awayValue, ResultValue.NotTaken)) {
            return ResultValue.HomeScoreAwayNotTaken;
        } else {
            return ResultValue.Both;
        }
    }

    private bothOneNeitherWhenAwayScore(homeValue: string) {
        return _.isEqual(homeValue, ResultValue.Miss) ? ResultValue.One : ResultValue.HomeNotTakenAwayScore;

    }

    private bothOneNeitherWhenHomeOrAwayMiss(homeValue: string, awayValue: string) {
        if (_.isEqual(homeValue, ResultValue.Miss) && _.isEqual(awayValue, ResultValue.Miss)) {
            return ResultValue.NoGoal;
        } else if (_.isEqual(homeValue, ResultValue.Miss) && _.isEqual(awayValue, ResultValue.NotTaken)) {
            return ResultValue.HomeMissAwayNotTaken;
        } else if (_.isEqual(awayValue, ResultValue.Miss) && _.isEqual(homeValue, ResultValue.NotTaken)) {
            return ResultValue.HomeNotTakenAwayMiss;
        } else {
            return "";
        }
    }
}