import { Injectable } from "@angular/core";
import { FilterQuery, Calculation, UpdateInstantQuery, MatchGoalRecord, League, CalculationMatch, FilterAutoQuery } from "../models";
import { firstValueFrom, Observable } from "rxjs";
import { HttpRequestService } from "../../shared/services";
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ChangeSettingResult, DateFilter, Result } from "../../shared/models";
import * as _ from 'lodash';
import { BackGroundService } from "./back-ground.service";
import { DetectChangesService } from "./detect-changes.service";
import { League as BaseLeague } from "../../shared/models";
@Injectable()
export class RequestService {
  private calculationApi = 'api/calculation';
  private settingApi = 'api/setting';
  private soccerApi = 'api/soccer';

  constructor(private readonly httpRequestService: HttpRequestService,
    private readonly backGroundService: BackGroundService,
    private readonly detectChangesService: DetectChangesService) { }

  public getLeague(params: object) {
    const request = this.httpRequestService.postJson<BaseLeague[]>(params, `${this.calculationApi}/get-League`, false);
    return firstValueFrom(request);
  }

  public getDate() {
    const url = `api/multi-sports/get-date`;
    const request = this.httpRequestService.getJson<DateFilter>(url);
    return firstValueFrom(request);
  }

  public search(params: FilterQuery): Observable<Calculation> {
    const url = `${this.calculationApi}/filter`;
    return this.httpRequestService.postJson(params, url);
  }

  public searchAutoCalculation(params: FilterAutoQuery): Observable<Calculation> {
    const url = `${this.calculationApi}/filter-auto-calculate`;
    return this.httpRequestService.postJson(params, url);
  }

  public getRemarkInfo(matchId: string): Observable<ChangeSettingResult> {
    const query = {
      matchId
    };

    return this.httpRequestService.postJson(query, `${this.settingApi}/get-remark-info`);
  }

  private getNewestMatches(leagueIds: string) {
    const query = {
      leagueIds
    };
    const url = `${this.calculationApi}/auto-refresh`;
    const request =  this.httpRequestService.postJson<CalculationMatch[]>(query, url, false);
    return firstValueFrom(request);
  }

  private getNewestAutoMatches(leagueId: string) {
    const query = {
      leagueId,
    };
    const url = `${this.calculationApi}/auto-refresh-auto-calculation`;
    const request = this.httpRequestService.postJson<CalculationMatch[]>(query, url, false);
    return firstValueFrom(request);
  }

  public async refreshMatches(leagueIds: string, currentLeagues: League[], isAutoCalculatePage = false) {
    const matchesWaiting = isAutoCalculatePage ? await this.getNewestAutoMatches(leagueIds) :
      await this.getNewestMatches(leagueIds);
    this.changeInfoAfterRefreshMatches(currentLeagues, matchesWaiting, isAutoCalculatePage);
  }

  public getMatchDetail(matchId: number) {
    const url = `api/fast-market/get-match`;
    const query = { matchId };
    const request = this.httpRequestService.postJson(query, url);
    return firstValueFrom(request);
  }

