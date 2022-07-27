import { Injectable } from "@angular/core";
import { FilterQuery, League, Matches } from "../models";
import { Observable } from "rxjs";
import { HttpRequestService } from "../../shared/services";
import { ChangeSettingResult, DateFilter, Match } from "../../shared/models";
import * as _ from 'lodash';
import { BackGroundService } from "./back-ground.service";
import { DetectChangesService } from "./detect-changes.service";
@Injectable()
export class CalculatePageService {
  private calculationApi = 'api/calculation';

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

  public search(params: FilterQuery): Observable<Matches> {
    const url = `${this.calculationApi}/filter`;
    return this.httpRequestService.postJson(params, url);
  }


  public getRemarkInfo(matchId: string): Observable<ChangeSettingResult> {
    const query = {
      matchId
    };

    return this.httpRequestService.postJson(query, `api/setting/get-remark-info`);
  }

  private getNewestMatches(leagueId: string) {
    const query = {
      leagueId
    };
    const url = `${this.calculationApi}/auto-refresh`;
    return this.httpRequestService.postJson(query,url, false);
  }

  public refreshMatches(leagueId: string, currentLeagues: League[]) {
    this.getNewestMatches(leagueId).subscribe((matchesWaiting: Match[]) => {
      this.changeInfoAfterRefreshMatches(currentLeagues, matchesWaiting);
    });
  }

  private changeInfoAfterRefreshMatches(currentLeagues: League[], matches: Match[]) {
    currentLeagues.forEach((league) =>{
        league.matches.forEach((match) => {
          const newMatch = _.find(matches, (matchWaiting: Match) =>
            this.detectChangesService.detect(match, matchWaiting)
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
            match.autoSettleFastMarket = newMatch.autoSettleFastMarket;
            match.isExistMarkedTicketParlay = newMatch.isExistMarkedTicketParlay;
            match.isExistMarkedTicket = newMatch.isExistMarkedTicket;
          }
        });
      });
  }
}