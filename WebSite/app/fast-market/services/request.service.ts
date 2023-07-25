import { Injectable } from "@angular/core";
import { HttpRequestService } from "../../shared/services";
import { Observable, firstValueFrom } from "rxjs";
import {
  FastMarkets,
  Filter,
  MarkedTickets,
  SettleQuery,
  CheckingMarkedTicketsQuery,
  UpdateWaterBreakQuery,
  GetLastestResultQuery,
} from "../models";
import {
  AutoSettingLeagueQuery,
  AutoSettingMatchQuery,
} from "../../shared/models";
import { TimeMachineResult } from "../models/interval.model";

@Injectable()
export class RequestService {
  private fastMarketApi = "/api/fast-market";
  constructor(private readonly httpRequestService: HttpRequestService) {}

  public checkingMarkedTickets(
    query: CheckingMarkedTicketsQuery
  ): Observable<MarkedTickets> {
    const url = `${this.fastMarketApi}/checking-marked-tickets`;
    return this.httpRequestService.postJson(query, url, false);
  }

  public getMatchDetail(matchId: number) {
    const url = `${this.fastMarketApi}/get-match`;
    const query = { matchId };
    return this.httpRequestService.postJson(query, url);
  }

  public getFastMarketResult(matchId: number): Observable<FastMarkets> {
    const url = `${this.fastMarketApi}/get-bettype-interval`;
    const query = { matchId };
    return this.httpRequestService.postJson<FastMarkets>(query, url)
   
  }

  public doSubmitByAction(query: SettleQuery) {
    const url = `${this.fastMarketApi}/settle`;
    return this.httpRequestService.postJson(query, url);
  }

  public getFilterData(): Promise<Filter> {
    const url = `${this.fastMarketApi}/initial-filter`;
    const response = this.httpRequestService.getJson<Filter>(url);
    return firstValueFrom(response);
  }

  public updateMatchAutoSettle(matchSetting: AutoSettingMatchQuery) {
    const url = `/api/setting/update-setting-match`;
    return this.httpRequestService.postJson(matchSetting, url);
  }

  public updateLeagueAutoSettle(leagueSetting: AutoSettingLeagueQuery) {
    const url = `/api/setting/update-setting-league`;
    return this.httpRequestService.postJson(leagueSetting, url);
  }

  public updateWaterBreakSetting(query: UpdateWaterBreakQuery) {
    const url = `${this.fastMarketApi}/update-water-break`;
    return this.httpRequestService.postJson(query, url);
  }

  public getLastestResult(query: GetLastestResultQuery) {
    const url = `${this.fastMarketApi}/get-lastest-result`;
    return this.httpRequestService.postJson(query, url);
  }

  public getTimeMachineHdpResult(
    matchId: number
  ): Observable<TimeMachineResult[]> {
    const url = `${this.fastMarketApi}/get-time-machine-result`;
    const query = { matchId };
    return this.httpRequestService.postJson(query, url);
  }

  public checkingStatus(
    matchId: number,
    actionName: string,
    isSettleDetermined = false
  ) {
    const url = `/api/soccer/check-status`;
    const query = {
      matchId,
      actionName,
      isSettleDetermined,
      isEarly: true,
    };
    return this.httpRequestService.postJson(query, url);
  }
}