  public updateSettingMatch(query: AutoSettingMatchQuery) {
    const request = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-match`);
    return firstValueFrom(request);
  }

  public updateSettingLeague(query: AutoSettingLeagueQuery) {
    const request = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-league`);
    return firstValueFrom(request);
  }

  public updateInstantStatus(query: UpdateInstantQuery) {
    const request = this.httpRequestService.postJson<MatchGoalRecord>(query, `${this.soccerApi}/match-checking`);
    return firstValueFrom(request);
  }

  public pushInstantStatus(query: UpdateInstantQuery, result: MatchGoalRecord) {
    query.isExistFgNg = result.isExistFgNg;
    query.isExistHtFgNg = result.isExistHtFgNg;
    query.goalRecord = result.goalRecord;
    query.isExistFg = result.isExistFg;
    query.isExistHtFg = result.isExistHtFg;
    query.betStatus = result.betStatus;
    const request = this.httpRequestService.postJson<Result>(query, `${this.soccerApi}/push-instant-score`);
    return firstValueFrom(request);
  }

  private changeInfoAfterRefreshMatches(currentLeagues: League[], matches: CalculationMatch[], isAutoCalculatePage: boolean) {
    currentLeagues.forEach((league) => {
      league.matches.forEach((match) => {
        const newMatch = _.find(matches, (matchWaiting: CalculationMatch) =>
          this.detectChangesService.detect(match, matchWaiting) ||
          (isAutoCalculatePage && this.detectChangesService.detectDiffAutoCalculationMatch(match, matchWaiting))
        );

        if (!_.isNil(newMatch)) {
          match.eventStatus = newMatch.eventStatus;
          match.halfTimeHomeScore = newMatch.halfTimeHomeScore;
          match.halfTimeAwayScore = newMatch.halfTimeAwayScore;
          match.finalHomeScore = newMatch.finalHomeScore;
          match.finalAwayScore = newMatch.finalAwayScore;
          match.isHalfTimeCal = newMatch.isHalfTimeCal;
          match.isCalculatingSingle = newMatch.isCalculatingSingle;
          match.isCalculatingMP = newMatch.isCalculatingMP;
          match.isCalculated = newMatch.isCalculated;
          match.isRefund = newMatch.isRefund;
          match.isCalRefund = newMatch.isCalRefund;
          match.earlySettleStatus = newMatch.earlySettleStatus;
          match.eventStatusColor = newMatch.eventStatusColor;
          match.newEventStatus = newMatch.newEventStatus;
          match.remark = newMatch.remark;
          match.suspenderHalfTime = newMatch.suspenderHalfTime;
          match.suspenderFullTime = newMatch.suspenderFullTime;
          match.exHalfTimeScore = newMatch.exHalfTimeScore;
          match.exFullTimeScore = newMatch.exFullTimeScore;
          match.showLink = this.backGroundService.isShowLink(newMatch);
          match.autoPayoutStatus = newMatch.autoPayoutStatus;
          match.fastMarketStatus = newMatch.fastMarketStatus;
          match.isExistMarkedTicket = newMatch.isExistMarkedTicket;
          match.isExistRunningTicket = newMatch.isExistRunningTicket;
          match.confirmFullTimeScore = newMatch.confirmFullTimeScore;
          match.confirmHalfTimeScore = newMatch.confirmHalfTimeScore;
          match.goalIcon = newMatch.goalIcon;
          match.isNotConsistentExHtScore = newMatch.isNotConsistentExHtScore;
          match.isNotConsistentExFtScore = newMatch.isNotConsistentExFtScore;
          if (isAutoCalculatePage) {
            this.mapNewestAutoCalculationMatch(match, newMatch);
          }
        }
      });
    });
  }

  private mapNewestAutoCalculationMatch(oldMatch: CalculationMatch, newMatch: CalculationMatch) {
    oldMatch.autoCalcSetting = newMatch.autoCalcSetting;
    oldMatch.instantScoreDiff = newMatch.instantScoreDiff;
    oldMatch.instantStatus = newMatch.instantStatus;
    oldMatch.instantStatusId = newMatch.instantStatusId;
    oldMatch.instantCalculationType = newMatch.instantCalculationType;
    oldMatch.isFtCalculated = newMatch.isFtCalculated;
    oldMatch.instantHomeScore = newMatch.instantHomeScore;
    oldMatch.instantAwayScore = newMatch.instantAwayScore;
    oldMatch.instantKey = newMatch.instantKey;
    oldMatch.liveAwayScore = newMatch.liveAwayScore;
    oldMatch.liveHomeScore = newMatch.liveHomeScore;
    oldMatch.directWaitingTime = newMatch.directWaitingTime;
    oldMatch.instantWaitingTime = newMatch.instantWaitingTime;
    oldMatch.referenceActions = newMatch.referenceActions;
  }
}