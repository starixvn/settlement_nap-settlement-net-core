import { LeagueMatch, Match, MatchWaitingRequest, MultiSport, SportMatch} from '../models';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { TestBed } from '@angular/core/testing';

import { RefreshMatchService } from './refresh-match.service';
import { DetectChangesService } from './detect-changes.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { MultiSportService } from './multi-sport.service';
import { HandleActionsService } from './handle-actions.service';
import { MixParlay, MoreScore, Remark, Score } from '../../shared/models';
import { SportType } from '../../shared/constants';
import { Permission } from '../../shared/models/sportsbook-sop/permission.model';
import { SportMatchService } from './sport-match.service';

describe('MultiSport - RefreshMatchService', () => {
  let httpRequestService: HttpRequestService;
  let refreshMatchService: RefreshMatchService;
  let detectChangesService: DetectChangesService;
  let handleActionsService: HandleActionsService;
  const match = new Match();
  match.matchId = '12345';
  match.sportType = SportType.badminton;
  const newMatch = new Match();
  newMatch.matchId = '12345';
  newMatch.sportType = SportType.badminton;
  newMatch.moreScores = new MoreScore(),
  newMatch.moreScores.sets = [new Score('1', '0', '')];
  newMatch.intervalScore = [new Score('1', '0', '')];
  newMatch.betStatus = '';
  newMatch.earlySettleStatus = '';
  newMatch.eventStatus = '';
  newMatch.eventStatusColor = '';
  newMatch.finalAwayScore = 0;
  newMatch.finalHomeScore = 0;
  newMatch.halfTimeAwayScore = 0;
  newMatch.halfTimeHomeScore = 0;
  newMatch.isCalRefund = false;
  newMatch.isCalculated = false;
  newMatch.isCalculatingMP = 0;
  newMatch.isCalculatingSingle = 0;
  newMatch.isExistMarkedTicket = false;
  newMatch.isExistMarkedTicketParlay = false;
  newMatch.isExistRunningTicket = false;
  newMatch.isHalfTimeCal = false;
  newMatch.isHavingIntervalScore = true;
  newMatch.isMultiCaled = false;
  newMatch.isRefund = false;
  newMatch.mixParlay = new MixParlay();
  newMatch.newEventStatus = '';
  newMatch.remark = new Remark();
  newMatch.suspenderFullTime = '';
  newMatch.suspenderHalfTime = '';
  newMatch.autoPayoutStatus = 1;
  newMatch.confirmFullTimeScore = "1";
  newMatch.confirmHalfTimeScore = "2";
  newMatch.exFullTimeScore = "1";
  newMatch.exHalfTimeScore = "2";
  newMatch.isExistRunningTicketParlay = true;
  newMatch.isNotConsistentExFtScore = true;
  newMatch.isNotConsistentExHtScore = true;
  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: 'mock league',
    collapse: false,
    isCheckedCalcMP: false,
    disableCheckCalcMP: false,
    isMergedParlay: true,
    isAutoPayoutForLeague: false
  };

  const sport: SportMatch = {
    id: SportType.badminton,
    name: 'mock sport',
    leagues: [league],
    collapse: false,
  };

  const multiSport: MultiSport = {
    sports: [sport],
    permission: new Permission(),
    isCheckedCalcMP: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        HttpRequestService,
        RefreshMatchService,
        MultiSportService,
        BlockUIService,
        MessageBoxService,
        DetectChangesService,
        HandleActionsService,
        SportMatchService
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    httpRequestService = TestBed.inject(HttpRequestService);
    refreshMatchService = TestBed.inject(RefreshMatchService);
    detectChangesService = TestBed.inject(DetectChangesService);
    handleActionsService = TestBed.inject(HandleActionsService);
  });

  it('should be created', () => {
    expect(refreshMatchService).toBeTruthy();
  });

  describe('refreshMatchces', () => {
    it('should do nothing when new match has no change', () => {
      spyOn(httpRequestService, 'postMessagePack').and.returnValue(of([newMatch]));
      spyOn(detectChangesService, 'detect').and.returnValue(false);

      refreshMatchService.refreshMatches([sport], new MatchWaitingRequest('', '', '', '' ,'',''), multiSport);

      expect(match).not.toEqual(newMatch);
    });

    it('should change match when match has been updated', () => {
        spyOn(httpRequestService, 'postMessagePack').and.returnValue(of([newMatch]));
        spyOn(detectChangesService, 'detect').and.returnValue(true);
        spyOn(handleActionsService, 'resetCheckboxCalcMixParlay');

        refreshMatchService.refreshMatches([sport], new MatchWaitingRequest('', '', '', '','',''), multiSport);

        expect(match).toEqual(newMatch);
        expect(handleActionsService.resetCheckboxCalcMixParlay).toHaveBeenCalled();
    });
  });
});
