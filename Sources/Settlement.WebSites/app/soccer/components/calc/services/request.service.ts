import { Injectable } from "@angular/core";
import { HttpRequestService } from "../../../../shared/services";
import { InstantCalculationQuery, SettleQuery } from "../models/query.model";

@Injectable()
export class RequestService {
    private soccerApi = 'api/soccer';
    constructor(private readonly httpRequestService: HttpRequestService) {}

    public getMatch(matchId: number) {
        const query = {
            matchId,
            isRefundPage: false
        };
        return this.httpRequestService.postJson(query, `${this.soccerApi}/get-match`);
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
        return this.httpRequestService.postJson(query, `${this.soccerApi}/calculate`);
    }

    public undoCheckingScore(matchId: number) {
        const query = {
            matchId,
        };

        return this.httpRequestService.postJson(query, `${this.soccerApi}/undo-checking-score`);
    }

    public pushInstantScore(query: InstantCalculationQuery) {
        return this.httpRequestService.postJson(query, `${this.soccerApi}/push-instant-score`);
    }
}