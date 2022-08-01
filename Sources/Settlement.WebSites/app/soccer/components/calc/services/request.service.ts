import { Injectable } from "@angular/core";
import { HttpRequestService } from "../../../../shared/services";
import { InstantCalculationQuery, SettleQuery } from "../models/query.model";

@Injectable()
export class RequestService {
    public apiUrl: string;
    constructor(private readonly httpRequestService: HttpRequestService) {}

    public getMatch(matchId: number) {
        const query = {
            matchId,
            isRefundPage: false
        };
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/get-match`);
    }

    public checkNewStatus(matchId: number, actionName: string) {
        const query = {
            matchId,
            actionName
        };

        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/check-status`);
    }

    public getLastestMatchResult(matchId: number) {
        const query = {
            matchId
        };

        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/get-lastest-match-detail`);
    }

    public calculate(query: SettleQuery) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/calculate`);
    }

    public undoCheckingScore(matchId: number) {
        const query = {
            matchId,
        };

        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/undo-checking-score`);
    }

    public pushInstantScore(query: InstantCalculationQuery) {
        return this.httpRequestService.postJson(query, `${this.apiUrl}/api/soccer/push-instant-score`);
    }

}