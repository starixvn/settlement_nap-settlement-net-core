import { ChangeDetectorRef, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpRequestService } from '../../shared/services';
import { MatchRequest, SportMatch, Match } from '../models';
import { DetectChangesService } from './detect-changes.service';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';
import { MatchWaiting } from '../models/match-waiting.model';
import { MatchState } from '../models/match-state.model';
import { MultiSportsStore } from './multi-sports.store';
import { BehaviorSubject } from 'rxjs';
import { MatchStateService } from './match-state.service';
@Injectable()
export class RefreshMatchService {
  public permission: Permission;
  constructor(
    private readonly httpRequestService: HttpRequestService,
    private readonly detectChangesService: DetectChangesService,
    private readonly matchStateService: MatchStateService,
    private readonly store: MultiSportsStore) { }

  refreshMatches(currentSportMatches: SportMatch[], request: MatchRequest) {
    this.getMatches(request).subscribe((matchesWaiting: MatchWaiting[]) => {
      this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting);
    });
  }

  getMatches(param: MatchRequest) {
    const url = `/api/multi-sports/auto-refresh`;
    return this.httpRequestService.postMessagePack(param, url, false);
  }

  private changeInfoAfterRefreshMatches(currentSportMatches: SportMatch[], matches: MatchWaiting[]) {
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

  refreshMatch(state$: BehaviorSubject<MatchState>, match: Match) {
    state$.next(new MatchState(this.matchStateService, match, this.store));
  }
}
