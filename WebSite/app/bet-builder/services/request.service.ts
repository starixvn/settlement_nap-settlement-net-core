import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { GetMatchesQuery, DateFilter, MatchWaitingRequest } from '../models';
import { Observable } from 'rxjs';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, Result } from '../../shared/models';
@Injectable()
export class RequestService {
    private betBuilderApi = '/api/bet-builder';
    constructor(private readonly httpRequestService: HttpRequestService) {
    }
   
    public getSport(params: object) {
        return this.httpRequestService.postJson(params, `${this.betBuilderApi}/get-sports`, false);
    }

    public getLeague(params: object) {
        return this.httpRequestService.postJson(params, `${this.betBuilderApi}/get-leagues`, false);
    }

    public getDate(): Observable<DateFilter> {
        return this.httpRequestService.getJson(`${this.betBuilderApi}/get-date`);
    }

    public search(query: GetMatchesQuery) {
        return this.httpRequestService.postJson(query, `${this.betBuilderApi}/search`);
    }


    public getMatch(matchId: number) {
        const param = {
            matchId
        };
        return this.httpRequestService.postJson(param, `${this.betBuilderApi}/get-match`);
    }

    public getSelection(matchId: number) {
        const param = {
            matchId
        };
        const url = `${this.betBuilderApi}/get-selection`;
        return this.httpRequestService.postJson(param, url);
    }

    public push(params: object) {
        return this.httpRequestService.postJson(params, `${this.betBuilderApi}/settle`);
    }

    public refreshMatches(param: MatchWaitingRequest) {
        return this.httpRequestService.postJson(param, `${this.betBuilderApi}/refresh-matches`, false);
    }

    public updateLeague(query: AutoSettingLeagueQuery): Observable<Result> {
        return this.httpRequestService.postJson(query, `/api/setting/update-setting-league`);
    }

    public updateMatch(query: AutoSettingMatchQuery): Observable<Result> {
        return this.httpRequestService.postJson(query, `/api/setting/update-setting-match`);
    }
}