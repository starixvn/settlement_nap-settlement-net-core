import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpRequestService } from '../../shared/services';
import { MatchWaitingRequest, SportMatch, Match } from '../models';
import { DetectChangesService } from './detect-changes.service';
import { SportMatchService } from './sport-match.service';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';
import { MatchWaiting } from '../models/match-waiting.model';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable()
export class RefreshMatchService {
  public permission: Permission;
  constructor(
    private readonly httpRequestService: HttpRequestService,
    private readonly detectChangesService: DetectChangesService,
    private readonly sportMatchService: SportMatchService
  ) { }

  public refreshMatches(currentSportMatches: SportMatch[], request: MatchWaitingRequest) {
    this.getMatches(request).subscribe((matchesWaiting: Match[]) => {
      this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting);
    });
  }

  private getMatches(param: MatchWaitingRequest) {
    const url = `/api/multi-sports/auto-refresh`;
    return this.httpRequestService.postMessagePack(param, url, false);
  }

  private changeInfoAfterRefreshMatches(currentSportMatches: SportMatch[], matches: Match[]) {
    for (const sport of currentSportMatches) {
      sport.leagues.forEach((league, leagueIndex) => {
        league.matches.forEach((match, matchIndex) => {
          const newMatch = _.find(matches, (matchWaiting: MatchWaiting) =>
            this.detectChangesService.detect(match, matchWaiting)
          );
          if (!_.isNil(newMatch)) {
            sport.leagues[leagueIndex].matches[matchIndex] = { ...match, ...newMatch };
          }
        })
      });
    }
  }
}
