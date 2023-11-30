import { Injectable } from "@angular/core";
import { Observable, firstValueFrom } from "rxjs";
import { MarkedTicketsModel, Result } from "../../../../shared/models";
import { HttpRequestService } from "../../../../shared/services";
import { MatchMoveBet, Match } from "../model/match.model";
import { RefundQuery } from "../model/query.model";
@Injectable()
export class RequestService {
    private soccerApi = '/api/soccer';
    constructor(private readonly httpRequestService: HttpRequestService) {}

    public getMatch(matchId: number) {
        const query = {
            matchId,
            isRefundPage: true
        };
        const request =  this.httpRequestService.postJson<Match>(query, `${this.soccerApi}/get-match`);
        return firstValueFrom(request);
    }

    public checkNewStatus(matchId: number, actionName: string, isSettleAbandonedMatchIBC: boolean) {
        const query = {
            matchId,
            actionName,
            isSettleAbandonedMatchIBC
        };

        const request =  this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/check-status`);
        return firstValueFrom(request);
    }

    public getSpecificBetType(type: string, action: string){
        const query = {
            type,
            action
        };
        return this.httpRequestService.postJson(query, `${this.soccerApi}/specific-bet-type`);
    }

    public checkingMarkedTicket(actionName: string, matchId: number) {
        const query = {
            matchId,
            actionName
        };

        const request = this.httpRequestService.postJson<MarkedTicketsModel>(query, `${this.soccerApi}/checking-marked-tickets`, false);
        return firstValueFrom(request);
    }

    public refundMatch(query: RefundQuery) {
        const request =  this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/refund`);
        return firstValueFrom(request);
    }

    public refundRunningThirdPartyTickets(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName
        };

        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/refund-running-third-party-ticket`);
        return firstValueFrom(request);
    }

    public getMatchDetailThirdPartyBetTickets(matchId:number): Observable<MatchMoveBet[]>{
        const query = {
            matchId
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/third-party-bet-tickets-checking`);
    }

    public moveBetType(matchId:number, newMatchId: number, newMatchCode: string, actionName: string) {
        const query = {
            matchId,
            newMatchId,
            newMatchCode,
            actionName
        };

        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/move-third-party-bet-ticket`);
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