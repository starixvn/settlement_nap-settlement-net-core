import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { HttpRequestService } from "../../shared/services";
import { SettlementStatusId } from "../../shared/constants";
import { ResourcesIds } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
@Injectable()
export class CashOutService {
    private cashOutApi = '/api/cash-out';
    private defaultScore = "0-0";
    constructor(private readonly httpRequestService: HttpRequestService) { }

    public getTicketInfo(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.cashOutApi}/get-ticket`);
        return firstValueFrom(request);
    }

    public voidBet(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.cashOutApi}/void-bet`);
        return firstValueFrom(request);
    }

    public calc(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.cashOutApi}/calc`);
        return firstValueFrom(request);
    }

    public refund(query: object) {
        const request = this.httpRequestService.postJson(query, `${this.cashOutApi}/refund`);
        return firstValueFrom(request);
    }

    public getDirectBetStatusOnCalc(halfTime: ResultDetail, fullTime: ResultDetail) {
        const betStatus: string[] = [];
        betStatus.push(`${Number(halfTime.homeValue)}-${Number(halfTime.awayValue)}`);
        betStatus.push(this.defaultScore);
        betStatus.push(`${Number(fullTime.homeValue)}-${Number(fullTime.awayValue)}`);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        
        return betStatus.join(',');
    }

    public getDirectBetStatusOnRefund(resultDetails: ResultDetail[]) {
        const betStatus: string[] = [];
        const halfTime = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore));
        betStatus.push(`${Number(halfTime.homeValue)}-${Number(halfTime.awayValue)}`);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        betStatus.push(this.defaultScore);
        
        return betStatus.join(',');
    }

    public getBetStatus(resultDetails: ResultDetail[]) {
        const resultDetailsQuarters = resultDetails.filter((map) =>
        map.resourceId !== ResourcesIds.htScore && map.resourceId !== ResourcesIds.finalScore);
        const betStatus: string[] = [];
        resultDetailsQuarters.forEach((map) => {
            const score = map.checked  ? this.defaultScore : `${Number(map.homeValue)}-${Number(map.awayValue)}`
            betStatus.push(score);
        });
        betStatus.push(this.defaultScore);

        return  betStatus.join(',');
    }

    public getHalf(resultDetails: ResultDetail[]) {
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
        }else if(this.isRefundByQuarter(resultDetails, ResourcesIds.finalScore)) {
            return 0;
        }
    }

    public isCalcHalftimeWithMatchTwoQuarters(betStatus: string, resultDetails: ResultDetail[]){
        const halfTimeIsCalculated = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore) && map.settlementStatusId === SettlementStatusId.Calculated);
        const fullTimeIsRunning = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.finalScore) && map.settlementStatusId === SettlementStatusId.Running);

        return _.isEmpty(betStatus) && halfTimeIsCalculated && fullTimeIsRunning;
    }

    public isNotCalcHalftimeWithMatchTwoQuarters(resultDetails: ResultDetail[]){
        const halfTimeIsRunning = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.htScore) && map.settlementStatusId === SettlementStatusId.Running);
        const fullTimeIsRunning = resultDetails.find((map) => _.isEqual(map.resourceId, ResourcesIds.finalScore) && map.settlementStatusId === SettlementStatusId.Running);
        const quarter =  resultDetails.filter((map) => map.checked && _.includes([ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4], map.resourceId)).length;
        return halfTimeIsRunning && fullTimeIsRunning && quarter === 0;
    }

    private isRefundAll(resultDetails: ResultDetail[]) {
        var count = resultDetails.filter((map) => map.checked &&
                    _.includes([ResourcesIds.quarter1, ResourcesIds.quarter2, ResourcesIds.quarter3, ResourcesIds.quarter4, ResourcesIds.htScore, ResourcesIds.finalScore], map.resourceId)).length;
        return count === 6;
    }

    private isRefundByQuarter(resultDetails: ResultDetail[], quarter: string) {
       return resultDetails.find((map) => _.isEqual(map.resourceId, quarter)).checked;
    }
}