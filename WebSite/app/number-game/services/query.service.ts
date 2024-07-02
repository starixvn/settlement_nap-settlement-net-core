import { Injectable } from '@angular/core';
import { CalculateAction } from '../../shared/constants';
import { HttpRequestService } from '../../shared/services';
import { Ball, GetMatchesQuery, SettleQuery } from '../models';
@Injectable()
export class QueryService {
    private readonly numberGameApi = '/api/number-game';
    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public getBallsByMatchId(matchId: number) {
        const url = `${this.numberGameApi}/get-ball?matchId=${matchId}`;
        return this.httpRequestService.getJson(url);
    }

    public search(query: GetMatchesQuery) {
        const url = `${this.numberGameApi}/search`;
        return this.httpRequestService.postJson(query, url);
    }

    public filter() {
        const url = `${this.numberGameApi}/filter-default`;
        return this.httpRequestService.getJson(url);
    }

    public settle(query: SettleQuery) {
        return this.httpRequestService.postJson(query, `${this.numberGameApi}/settle`);
    }

    public getAction(balls: Ball[]): string{
        const refundBalls  = balls.filter(ball => ball.isNA);
        return refundBalls.length === balls.length ? CalculateAction.refund 
            : refundBalls.length > 0 ? CalculateAction.refundFullTime : CalculateAction.calculate;
    }
}