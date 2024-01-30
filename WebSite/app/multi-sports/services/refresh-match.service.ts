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

  public refreshMatches(currentSportMatches: SportMatch[], request: MatchWaitingRequest, refreshedCount: BehaviorSubject<number>) {
    this.getMatches(request).subscribe((matchesWaiting: Match[]) => {
      this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting, refreshedCount);
    });
  }

  private getMatches(param: MatchWaitingRequest) {
    const url = `/api/multi-sports/auto-refresh`;
    return this.httpRequestService.postMessagePack(param, url, false);
  }

  private changeInfoAfterRefreshMatches(currentSportMatches: SportMatch[], matches: Match[], refreshedCount: BehaviorSubject<number>) {
    let isHasChanged = false;
    currentSportMatches.forEach((sport) =>
      sport.leagues.forEach((league) => {
        league.matches.forEach((match) => {
          const newMatch = _.find(matches, (matchWaiting: MatchWaiting) =>
            this.detectChangesService.detect(match, matchWaiting)
          );
          if (!_.isNil(newMatch)) {
            match = { ...match, ...newMatch};
            isHasChanged = true;
            this.sportMatchService.getMatchIntervalScore(match, this.permission);
          }
        });
      })
    );

    if(isHasChanged){
    refreshedCount.next(refreshedCount.value + 1 );
    }
  }
}
