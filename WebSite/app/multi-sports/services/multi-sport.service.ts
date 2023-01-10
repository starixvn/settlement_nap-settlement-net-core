import { Injectable } from '@angular/core';
import { HttpRequestService } from "../../shared/services";
import { Observable } from 'rxjs';
import {
  FilterRequest,
  MultiSport,
  ParlayQuery,
  GetRemarkQuery,
  DateFilter
} from '../models';
import * as _ from 'lodash';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ChangeSettingResult, Result } from '../../shared/models';

@Injectable()

export class MultiSportService {
  private multiSportApi = 'api/multi-sports';
  private settingApi = 'api/setting';
    
  constructor(private readonly httpRequestService: HttpRequestService) { }

  public getSport(params: object) {
    return this.httpRequestService.postJson(params, `${this.multiSportApi}/getSport`, false);
  }
  public getLeague(params: object) {
    return this.httpRequestService.postJson(params, `${this.multiSportApi}/getLeague`, false);
  }

  public getDate(): Observable<DateFilter> {
    const url = `${this.multiSportApi}/get-date`;
    return this.httpRequestService.getJson(url);
  }

  public filter(params: FilterRequest): Observable<MultiSport> {
    return this.httpRequestService.postMessagePack(params, `${this.multiSportApi}/filter`);
  }

  public calculateMixParlay(param: ParlayQuery) {
    return this.httpRequestService.postJson(param, `${this.multiSportApi}/calculate-mix-parlay`);
  }

  public getRemarkInfo(matchId: string): Observable<ChangeSettingResult> {
    const query: GetRemarkQuery = {
      matchId
    };

    return this.httpRequestService.postJson(query, `${this.settingApi}/get-remark-info`);
  }

  public updateSettingMatch(query: AutoSettingMatchQuery): Observable<Result> {
    return this.httpRequestService.postJson(query, `${this.settingApi}/update-setting-match`);
  }

  public updateSettingLeague(query: AutoSettingLeagueQuery): Observable<Result> {
    return this.httpRequestService.postJson(query, `${this.settingApi}/update-setting-league`);
  }

  public getSetting(leagueId: number, matchId: number) {
    const params = {
      leagueId,
      matchId
    }
    return this.httpRequestService.postJson(params, `${this.settingApi}/get-setting`, false);
  }
}