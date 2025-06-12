import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { HttpRequestService } from "../../shared/services";
import { MarkedTicketsModel } from "../models";
@Injectable()
export class RequestBaseService {
    protected readonly soccerApi = '/api/soccer';
    constructor(protected readonly httpRequestService: HttpRequestService) {}

    public getMatch<T>(matchId: number, isRefundPage = false) {
        const query = {
            matchId,
            isRefundPage
        };
        const request =  this.httpRequestService.postJson<T>(query, `${this.soccerApi}/get-match`);
        return firstValueFrom(request);
    }


    public checkingMarkedTicket(actionName: string, matchId: number) {
        const query = {
            matchId,
            actionName
        };

        const request = this.httpRequestService.postJson<MarkedTicketsModel>(query, `${this.soccerApi}/checking-marked-tickets`, false);
        return firstValueFrom(request);
    }

    public alertMessageToLetstalkForFastMarket(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName
        };
        const fastMarketApi = "/api/fast-market";
        const request = this.httpRequestService.postJson(query, `${fastMarketApi}/insert-message-letstalk`);
        return firstValueFrom(request);
    }
}