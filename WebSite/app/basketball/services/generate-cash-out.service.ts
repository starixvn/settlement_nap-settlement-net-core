import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { SettlementStatusId } from "../../shared/constants";
import { ResourcesIds } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
@Injectable()
export class GenerateCashOutService {
    private defaultScore = "0-0";

    public isCalcHalftimeWithMatchTwoQuarters(betStatus: string, resultDetails: ResultDetail[]){
        const settlementStatusId = [SettlementStatusId.Running, SettlementStatusId.Refund, SettlementStatusId.RefundSettleDetermined];
       
        const halfTimeIsCalculated = _.find(resultDetails, (item) =>  _.isEqual(item.resourceId, ResourcesIds.htScore) && item.settlementStatusId === SettlementStatusId.Calculated);
        const fullTimeIsRunning = _.find(resultDetails, (item) => _.isEqual(item.resourceId, ResourcesIds.finalScore) && _.includes(settlementStatusId, item.settlementStatusId));

        return _.isEmpty(betStatus) && halfTimeIsCalculated && fullTimeIsRunning;
    }

    public isNotCalcHalftimeWithMatchTwoQuarters(resultDetails: ResultDetail[]){
        const settlementStatusId = [SettlementStatusId.Running, SettlementStatusId.Refund, SettlementStatusId.RefundSettleDetermined];
        const halfTimeIsRunning = _.find(resultDetails, (item) => _.isEqual(item.resourceId, ResourcesIds.htScore) &&  _.includes(settlementStatusId, item.settlementStatusId));
        const fullTimeIsRunning = _.find(resultDetails, (item) => _.isEqual(item.resourceId, ResourcesIds.finalScore) && _.includes(settlementStatusId, item.settlementStatusId));
        const quarter =  resultDetails.filter((map) => map.checked && _.includes([ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4], map.resourceId)).length;
        return halfTimeIsRunning && fullTimeIsRunning && quarter === 0;
    }

    public isSuspendedFullTimeMatchThreeQuarter(resultDetails: ResultDetail[]){
        const settlementStatusId = [SettlementStatusId.Running, SettlementStatusId.RefundSettleDetermined];
        const fullTimeIsRunning = _.find(resultDetails, (item) => _.isEqual(item.resourceId, ResourcesIds.finalScore) && _.includes(settlementStatusId, item.settlementStatusId));
        const quarter =  resultDetails.filter((map) => map.checked && _.includes([ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.htScore, ResourcesIds.quarter3, ResourcesIds.quarter4], map.resourceId)).length;
        return fullTimeIsRunning && quarter === 0;
    }

    public getDirectHalftimeBetStatus(resultDetails: ResultDetail[]) {
        const betStatus: string[] = [];
        const halfTime = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore));
        betStatus.push(`${Number(halfTime.homeValue)}-${Number(halfTime.awayValue)}`);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        
        return betStatus.join(',');
    }

    public getDirectFullTimeBetStatus(resultDetails: ResultDetail[]) {
        const betStatus: string[] = [];
        const finalScore = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.finalScore));
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        betStatus.push(`${Number(finalScore.homeValue)}-${Number(finalScore.awayValue)}`);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        
        return betStatus.join(',');
    }

    public generateBetStatus(resultDetails: ResultDetail[]) {
        const betStatus: string[] = [];
        const resultDetailsQuarters = _.filter(resultDetails, (item) =>  !_.isEqual(item.resourceId, ResourcesIds.htScore) && !_.isEqual(item.resourceId, ResourcesIds.finalScore));
        resultDetailsQuarters.forEach((map) => {
            const score = map.checked  ? this.defaultScore : `${Number(map.homeValue)}-${Number(map.awayValue)}`
            betStatus.push(score);
        });
        betStatus.push(this.defaultScore);
        return  betStatus.join(',');
    }

    public generateBetStatusForSettleDetermined(resultDetails: ResultDetail[]) {
        const resultDetailsQuarters = _.filter(resultDetails, (item) =>  !_.isEqual(item.resourceId, ResourcesIds.htScore) && !_.isEqual(item.resourceId, ResourcesIds.finalScore));
            
        if(this.isRefundAll(resultDetails)) {
            return this.getBetStatusByQuarter(resultDetailsQuarters, [ResourcesIds.quarter1]);
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter2)) {
            return this.getBetStatusByQuarter(resultDetailsQuarters, [ResourcesIds.quarter1, ResourcesIds.quarter2]);
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter3)) {
            return this.getBetStatusByQuarter(resultDetailsQuarters, [ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3]);
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter4)) {
            return this.getBetStatusByQuarter(resultDetailsQuarters, [ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4]);
        } 

        return this.getBetStatusByQuarter(resultDetailsQuarters, [ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4, ResourcesIds.ot]);
    }

    public generateBetStatus2HSuspendedForSettleDetermined(resultDetails: ResultDetail[]) {
        const betStatus: string[] = [];
        const halfTime = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore));
        betStatus.push(`${Number(halfTime.homeValue)}-${Number(halfTime.awayValue)}`);
        betStatus.push(this.defaultScore);
        
        const finalScore = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.finalScore));
        betStatus.push(`${Number(finalScore.homeValue)}-${Number(finalScore.awayValue)}`);

        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        
        return betStatus.join(',');
    }

    public generateHalf(resultDetails: ResultDetail[]) {
        if(this.isRefundAll(resultDetails)) {
            return 8;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter2)) {
            return 2;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.htScore)) {
            return 5;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter3)) {
            return 3;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter4)) {
            return 4;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.finalScore)) {
            return 0;
        }
    }

    public generateHalfForSettleDetermined(resultDetails: ResultDetail[]) {
        if(this.isRefundAll(resultDetails)) {
            return 11;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter2)) {
            return 12;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.htScore)) {
            return 15;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter3)) {
            return 13;
        } else if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter4)) {
            return 14;
        }else if(this.isRefundByQuarter(resultDetails, ResourcesIds.finalScore)) {
            return 10;
        }
    }

    private getBetStatusByQuarter(resultDetails: ResultDetail[], quarter: string[]){
        const betStatus: string[] = [];
        resultDetails.forEach((map) => {
            const score = _.includes(quarter, map.resourceId)  ? `${Number(map.homeValue)}-${Number(map.awayValue)}` : this.defaultScore;
            betStatus.push(score);
        });
       
        return  betStatus.join(',');
    }

    private isRefundAll(resultDetails: ResultDetail[]) {
        var count = resultDetails.filter((map) => map.checked &&
                    _.includes([ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4, ResourcesIds.htScore, ResourcesIds.finalScore], map.resourceId)).length;
        return count === 6;
    }

    private isRefundByQuarter(resultDetails: ResultDetail[], quarter: string) {
       return _.find(resultDetails, (item) => _.isEqual(item.resourceId, quarter) && item.checked);
    }
}