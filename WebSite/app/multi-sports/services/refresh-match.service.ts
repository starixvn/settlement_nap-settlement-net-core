import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpRequestService } from '../../shared/services';
import { MatchWaitingRequest, MultiSport, SportMatch, Match } from '../models';
import { DetectChangesService } from './detect-changes.service';
import { HandleActionsService } from './handle-actions.service';
import { SportMatchService } from './sport-match.service';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';
@Injectable()
export class RefreshMatchService {
  public permission: Permission;
  constructor(
    private readonly httpRequestService: HttpRequestService,
    private readonly detectChangesService: DetectChangesService,
    private readonly handleActionsService: HandleActionsService,
    private readonly sportMatchService: SportMatchService
  ) { }

  public refreshMatches(currentSportMatches: SportMatch[], request: MatchWaitingRequest, multiSport: MultiSport) {
    this.getMatches(request).subscribe((matchesWaiting: Match[]) => {
      this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting, multiSport);
    });
  }

  private getMatches(param: MatchWaitingRequest) {
    const url = `api/multi-sports/auto-refresh`;
    return this.httpRequestService.postMessagePack(param, url, false);
  }

  private changeInfoAfterRefreshMatches(currentSportMatches: SportMatch[], matches: Match[], multiSport: MultiSport) {
    currentSportMatches.forEach((sport) =>
      sport.leagues.forEach((league) => {
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
            match.betStatus = newMatch.betStatus;
            match.isHalfTimeCal = newMatch.isHalfTimeCal;
            match.isCalculatingSingle = newMatch.isCalculatingSingle;
            match.isCalculatingMP = newMatch.isCalculatingMP;
            match.isCalculated = newMatch.isCalculated;
            match.isMultiCaled = newMatch.isMultiCaled;
            match.isRefund = newMatch.isRefund;
            match.isCalRefund = newMatch.isCalRefund;
            match.earlySettleStatus = newMatch.earlySettleStatus;
            match.isExistRunningTicket = newMatch.isExistRunningTicket;
            match.isExistMarkedTicket = newMatch.isExistMarkedTicket;
            match.moreScores = newMatch.moreScores;
            match.eventStatusColor = newMatch.eventStatusColor;
            match.newEventStatus = newMatch.newEventStatus;
            match.isHavingIntervalScore = newMatch.isHavingIntervalScore;
            match.remark = newMatch.remark;
            match.autoCalcSetting = newMatch.autoCalcSetting;
            match.suspenderHalfTime = newMatch.suspenderHalfTime;
            match.suspenderFullTime = newMatch.suspenderFullTime;
            match.isNotConsistentExFtScore = newMatch.isNotConsistentExFtScore;
            match.isNotConsistentExHtScore = newMatch.isNotConsistentExHtScore;
            match.exHalfTimeScore = newMatch.exHalfTimeScore;
            match.exFullTimeScore = newMatch.exFullTimeScore;
            match.autoPayoutStatus = newMatch.autoPayoutStatus;
            match.confirmFullTimeScore = newMatch.confirmFullTimeScore;
            match.confirmHalfTimeScore = newMatch.confirmHalfTimeScore;
            this.sportMatchService.getMatchIntervalScore(match, this.permission);
          }
        });
      })
    );
  }
}
