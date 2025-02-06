import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../../shared/material-module';
import { PipesModule } from '../../../shared/pipes/pipes.module.native';
import { ScorePipe } from '../../pipes/score.pipe';
import {
  FantasyComponent,
  GoalHistoryComponent,
  RefundChildMatchComponent,
  SoccerTicketCountComponent
} from '.';
import { CalculationComponent } from './calculation.component';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChildMatch, FantasyMatch, FantasyRelatedMatch, Match, MatchDetail, Score, UndoChecking } from './models/match.model';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { VerifyMatchService } from './services/verify-match.service';
import { RequestService } from './services/request.service';
import { VerifyActionService } from './services/verify-action.service';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { VerificationBaseService } from '../../services/verification-base.service';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { CalculateStorage } from '../../storage/calculate.storage';

describe('CalculationComponent', () => {
  let component: CalculationComponent;
  let fixture: ComponentFixture<CalculationComponent>;
  let requestService: RequestService;
  let storage: CalculateStorage;
  const matchDetail = {} as MatchDetail;
  matchDetail.matchId = 12345;
  matchDetail.eventStatus = "";
  const match: Match = {
    matchDetail,
    childMatches: [],
    permission: null,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: null,
    fantasyMatch: null,
  };

  const dialogMessage = new ModalDialogMessage();
  dialogMessage.title = Language.confirmationBox;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ModalDialogComponent,
        ModalContentDialogComponent,
        FormsModule,
        HttpClientModule,
        NgbModule,
        PipesModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        CalculationComponent,
        FantasyComponent,
        GoalHistoryComponent,
        RefundChildMatchComponent,
        SoccerTicketCountComponent,
        ScorePipe
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        RequestService,
        VerifyMatchService,
        DatePipe,
        HttpRequestService,
        BlockUIService,
        VerifyActionService,
        ToastContainerDirective,
        VerificationBaseService,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: ToastrService, useClass: ToastrService }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    storage = fixture.debugElement.injector.get(CalculateStorage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onResettleCheckboxChange - should check resettle checkbox', () => {
    component.onResettleCheckboxChange(true);

    expect(component.isReSettledTickets).toBe(true);
  });

  describe('isDisableCalculate', () => {
    it('should return false when match is pin goal match', () => {
      matchDetail.leagueGroupId = 113;
      component.matchDetail = matchDetail;

      const result = component.isDisableCalculate;

      expect(result).toBe(false);
    });

    it('should return true when match cannot be calculated', () => {
      matchDetail.leagueGroupId = 0;
      matchDetail.isInstant = true;
      matchDetail.hasInstantCompleted = true;
      matchDetail.playTime = 13;
      matchDetail.confirmHT = 0;
      component.matchDetail = matchDetail;

      const result = component.isDisableCalculate;

      expect(result).toBe(true);
    });

    it('should return false when match is ready to calculate', () => {
      matchDetail.isInstant = false;
      matchDetail.hasInstantCompleted = false;
      matchDetail.playTime = 53;
      matchDetail.confirmHT = 1;
      component.matchDetail = matchDetail;

      const result = component.isDisableCalculate;

      expect(result).toBe(false);
    });
  });

  describe('ticketStatusBackground (halfTime & fullTime)', () => {
    it('should return background calculated when status is calculated', () => {
      matchDetail.htStatus = 'Calculated';
      component.matchDetail = matchDetail;

      const result = component.halftimeTicketStatusBackground;

      expect(result).toEqual('bg-calculated');
    });

    it('should return background marked when status is marked', () => {
      matchDetail.ftStatus = 'Marked';
      component.matchDetail = matchDetail;

      const result = component.fullTimeTicketStatusBackground;

      expect(result).toEqual('bg-marked');
    });

    it('should return empty when status is running', () => {
      matchDetail.ftStatus = 'Running';
      component.matchDetail = matchDetail;

      const result = component.fullTimeTicketStatusBackground;

      expect(result).toEqual('');
    });
  });

  describe('isDisableFulltimeCalculate', () => {
    it('should return false when match is pin goal match', () => {
      matchDetail.leagueGroupId = 113;
      component.matchDetail = matchDetail;

      const result = component.isDisableFulltimeCalculate;

      expect(result).toBe(false);
    });

    it('should return true when match cannot be calculated', () => {
      matchDetail.leagueGroupId = 0;
      matchDetail.isHtOnly = true;
      matchDetail.htStatus = 'Running';
      matchDetail.playTime = 13;
      component.matchDetail = matchDetail;

      const result = component.isDisableFulltimeCalculate;

      expect(result).toBe(true);
    });

    it('should return false when match is ready to calculate', () => {
      matchDetail.isHtOnly = false;
      matchDetail.htStatus = 'Completed';
      matchDetail.playTime = 53;
      component.matchDetail = matchDetail;

      const result = component.isDisableFulltimeCalculate;

      expect(result).toBe(false);
    });
  });

  describe('isDisableFulltimeTextbox', () => {
    it('should return false when match is pin goal match', () => {
      matchDetail.leagueGroupId = 113;
      component.matchDetail = matchDetail;

      const result = component.isDisableFulltimeTextbox;

      expect(result).toBe(false);
    });

    it('should return isHtOnly when match is not pin goal', () => {
      matchDetail.leagueGroupId = 0;
      matchDetail.isHtOnly = true;
      component.matchDetail = matchDetail;

      const result = component.isDisableFulltimeTextbox;

      expect(result).toBe(true);
    });
  });

  it('autoFillFantasyMatch - should fill match score', () => {
    component.matchDetail = matchDetail;
    const score: Score = {
      halfTimeHomeScore: 1,
      halfTimeAwayScore: 2,
      finalHomeScore: 3,
      finalAwayScore: 4
    };

    storage.setFullTimeScore = jest.fn();
    storage.setHaftTimeScore = jest.fn();

    component.autoFillFantasyMatch(score);

    expect(storage.setFullTimeScore).toHaveBeenCalledWith('3', '4');
    expect(storage.setHaftTimeScore).toHaveBeenCalledWith('1', '2');
  });

  describe('getMatch', () => {
    it('should set toastr overlay', async () => {
      const setToastrOverlaySpy = jest.spyOn(storage, 'setToastrOverlay');
      requestService.getMatch = jest.fn().mockResolvedValue(match);

      await component.getMatch(12345);

      expect(setToastrOverlaySpy).toHaveBeenCalledWith(component.toastContainer);
    });

    it('should set match and match details', async () => {
      requestService.getMatch = jest.fn().mockResolvedValue(match);

      await component.getMatch(12345);

      expect(component.match).toEqual(match);
      expect(component.matchDetail).toEqual(match.matchDetail);
    });

    it('should set childMatches and hedgeMatchDetail', async () => {
      requestService.getMatch = jest.fn().mockResolvedValue(match);

      await component.getMatch(12345);

      expect(component.childMatches).toEqual(match.childMatches);
      expect(component.hedgeMatchDetail).toEqual(match.hedgeMatchDetail);
    });

    it('should set applyHedgeMatch', async () => {
      const isApplyHedgeMatchSpy = jest.spyOn(storage, 'isApplyHedgeMatch');
      requestService.getMatch = jest.fn().mockResolvedValue(match);

      await component.getMatch(12345);

      expect(isApplyHedgeMatchSpy).toHaveBeenCalled();
      expect(component.applyHedgeMatch).toEqual(isApplyHedgeMatchSpy.mock.results[0].value);
    });

    it('should set originalGoalRecord', async () => {
      requestService.getMatch = jest.fn().mockResolvedValue(match);

      await component.getMatch(12345);

      expect(component.matchDetail.originalGoalRecord).toEqual(match.matchDetail.goalRecord);
    });

    it('should set relatedMatches when isFantasyMatch is true', async () => {
      match.matchDetail.isFantasyMatch = true;
      match.fantasyMatch = { relatedMatches: [{ isDeleted: false }, { isDeleted: true }] } as unknown as FantasyMatch;
      requestService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

      await component.getMatch(12345);

      expect(component.relatedMatches).toEqual([{ isDeleted: false }]);
    });

    it('should set relatedMatches to empty array when isFantasyMatch is false', async () => {
      match.matchDetail.isFantasyMatch = false;
      requestService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

      await component.getMatch(12345);

      expect(component.relatedMatches).toEqual([]);
    });

    it('should reset home and away', async () => {
      const resetHomeAwaySpy = jest.spyOn(storage, 'resetHomeAway');
      requestService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

      await component.getMatch(12345);

      expect(resetHomeAwaySpy).toHaveBeenCalled();
    });
  });

  it('changeApplyHedgeMatch- should call setIsAppleHedgeMatch with applyHedgeMatch value', () => {
    const setIsAppleHedgeMatchSpy = jest.spyOn(storage, 'setIsAppleHedgeMatch');
    component.applyHedgeMatch = true;

    component.changeApplyHedgeMatch();

    expect(setIsAppleHedgeMatchSpy).toHaveBeenCalledWith(true);
  });
});

