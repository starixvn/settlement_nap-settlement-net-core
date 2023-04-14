import { InstantCalculationType } from "../constants";
import { CalculationMatch } from "./calculation-match.model";
import * as _ from 'lodash';

export class UpdateInstantQuery {
    homeScore: string;
    awayScore: string;
    matchId: string;
    isHalfTime: boolean;
    //    instantKey: number;
    action: string;
    //    isExistHtFgNg: boolean;
    //    isExistFgNg: boolean;
    //    isExistFg: boolean;
    //    isExistHtFg: boolean;
    //    goalRecord: string;
    //    firstGoalValue: string;
    //    betStatus: string;
    childMatchType: number;
    constructor(match: CalculationMatch) {
        this.homeScore = match.instantHomeScore;
        this.awayScore = match.instantAwayScore;
        this.matchId = match.matchId;
        this.isHalfTime = _.isEqual(match.instantCalculationType, InstantCalculationType.calcHt);
        //   this.instantKey = match.instantKey;
        this.action = "CAL";
        this.childMatchType = match.childMatchType;
    }
}