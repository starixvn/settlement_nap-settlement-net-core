import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { SettleQuery } from './models/query.model';
import { VerificationBaseService } from '../../services/verification-base.service';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { BetStatus, ResourceIds } from '../../constants';
import { ResultDetail } from '../../models';
import { SettlementStatusId } from '../../../shared/constants';

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
    isExistFG: false,
    isExistHTFG: false,
    betStatus: '',
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
        ToastrModule.forRoot(),
        ResettleCheckerComponent,
        NotReadyMatchComponent,
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
    requestService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

    await component.getMatch(12345);

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
      verifyActionService.verifyFirstHalf = jest.fn().mockReturnValue(Promise.resolve('errorMessage'));
      toastrService.clear = jest.fn();

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
      verifyActionService.verifyFirstHalf = jest.fn().mockReturnValue('errorMessage');
      toastrService.error = jest.fn();

      component.calculateHalfTime();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFirstHalf = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFirstHalf = jest.fn().mockReturnValue(true);
      messageBoxService.confirm = jest.fn();


      component.calculateHalfTime();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFirstHalf = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFirstHalf = jest.fn().mockReturnValue(true);


      component.calculateHalfTime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBeTruthy();
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFirstHalf = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFirstHalf = jest.fn().mockReturnValue(false);
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue(Promise.resolve('errorMessage'));
      toastrService.clear = jest.fn();

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
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue('errorMessage');
      toastrService.error = jest.fn();

      component.calculateFullTime();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(true);
      messageBoxService.confirm = jest.fn();


      component.calculateFullTime();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(true);

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
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(false);
      messageBoxService.confirm = jest.fn();
      const expectedMessage = `${Language.doubleCheckCalculateFullTime}${Language.soccer.confirmAutoRefundChildMatch}`;

      component.calculateFullTime();
      tick();

      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyFullTime = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedFullTime = jest.fn().mockReturnValue(false);
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
      verifyActionService.verifyAll = jest.fn().mockReturnValue(Promise.resolve('errorMessage'));
      toastrService.clear = jest.fn();

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
      verifyActionService.verifyAll = jest.fn().mockReturnValue('errorMessage');
      toastrService.error = jest.fn();

      component.calculateAll();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith('errorMessage');
    }));

    it('should show confirm when score lastest changed', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyAll = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedAll = jest.fn().mockReturnValue(true);
      messageBoxService.confirm = jest.fn();


      component.calculateAll();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('resettle should be true when score lastest changed and click yes', fakeAsync(() => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyAll = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedAll = jest.fn().mockReturnValue(true);


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
      verifyActionService.verifyAll = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedAll = jest.fn().mockReturnValue(false);
      messageBoxService.confirm = jest.fn();
      const expectedMessage = `${Language.doubleCheckCalculateAll}${Language.soccer.confirmAutoRefundChildMatch}`;

      component.calculateAll();
      tick();

      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should calculate match when pass two confirm box', fakeAsync(async () => {
      component.matchDetail = matchDetail;
      verifyActionService.verifyAll = jest.fn().mockReturnValue('');
      verifyActionService.isScoreChangedAll = jest.fn().mockReturnValue(false);
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
      requestService.undoCheckingScore = jest.fn().mockReturnValue(Promise.resolve(undoCheckingScore));
      requestService.pushInstantScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
      requestService.undoCheckingScore = jest.fn().mockReturnValue(Promise.resolve(undoCheckingScore));
      requestService.pushInstantScore = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();

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
      requestService.undoCheckingScore = jest.fn().mockReturnValue(Promise.resolve(undoCheckingScore));
      messageBoxService.confirm = jest.fn();

      component.unCalcInstant();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(component.dialogMessage.message).toEqual(expectedMessage);
    }));

    it('should show alert when checking score return error', async () => {
      component.matchDetail = matchDetail;
      undoCheckingScore.errCode = 1;
      undoCheckingScore.errMsg = 'Message';
      requestService.undoCheckingScore = jest.fn().mockReturnValue(Promise.resolve(undoCheckingScore));
      toastrService.error = jest.fn();

      await component.unCalcInstant();

      expect(toastrService.error).toHaveBeenCalledWith('Message');
    });

  });

  describe('unCalculate', () => {


    it('should calculate match when pass two confirm box', fakeAsync(() => {
      component.matchDetail = matchDetail;
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();

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
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      closePopupService.closePopup = jest.fn();
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
      toastrService.clear = jest.fn();

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


  describe('unCalculateFT', () => {
    it('should show error when match is Abandoned 1H', () => {
      matchDetail.betStatus = BetStatus.abandoned1H;
      component.matchDetail = matchDetail;
      component.match = match;
      toastrService.error = jest.fn();

      component.unCalculateFT();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should show error when match is Refund ALL', () => {
      const resultDetailHalfTime = new ResultDetail();
      resultDetailHalfTime.settlementStatusId = SettlementStatusId.Refund;
      resultDetailHalfTime.resourceId = ResourceIds.halfTime;
      matchDetail.betStatus = `Refund; 1-2`;
      match.resultDetails = [resultDetailHalfTime];
      component.matchDetail = matchDetail;
      component.match = match;
      toastrService.error = jest.fn();

      component.unCalculateFT();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should uncalculate match when pass two confirm box', fakeAsync(() => {
      matchDetail.betStatus = '';
      component.matchDetail = matchDetail;
      component.match = match;
      requestService.calculate = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      closePopupService.closePopup = jest.fn();

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
  });
});

