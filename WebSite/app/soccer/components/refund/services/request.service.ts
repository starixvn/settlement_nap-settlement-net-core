import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MarkedTicketsModel, Result } from "../../../../shared/models";
import { HttpRequestService } from "../../../../shared/services";
import { MatchMoveBet } from "../model/match.model";
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
        return this.httpRequestService.postJson(query, `${this.soccerApi}/get-match`);
    }

    public checkNewStatus(matchId: number, actionName: string, isSettleAbandonedMatchIBC: boolean) {
        const query = {
            matchId,
            actionName,
            isSettleAbandonedMatchIBC
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/check-status`);
    }

    public getSpecificBetType(type: string, action: string){
        const query = {
            type,
            action
        };
        return this.httpRequestService.postJson(query, `${this.soccerApi}/specific-bet-type`);
    }

    public checkingMarkedTicket(actionName: string, matchId: number) : Observable<MarkedTicketsModel> {
        const query = {
            matchId,
            actionName
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/checking-marked-tickets`, false);
    }

    public refundMatch(query: RefundQuery){
        return this.httpRequestService.postJson(query, `${this.soccerApi}/refund`);
    }

    public refundRunningThirdPartyTickets(matchId: number, actionName: string){
        const query = {
            matchId,
            actionName
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/refund-running-third-party-ticket`);
    }

    public getMatchDetailThirdPartyBetTickets(matchId:number): Observable<MatchMoveBet[]>{
        const query = {
            matchId
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/third-party-bet-tickets-checking`);
    }

    public moveBetType(matchId:number, newMatchId: number, newMatchCode: string, actionName: string): Observable<Result>{
        const query = {
            matchId,
            newMatchId,
            newMatchCode,
            actionName
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/move-third-party-bet-ticket`);
    }
}