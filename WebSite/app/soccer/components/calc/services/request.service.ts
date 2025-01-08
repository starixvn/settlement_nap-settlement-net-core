import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { HttpRequestService } from "../../../../shared/services";
import { InstantCalculationQuery, SettleQuery, UncalculateFullTimeQuery } from "../models/query.model";
import { Result } from "../../../../shared/models";
import { Match, MatchDetail, UndoChecking } from "../models/match.model";
import { ResultDetail } from "../../../models";

@Injectable()
export class RequestService {
    private readonly soccerApi = '/api/soccer';
    constructor(private readonly httpRequestService: HttpRequestService) { }

    public getMatch(matchId: number) {
        const query = {
            matchId,
            isRefundPage: false
        };
        const request =  this.httpRequestService.postJson<Match>(query, `${this.soccerApi}/get-match`);
        return firstValueFrom(request);
    }

    public checkNewStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName
        };

        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/check-status`);
        return firstValueFrom(request);
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId
        };

        const request =  this.httpRequestService.postJson<MatchDetail>(query, `${this.soccerApi}/get-latest-match-detail`);
        return firstValueFrom(request);
    }

    public calculate(query: SettleQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/calculate`);
        return firstValueFrom(request);
    }

    public unCalculateFt(query: UncalculateFullTimeQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/uncalculate-ft`);
        return firstValueFrom(request);
    }

    public undoCheckingScore(matchId: number) {
        const query = {
            matchId,
        };
        const request =  this.httpRequestService.postJson<UndoChecking>(query, `${this.soccerApi}/undo-checking-score`);

        return firstValueFrom(request);
    }

    public pushInstantScore(query: InstantCalculationQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/push-instant-score`);
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

    public getResultDetail(matchId: number) {
        const request =  this.httpRequestService.getJson<ResultDetail[]>(`${this.soccerApi}/get-match?=matchId=${matchId}`);
        return firstValueFrom(request);
    }
}