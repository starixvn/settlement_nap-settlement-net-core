import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { GetMatchesQuery, SettleQuery } from '../models';
@Injectable()
export class QueryService {
    private numberGameApi = 'api/number-game';
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
}