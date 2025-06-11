import { ChangeDetectorRef, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpRequestService } from '../../shared/services';
import { MatchRequest, SportMatch, Match } from '../models';
import { DetectChangesService } from './detect-changes.service';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';
import { MatchWaiting } from '../models/match-waiting.model';
import { MatchState } from '../models/match-state.model';
import { MultiSportsStore } from './multi-sports.store';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { MatchStateService } from './match-state.service';
@Injectable()
export class RefreshMatchService {
  public permission: Permission;
  constructor(
    private readonly httpRequestService: HttpRequestService,
    private readonly detectChangesService: DetectChangesService,
    private readonly matchStateService: MatchStateService,
    private readonly store: MultiSportsStore) { }

  async refreshMatches(currentSportMatches: SportMatch[], request: MatchRequest) {
    await this.getMatches(request).then((matchesWaiting: MatchWaiting[]) => {
      this.changeInfoAfterRefreshMatches(currentSportMatches, matchesWaiting);
    });
  }

  async getMatches(param: MatchRequest) {
    const url = `/api/multi-sports/auto-refresh`;
    const task = this.httpRequestService.postMessagePack(param, url, false);
    return firstValueFrom(task);
  }

  private changeInfoAfterRefreshMatches(currentSportMatches: SportMatch[], matches: MatchWaiting[]) {
    console.log('currentSportMatches', currentSportMatches);
    console.log('MatchWaiting', matches);
    for (const sport of currentSportMatches) {
      sport.leagues.forEach((league, leagueIndex) => {
        league.matches.forEach((match, matchIndex) => {
          const newMatch = _.find(matches, (matchWaiting: MatchWaiting) =>
            this.detectChangesService.detect(match, matchWaiting)
          );
          if (!_.isNil(newMatch)) {
            const updatedMatch = { ...newMatch, hasFailedResource: newMatch.failedAutoResourcesIds.length > 0 && newMatch.failedAutoResourcesIds.some(id => match.resourceIdsHasTicket.includes(id)) };
            console.log('updatedMatch', updatedMatch);
            sport.leagues[leagueIndex].matches[matchIndex] = { ...match, ...updatedMatch };
          }
        })
      });
    }
  }

  refreshMatch(state$: BehaviorSubject<MatchState>, match: Match) {
    state$.next(new MatchState(this.matchStateService, match, this.store));
  }
}
