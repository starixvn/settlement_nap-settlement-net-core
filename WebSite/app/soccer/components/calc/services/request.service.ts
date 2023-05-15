import { Injectable } from "@angular/core";
import { HttpRequestService } from "../../../../shared/services";
import { InstantCalculationQuery, SettleQuery, UncalculateFullTimeQuery } from "../models/query.model";
import { firstValueFrom } from "rxjs";
import { Result } from "../../../../shared/models";
import { Match, UndoChecking } from "../models/match.model";

@Injectable()
export class RequestService {
    private soccerApi = '/api/soccer';
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

        return this.httpRequestService.postJson(query, `${this.soccerApi}/check-status`);
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/get-lastest-match-detail`);
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

        const request = this.httpRequestService.postJson<UndoChecking>(query, `${this.soccerApi}/undo-checking-score`);
        return firstValueFrom(request);
    }

    public pushInstantScore(query: InstantCalculationQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/push-instant-score`);
        return firstValueFrom(request);
    }
}