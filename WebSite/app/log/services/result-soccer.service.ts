import { Injectable } from "@angular/core";
import { ResettleLogDetail } from "../models";
import * as _ from 'lodash';
import { SoccerResultValue, SoccerResultValueWithBettype } from "../constants/bet-type";

@Injectable()
export class ResultSoccerService {
    
    public getResultValue(logDetail: ResettleLogDetail) {
        const penaltyWoodwork = "383";
        if (_.isEmpty(logDetail.homeValue)) {
            return '-';
        }
        if (_.includes([penaltyWoodwork], logDetail.betType)) {
            const homeValue = this.generateResult(logDetail.homeValue, logDetail.betType);
            const awayValue = this.generateResult(logDetail.awayValue, logDetail.betType);
            return `${homeValue} - ${awayValue}`;
        }

        if (!_.isEmpty(logDetail.homeValue) && !_.isEmpty(logDetail.awayValue)) {
            return `${logDetail.homeValue} - ${logDetail.awayValue}`;
        }

        if (this.isBettypeOneXTwo(logDetail)) {
            return _.isEqual(logDetail.homeValue, "1") ? "Home" : "Away";
        }

        return this.generateResult(logDetail.homeValue, logDetail.betType);
    }

    private isBettypeOneXTwo(logDetail: ResettleLogDetail){
        const penaltyShootout1X2 = '385';
        return _.isEqual(logDetail.betType, penaltyShootout1X2) && _.includes(['1','2'], logDetail.homeValue);
    }
    private  generateResult(value: string, betType: string) {
        let mappingKey = `${value}`;
        if (SoccerResultValue[mappingKey] != undefined) {
            return SoccerResultValue[mappingKey];
        }

        mappingKey = `${value}-${betType}`;
        if (SoccerResultValueWithBettype[mappingKey] != undefined) {
            return SoccerResultValueWithBettype[mappingKey];
        }

        return value;
    }
}