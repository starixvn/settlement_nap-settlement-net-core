import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { HttpRequestService } from "../../shared/services";
import { ResultDetail} from '../models';
import { ResourcesIds } from '../constants';
@Injectable()
export class CashOutService {
    private cashOutApi = '/api/cash-out';
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

    public getBetStatus(resultDetails: ResultDetail[]) {
        const resultDetailsQuarters = resultDetails.filter((map) =>
        map.resourceId !== ResourcesIds.htScore && map.resourceId !== ResourcesIds.finalScore);
        const overTimeScore = "0-0";
        const betStatus: string[] = [];
        resultDetailsQuarters.forEach((map) => {
            const score = map.checked  ? `0-0` : `${Number(map.homeValue)}-${Number(map.awayValue)}`
            betStatus.push(score);
        });
        betStatus.push(overTimeScore);

        return  betStatus.join(',');
    }

    public getHalf(resultDetails: ResultDetail[]) {
        if(this.isRefundByQuarter(resultDetails, ResourcesIds.quarter1)) {
            return 1;
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

    private isRefundByQuarter(resultDetails: ResultDetail[], quarter: string) {
       return resultDetails.find((map) => _.isEqual(map.resourceId, quarter)).checked;
    }
}