import { Injectable } from '@angular/core';
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom } from 'rxjs';
import {
  FilterRequest,
  MultiSport,
  GetRemarkQuery,
  DateFilter,
  League, 
  Sport,
  AutoCalcSetting
} from '../models';
import * as _ from 'lodash';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ChangeSettingResult, Result } from '../../shared/models';

@Injectable()

export class MultiSportService {
  private readonly multiSportApi = '/api/multi-sports';
  private readonly settingApi = '/api/setting';
    
  constructor(private readonly httpRequestService: HttpRequestService) { }

  public getSport(params: object) {
    const response =  this.httpRequestService.postJson<Sport[]>(params, `${this.multiSportApi}/getSport`, false);
    return firstValueFrom(response);
  }
  public getLeague(params: object) {
    const response = this.httpRequestService.postJson<League[]>(params, `${this.multiSportApi}/getLeague`, false);
    return firstValueFrom(response);
  }

  public getDate() {
    const url = `${this.multiSportApi}/get-date`;
    const response =  this.httpRequestService.getJson<DateFilter>(url);
    return firstValueFrom(response);
  }

  public filter(params: FilterRequest) {
    const response = this.httpRequestService.postMessagePack<MultiSport>(params, `${this.multiSportApi}/filter`);
    return firstValueFrom(response);
  }

  public getRemarkInfo(matchId: string) {
    const query: GetRemarkQuery = {
      matchId
    };

    const response = this.httpRequestService.postJson<ChangeSettingResult>(query, `${this.settingApi}/get-remark-info`);
    return firstValueFrom(response);
  }

  public updateSettingMatch(query: AutoSettingMatchQuery) {
    const response = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-match`);
    return firstValueFrom(response);
  }

  public updateSettingLeague(query: AutoSettingLeagueQuery) {
    const response = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-league`);
    return firstValueFrom(response);
  }

  public getSetting(leagueId: number, matchId: number) {
    const params = {
      leagueId,
      matchId
    }
    const response = this.httpRequestService.postJson<AutoCalcSetting>(params, `${this.settingApi}/get-setting`, false);
    return firstValueFrom(response);
  }
}