import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentDialogComponent, ModalDialogComponent, NotReadyMatchComponent, ResettleCheckerComponent } from '../../../shared/components';
import { MaterialModule } from '../../../shared/material-module';
import { PipesModule } from '../../../shared/pipes/pipes.module.native';
import { ScorePipe } from '../../pipes/score.pipe';
import {
  CalculationMatchDetailComponent,
  FantasyComponent,
  GoalHistoryComponent,
  RefundChildMatchComponent,
  SoccerTicketCountComponent
} from '.';
import { CalculationComponent } from './calculation.component';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChildMatch, Match, MatchDetail, Score, UndoChecking } from './models/match.model';
import { of } from 'rxjs';
import { VerifyMatchService } from './services/verify-match.service';
import { RequestService } from './services/request.service';
import { VerifyActionService } from './services/verify-action.service';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language';
import { SettleQuery } from './models/query.model';
import { VerificationBaseService } from '../../services/verification-base.service';

describe('CalculationComponent', () => {
  let component: CalculationComponent;
  let fixture: ComponentFixture<CalculationComponent>;
  let requestService: RequestService;
  let verifyActionService: VerifyActionService;
  let messageBoxService: MessageBoxService;
  let toastrService: ToastrService;
  let closePopupService: ClosePopupService;
  const buttonName = "btn-danger";
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

  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  }
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: 'errorMessage',
    isSuccessful: false,
  };

  const undoCheckingScore: UndoChecking = {
    homeScore: "1",
    awayScore: "1",
    goalRecord: '',
    isHt: false,
    instantKey: 0,
    firstGoalValue: '',
    errCode: 0,
    errMsg: '',
  }

  const childMatch: ChildMatch = {
    matchId: 1,
    matchCode: '',
    isExistMarkedTicket: false,
    isExistRunningTicket: false,
    isRefund: '',
    eventStatus: '',
    eventStatusColor: '',
    betStatus: '',
    checked: true,
    isPending: false,
    homeName: '',
    awayName: ''
  }

  const dialogMessage = new ModalDialogMessage();
  dialogMessage.title = Language.confirmationBox;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        PipesModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [
        CalculationComponent,
        CalculationMatchDetailComponent,
        FantasyComponent,
        GoalHistoryComponent,
        RefundChildMatchComponent,
        SoccerTicketCountComponent,
        ScorePipe,
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
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
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    verifyActionService = fixture.debugElement.injector.get(VerifyActionService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    closePopupService = fixture.debugElement.injector.get(ClosePopupService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should get match information', async () => {
    spyOn(requestService, 'getMatch').and.returnValue(of(match));

    await component.getMatch(12345, '');

    expect(component.matchDetail.matchId).toEqual(12345);
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

  describe('ticketStatusBackgrond (halfTime & fullTime)', () => {
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

    component.autoFillFantasyMatch(score);

    expect(component.matchDetail.halfTimeHomeScore).toEqual(1);
    expect(component.matchDetail.halfTimeAwayScore).toEqual(2);
    expect(component.matchDetail.finalHomeScore).toEqual(3);
    expect(component.matchDetail.finalAwayScore).toEqual(4);
  });

  describe('calculateHalfTime', () => {
    it('should clear all warning', fakeAsync(() => {
      matchDetail.isWarningHalfTimeHomeScore = true;
      matchDetail.isWarningHalfTimeAwayScore = true;
      matchDetail.isWarningFinalHomeScore = true;
      matchDetail.isWarningFinalAwayScore = true;
      matchDetail.isWarningGoalRecord = true;
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFirstHalf').and.returnValue(of('errorMessage'));
      spyOn(toastrService, 'clear');

      component.calculateHalfTime();
      tick();

      expect(component.matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningGoalRecord).toBeFalsy();
      expect(toastrService.clear).toHaveBeenCalled();
      flush();
    }));
    it('should set error message when verify service return message', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFirstHalf').and.returnValue('errorMessage');
      spyOn(toastrService, 'error');

      component.calculateHalfTime();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFirstHalf').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFirstHalf').and.returnValue(true);
      spyOn(messageBoxService, 'confirm');


      component.calculateHalfTime();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFirstHalf').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFirstHalf').and.returnValue(true);


      component.calculateHalfTime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBeTruthy();
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFirstHalf').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFirstHalf').and.returnValue(false);
      spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      await component.calculateHalfTime();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
    }));
  });

  describe('calculateFullTime', () => {
    it('should clear all warning ', fakeAsync(() => {
      matchDetail.isWarningHalfTimeHomeScore = true;
      matchDetail.isWarningHalfTimeAwayScore = true;
      matchDetail.isWarningFinalHomeScore = true;
      matchDetail.isWarningFinalAwayScore = true;
      matchDetail.isWarningGoalRecord = true;
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue(of('errorMessage'));
      spyOn(toastrService, 'clear');

      component.calculateFullTime();
      tick();

      expect(component.matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningGoalRecord).toBeFalsy();
      expect(toastrService.clear).toHaveBeenCalled();
      flush();
    }));
    it('should set error message when verify service return message', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue('errorMessage');
      spyOn(toastrService, 'error');

      component.calculateFullTime();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFullTime').and.returnValue(true);
      spyOn(messageBoxService, 'confirm');


      component.calculateFullTime();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFullTime').and.returnValue(true);

      component.calculateFullTime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBeTruthy();
    }));

    it('should show confirm with child match when exist child match select', fakeAsync(() => {
      component.matchDetail = matchDetail;
      childMatch.checked = true;
      component.childMatches = [childMatch];
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFullTime').and.returnValue(false);
      spyOn(messageBoxService, 'confirm');
      const expectedMessage = `${Language.doubleCheckCalculateFullTime}${Language.soccer.confirmAutoRefundChildMatch}`;

      component.calculateFullTime();
      tick();

      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyFullTime').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedFullTime').and.returnValue(false);
      spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      await component.calculateFullTime();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
    }));
  });

  describe('calculateAll', () => {
    it('should clear all warning ', fakeAsync(() => {
      matchDetail.isWarningHalfTimeHomeScore = true;
      matchDetail.isWarningHalfTimeAwayScore = true;
      matchDetail.isWarningFinalHomeScore = true;
      matchDetail.isWarningFinalAwayScore = true;
      matchDetail.isWarningGoalRecord = true;
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyAll').and.returnValue(of('errorMessage'));
      spyOn(toastrService, 'clear');

      component.calculateAll();
      tick();

      expect(component.matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningGoalRecord).toBeFalsy();
      expect(toastrService.clear).toHaveBeenCalled();
      flush();
    }));
    it('should set error message when verify service return message', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyAll').and.returnValue('errorMessage');
      spyOn(toastrService, 'error');

      component.calculateAll();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyAll').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedAll').and.returnValue(true);
      spyOn(messageBoxService, 'confirm');


      component.calculateAll();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyAll').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedAll').and.returnValue(true);


      component.calculateAll();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBeTruthy();
    }));

    it('should show confirm with child match when exist child match select', fakeAsync(() => {
      component.matchDetail = matchDetail;
      childMatch.checked = true;
      component.childMatches = [childMatch];
      spyOn(verifyActionService, 'verifyAll').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedAll').and.returnValue(false);
      spyOn(messageBoxService, 'confirm');
      const expectedMessage = `${Language.doubleCheckCalculateAll}${Language.soccer.confirmAutoRefundChildMatch}`;

      component.calculateAll();
      tick();

      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      spyOn(verifyActionService, 'verifyAll').and.returnValue('');
      spyOn(verifyActionService, 'isScoreChangedAll').and.returnValue(false);
      spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      await component.calculateAll();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
    }));
  });

  describe('unCalcInstant', () => {
    it('should undo instant when pass confirm box', fakeAsync(() => {
      component.matchDetail = matchDetail;
      undoCheckingScore.errCode = 0;
      undoCheckingScore.errMsg = '';
      spyOn(requestService, 'undoCheckingScore').and.returnValue(of(undoCheckingScore));
      spyOn(requestService, 'pushInstantScore').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.unCalcInstant();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.pushInstantScore).toHaveBeenCalled();
    }));

    it('should show error when undo instant fail', fakeAsync(() => {
      component.matchDetail = matchDetail;
      undoCheckingScore.errCode = 0;
      undoCheckingScore.errMsg = '';
      spyOn(requestService, 'undoCheckingScore').and.returnValue(of(undoCheckingScore));
      spyOn(requestService, 'pushInstantScore').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.unCalcInstant();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should call confirm with correct message', fakeAsync(() => {
      component.matchDetail = matchDetail;
      undoCheckingScore.errCode = 0;
      undoCheckingScore.errMsg = '';
      undoCheckingScore.homeScore = '1';
      undoCheckingScore.awayScore = '1';
      undoCheckingScore.isHt = true;
      undoCheckingScore.goalRecord = 'ha';
      const expectedMessage = `${Language.soccer.confirmUnCalcInstant} <b>1-1 [HA] (HT)</b>`;
      spyOn(requestService, 'undoCheckingScore').and.returnValue(of(undoCheckingScore));
      spyOn(messageBoxService, 'confirm');

      component.unCalcInstant();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should show alert when checking score return error', async () => {
      component.matchDetail = matchDetail;
      undoCheckingScore.errCode = 1;
      undoCheckingScore.errMsg = 'Message';
      spyOn(requestService, 'undoCheckingScore').and.returnValue(of(undoCheckingScore));
      spyOn(toastrService, 'error');

      await component.unCalcInstant();

      expect(toastrService.error).toHaveBeenCalledWith('Message');
    });

  });

  describe('unCalculate', () => {


    it('should calculate match when pass two confirm box', fakeAsync(() => {
      component.matchDetail = matchDetail;
      spyOn(requestService, 'calculate').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.unCalculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalled();
    }));

    it('should show alert match when calculate return unsuccess', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      spyOn(requestService, 'calculate').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      await component.unCalculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    }));

    it('should call calculate correct params', fakeAsync(() => {
      component.matchDetail = matchDetail;
      component.applyHedgeMatch = false;
      component.isReSettledTickets = false;
      spyOn(requestService, 'calculate').and.returnValue(of(unSuccessfulResult));
      spyOn(closePopupService, 'closePopup');
      const query = new SettleQuery(matchDetail, 0, 'UNDO', false, null);

      component.unCalculate();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(requestService.calculate).toHaveBeenCalledWith(query);
      flush();
    }));

    it('should clear all warning', fakeAsync(() => {
      matchDetail.isWarningHalfTimeHomeScore = true;
      matchDetail.isWarningHalfTimeAwayScore = true;
      matchDetail.isWarningFinalHomeScore = true;
      matchDetail.isWarningFinalAwayScore = true;
      matchDetail.isWarningGoalRecord = true;
      component.matchDetail = matchDetail;
      spyOn(toastrService, 'clear');

      component.unCalculate();
      tick();

      expect(component.matchDetail.isWarningHalfTimeAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningHalfTimeHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalHomeScore).toBeFalsy();
      expect(component.matchDetail.isWarningFinalAwayScore).toBeFalsy();
      expect(component.matchDetail.isWarningGoalRecord).toBeFalsy();
      expect(toastrService.clear).toHaveBeenCalled();
      flush();
    }));
  });
});

