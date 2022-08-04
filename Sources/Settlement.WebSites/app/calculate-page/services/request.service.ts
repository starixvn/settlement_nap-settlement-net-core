import { Injectable } from "@angular/core";
import { FilterQuery, League, Calculation, UpdateInstantQuery, MatchGoalRecord, CalculationMatch } from "../models";
import { Observable } from "rxjs";
import { HttpRequestService } from "../../shared/services";
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ChangeSettingResult, DateFilter, Result } from "../../shared/models";
import * as _ from 'lodash';
import { BackGroundService } from "./back-ground.service";
import { DetectChangesService } from "./detect-changes.service";
@Injectable()
export class RequestService {
  private calculationApi = 'api/calculation';
  private settingApi = 'api/setting';
  private soccerApi = 'api/soccer';

  constructor(private readonly httpRequestService: HttpRequestService,
    private readonly backGroundService: BackGroundService,
    private readonly detectChangesService: DetectChangesService) { }

  public getLeague(params: object) {
    return this.httpRequestService.postJson(params, `${this.calculationApi}/get-League`, false);
  }

  public getDate(): Observable<DateFilter> {
    const url = `api/multi-sports/get-date`;
    return this.httpRequestService.getJson(url);
  }

  public search(params: FilterQuery): Observable<Calculation> {
    const url = `${this.calculationApi}/filter`;
    return this.httpRequestService.postJson(params, url);
  }

  public searchAutoCalculation(params: FilterQuery): Observable<Calculation> {
    const url = `${this.calculationApi}/filter-auto-calculate`;
    return this.httpRequestService.postJson(params, url);
  }

  public getRemarkInfo(matchId: string): Observable<ChangeSettingResult> {
    const query = {
      matchId
    };

    return this.httpRequestService.postJson(query, `${this.settingApi}/get-remark-info`);
  }

  private getNewestMatches(leagueId: string, isAutoCalculatePage: boolean) {
    const query = {
      leagueId,
      isAutoCalculatePage
    };
    const url = `${this.calculationApi}/auto-refresh`;
    return this.httpRequestService.postJson(query, url, false);
  }

  public refreshMatches(leagueId: string, currentLeagues: League[], isAutoCalculatePage = false) {
    this.getNewestMatches(leagueId, isAutoCalculatePage).subscribe((matchesWaiting: CalculationMatch[]) => {
      this.changeInfoAfterRefreshMatches(currentLeagues, matchesWaiting, isAutoCalculatePage);
    });
  }

  public getMatchDetail(matchId: number) {
    const url = `api/fast-market/get-match`;
    const query = { matchId };
    return this.httpRequestService.postJson(query, url);
  }

  public updateSettingMatch(query: AutoSettingMatchQuery): Observable<Result> {
    return this.httpRequestService.postJson(query, `${this.settingApi}/update-setting-match`);
  }

  public updateSettingLeague(query: AutoSettingLeagueQuery): Observable<Result> {
    return this.httpRequestService.postJson(query, `${this.settingApi}/update-setting-league`);
  }

  public updateInstantStatus(query: UpdateInstantQuery): Observable<MatchGoalRecord> {
    return this.httpRequestService.postJson(query, `${this.soccerApi}/match-checking`);
  }

  public pushInstantStatus(query: UpdateInstantQuery, result: MatchGoalRecord): Observable<Result> {
    query.isExistFgNg = result.isExistFgNg;
    query.isExistHtFgNg = result.isExistHtFgNg;
    query.goalRecord = result.goalRecord;
    return this.httpRequestService.postJson(query, `${this.soccerApi}/push-instant-score`);
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
          //match.autoCalcSetting = newMatch.autoCalcSetting;
          match.suspenderHalfTime = newMatch.suspenderHalfTime;
          match.suspenderFullTime = newMatch.suspenderFullTime;
          match.mixParlay = newMatch.mixParlay;
          match.exHalfTimeScore = newMatch.exHalfTimeScore;
          match.exFullTimeScore = newMatch.exFullTimeScore;
          match.showLink = this.backGroundService.isShowLink(newMatch);
          match.autoPayoutStatus = newMatch.autoPayoutStatus;
          match.fastMarketStatus = newMatch.fastMarketStatus;
          match.isExistMarkedTicket = newMatch.isExistMarkedTicket;
          match.isExistRunningTicket = newMatch.isExistRunningTicket;
          match.isExistMarkedTicketParlay = newMatch.isExistMarkedTicketParlay;
          match.isExistRunningTicketParlay = newMatch.isExistRunningTicketParlay;
          match.goalIcon = newMatch.goalIcon;
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
    oldMatch.isFTCalculated = newMatch.isFTCalculated;
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