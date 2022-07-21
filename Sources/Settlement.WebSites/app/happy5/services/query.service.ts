import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpRequestService } from '../../shared/services';
import { Filter, Ball, GetMatchesQuery, SettleQuery } from '../models';
@Injectable()
export class QueryService {
    private happyFiveApi = 'api/happy5';
    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public search(query: GetMatchesQuery) {
        return this.httpRequestService.postJson(query, `${this.happyFiveApi}/search`);
    }

    public filter(): Observable<Filter> {
        const url = `${this.happyFiveApi}/filter-default`;
        return this.httpRequestService.getJson(url);
    }

    public getBallsByMatchId(matchId: number): Observable<Ball[]> {
        const url = `${this.happyFiveApi}/get-ball?matchId=${matchId}`;
        return this.httpRequestService.getJson(url);
    }

    public settle(query: SettleQuery) {
        return this.httpRequestService.postJson(query, `${this.happyFiveApi}/settle`);
    }

    public async getBalls(matchId: number) {
        const balls = await this.getBallsByMatchId(matchId).toPromise();
        balls.forEach((ball) => {
            ball.numberBall = (!ball.numberBall || ball.numberBall < 1) ? null : ball.numberBall;
        });
        return balls;
    }
}