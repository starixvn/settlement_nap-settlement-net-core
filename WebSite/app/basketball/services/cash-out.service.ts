import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { HttpRequestService } from "../../shared/services";
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { GenerateCashOutService } from './generate-cash-out.service';
import { ResourcesIds } from '../constants';
@Injectable()
export class CashOutService {
    private readonly cashOutApi = '/api/cash-out';
    private readonly defaultScore = "0-0";
    constructor(
        private readonly httpRequestService: HttpRequestService,
        private readonly generateCashOutService: GenerateCashOutService) { }

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

    public getListHalf(resultDetails: ResultDetail[]){
        const lsHalf = [];
        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.finalScore)){
            lsHalf.push(0);
        } 

        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.quarter1)){
            lsHalf.push(1);
        }

        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.quarter2)) {
            lsHalf.push(2);
        }

        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.quarter3)) {
            lsHalf.push(3);
        } 

        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.quarter4)) {
            lsHalf.push(4);
        }
        
        if(this.generateCashOutService.isSelectedQuarter(resultDetails, ResourcesIds.htScore)) {
            lsHalf.push(5);
        }

        return lsHalf;
    }

    public getHalf(resultDetails: ResultDetail[]) {
        if(this.generateCashOutService.isCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return 0;
        } else if(this.generateCashOutService.isNotCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return 8;
        } else {
            return this.generateCashOutService.generateHalf(resultDetails);
        }
    }

    public getHalfForSettleDetermined(resultDetails: ResultDetail[]) {
        if(this.generateCashOutService.isCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return 10;
         } else if(this.generateCashOutService.isNotCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return 15;
        } else if(this.generateCashOutService.isSuspendedFullTimeMatchThreeQuarter(resultDetails)) {
            return 18;
        } else {
            return this.generateCashOutService.generateHalfForSettleDetermined(resultDetails);
        }
    }

    public getBetStatus(resultDetails: ResultDetail[]) {
        if(this.generateCashOutService.isCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return this.generateCashOutService.getDirectHalftimeBetStatus(resultDetails);
        } else if(this.generateCashOutService.isNotCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return "0-0,0-0,0-0,0-0,0-0";
        } else {
            return this.generateCashOutService.generateBetStatus(resultDetails);
        }
    }

    public getBetStatusForSettleDetermined(resultDetails: ResultDetail[]) {
        if(this.generateCashOutService.isCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return this.generateCashOutService.generateBetStatus2HSuspendedForSettleDetermined(resultDetails);
        } else if(this.generateCashOutService.isNotCalcHalftimeWithMatchTwoQuarters(resultDetails)){
            return this.generateCashOutService.getDirectHalftimeBetStatus(resultDetails);
        } else if(this.generateCashOutService.isSuspendedFullTimeMatchThreeQuarter(resultDetails)) {
            return this.generateCashOutService.getDirectFullTimeBetStatus(resultDetails);
        } else {
            return this.generateCashOutService.generateBetStatusForSettleDetermined(resultDetails);
        }
    }  
}