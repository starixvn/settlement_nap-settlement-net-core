import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AioService, MessageBoxService } from '../../shared/services';

declare const jest: any;

import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { CalculationActionsComponent } from './calculation-actions.component';
import { VerificationService } from '../services/verification.service';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { EarlyConstraintService } from '../services/early-constraint.service';
import { MaterialModule } from '../../shared/material-module';
import { ResultNameByIdPipe, ResultValuePipe, ResultByPlayerNamePipe } from '../pipes';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HedgeMatchDetail, Match } from '../models';
import { Language } from '../../shared/language.native';
import { of } from 'rxjs';
import { SettlementStatusId } from '../../shared/constants';
import { MatchDetail, Permission, ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ApiKeys } from '../constants';
import { ResultSettingModel, Result } from '../../shared/models';

class MockToastrService {
  clear = jest.fn();
  error = jest.fn();
  success = jest.fn();
  warning = jest.fn();
  info = jest.fn();
}

class MockVerificationService {
  invalidInputScore = jest.fn().mockReturnValue(false);
  allMapHaveScoreSources = jest.fn().mockReturnValue(true);
  isDisableUncalculate = jest.fn().mockReturnValue(false);
  isMismatchedWarning = jest.fn().mockReturnValue(false);
  autoFillScore = jest.fn();
  verifyNoRunningOdds = jest.fn().mockReturnValue(true);
}

class MockVerificationBaseService {
  getChangedScores = jest.fn().mockReturnValue([]);
  getOutsideScores = jest.fn().mockReturnValue([]);
  isExistMismatchScore = jest.fn().mockReturnValue(false);
  getChangedTraderScores = jest.fn().mockReturnValue({});
  getTraderScores = jest.fn().mockReturnValue({});
}

class MockAioService {
  saveScore = jest.fn().mockReturnValue(of({}));
  push = jest.fn().mockReturnValue(of({}));
  getMatch = jest.fn().mockReturnValue(of({}));
  verifyNoRunningOdds = jest.fn().mockReturnValue(of({}));
  verifyChangedSettledTickets = jest.fn().mockReturnValue(of(true));
}

class MockMessageBoxService {
  confirm = jest.fn();
  closePopup = jest.fn();
}


export class CreateDataTest {
  public static CreateResultDetail(
    resourceId: string,
    home: string,
    away: string,
    checked: boolean
  ) {
    const item = new ResultDetail();
    item.resourceId = resourceId;
    item.checked = checked;
    item.homeValue = home;
    item.awayValue = away;
    item.ticketStatus = 'Running';
    item.externalScores = [new ExternalResultDetail(1001, resourceId, '')];
    item.resultSettingData = new ResultSettingModel();
    const resultDetails: ResultDetail[] = [];
    resultDetails.push(item);
    return resultDetails;
  }
}

describe('CalculationActionsComponent', () => {
  let component: CalculationActionsComponent;
  let fixture: ComponentFixture<CalculationActionsComponent>;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let aioService: AioService;
  let verificationBaseService: VerificationBaseService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = new Result();
  successfulResult.errCode = 0;
  successfulResult.errMsg = null;
  successfulResult.isSuccessful = true;
  successfulResult.childMatchIds = "";
  successfulResult.settledSessionId = "";
  successfulResult.hasResultAmendment = false;
  successfulResult.isOrg = false;

  const unSuccessfulResult = new Result();
  unSuccessfulResult.errCode = 1;
  unSuccessfulResult.errMsg = errorMessage;
  unSuccessfulResult.isSuccessful = false;
  unSuccessfulResult.childMatchIds = "";
  unSuccessfulResult.settledSessionId = "";
  unSuccessfulResult.hasResultAmendment = false;
  unSuccessfulResult.isOrg = false;

  const successfulResultWithCommand = new Result();
  successfulResultWithCommand.errCode = 0;
  successfulResultWithCommand.errMsg = "";
  successfulResultWithCommand.isSuccessful = true;
  successfulResultWithCommand.childMatchIds = "";
  successfulResultWithCommand.settledSessionId = "";
  successfulResultWithCommand.hasResultAmendment = false;
  successfulResultWithCommand.isOrg = false;

  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = false;
  const matchDetail = new MatchDetail();
  matchDetail.homeName = 'hTeam';
  matchDetail.playTime = 1000;
  const match = new Match(matchDetail);
  match.permission = permission;
  match.originalResultDetail = [];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MessageBoxService, useClass: MockMessageBoxService },
        { provide: VerificationService, useClass: MockVerificationService },
        { provide: AioService, useClass: MockAioService },
        { provide: VerificationBaseService, useClass: MockVerificationBaseService },
        { provide: ToastrService, useClass: MockToastrService },
        { provide: EarlyConstraintService, useClass: MockVerificationService },
        ToastContainerDirective,
        ResultValuePipe,
        ResultByPlayerNamePipe
      ],
      imports: [
        CalculationActionsComponent,
        ModalDialogComponent,
        NotReadyMatchComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        IntervalBackgroundPipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        ResultValuePipe,
        ResultByTeamNamePipe,
        ResultByPlayerNamePipe,
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculationActionsComponent);
    component = fixture.componentInstance;
    messageBoxService = TestBed.inject(MessageBoxService);
    verificationService = TestBed.inject(VerificationService);
    aioService = TestBed.inject(AioService);
    verificationBaseService = TestBed.inject(VerificationBaseService);
    toastrService = TestBed.inject(ToastrService);

    jest.spyOn(toastrService, 'clear').mockImplementation(() => {});
    jest.spyOn(toastrService, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationActionsComponent);
    component = fixture.componentInstance;
    
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = '00';
    resultDetail.ticketStatus = 'Running';
    match.resultDetails = [resultDetail];
    component.match = match;

    messageBoxService = TestBed.inject(MessageBoxService);
    verificationService = TestBed.inject(VerificationService);
    aioService = TestBed.inject(AioService);
    verificationBaseService = TestBed.inject(VerificationBaseService);
    toastrService = TestBed.inject(ToastrService);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
    const resultDetail = new ResultDetail();
    match.resultDetails = [resultDetail];
    jest.spyOn(aioService, 'saveScore').mockResolvedValue(of(successfulResult));
    jest.spyOn(verificationBaseService, 'getChangedScores').mockReturnValue([]);
    jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
    component.match = match;

    component.saveScore();
    const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(aioService.saveScore).toHaveBeenCalled();
    expect(component.match.resultDetails[0].checked).toBe(false);
  }));

  describe('uncalculate', () => {
    beforeEach(() => {
      const resultDetails = CreateDataTest.CreateResultDetail(
        "00",
        "1",
        "2",
        true
      );
      match.resultDetails = resultDetails;
      component.match = match;
      component.matchDetail = matchDetail;
    });

    it('Pass all validation and uncalculation is successful.'
      + 'Should error message is empty and close popup.', fakeAsync(() => {
        const hedgeMatch = new HedgeMatchDetail();
        hedgeMatch.matchId = 123;
        match.hedgeMatchDetail = hedgeMatch;
        component.applyHedgeMatch = true;
        jest.spyOn(aioService, 'push').mockResolvedValue(successfulResult);
        jest.spyOn(messageBoxService, 'closePopup');
        jest.spyOn(toastrService, 'error');
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        expect(toastrService.error).not.toHaveBeenCalled();
      }));

   

    it('Pass all validation and uncalculation is unsuccessful.'
      + 'Should return an error.', fakeAsync(() => {
        jest.spyOn(aioService, 'push').mockReturnValue(of(unSuccessfulResult));
        jest.spyOn(toastrService, 'error').mockImplementation(() => {});
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).toHaveBeenCalled();
      }));
  });

  describe('calculate', () => {
    beforeEach(() => {
      const resultDetails = CreateDataTest.CreateResultDetail("00", "1", "2", true);
      match.resultDetails = resultDetails;

      const originalResultDetail = new ResultDetail();
      originalResultDetail.resourceId = "00";
      originalResultDetail.externalScores = [new ExternalResultDetail(1001, '00', ''), new ExternalResultDetail(2000, '123456', '')];
      match.resultDetails = resultDetails;
      match.originalResultDetail = [originalResultDetail];

      component.match = match;
      component.matchDetail = matchDetail;
    });

    it('Should return correct confirm message', fakeAsync(async () => {
      component.isReSettledTickets = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(aioService, 'push').mockReturnValue(of(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      jest.spyOn(messageBoxService, 'confirm');

      component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('should push after confirm three times when outside score verification is fail and isLeader', fakeAsync(() => {
      component.isLeader = true;
      component.isReSettledTickets = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(false);
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(true);
      jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(aioService, 'push').mockReturnValue(of(unSuccessfulResult));
      jest.spyOn(messageBoxService, 'confirm');

      component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));


    it('should show error message when there are running odds', fakeAsync(() => {
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');
      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('Pass all validation and calculation is successful and close popup.', fakeAsync(() => {
      component.isReSettledTickets = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(aioService, 'push').mockReturnValue(of(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationBaseService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(aioService, 'saveScore').mockReturnValue(of(successfulResult));
      jest.spyOn(toastrService, 'error');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      expect(toastrService.error).not.toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalled();
    }));

    it('Should pass validation and settle hedge match', fakeAsync(() => {
      component.applyHedgeMatch = true;
      component.match.hedgeMatchDetail = new HedgeMatchDetail();
      component.match.hedgeMatchDetail.matchId = 1234;
      component.isReSettledTickets = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(aioService, 'push').mockReturnValue(of(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationBaseService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(aioService, 'saveScore').mockReturnValue(of(successfulResult));
      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(2);
    }));

    it('Pass all validation and calculation is unsuccessful. Should return an error.', fakeAsync(() => {
      component.isReSettledTickets = true;
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyChangedSettledTickets').mockReturnValue(of(false));
      jest.spyOn(verificationBaseService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationBaseService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(aioService, 'saveScore').mockReturnValue(of(successfulResult));
      jest.spyOn(aioService, 'push').mockReturnValue(of(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should confirm when score is changed', fakeAsync(() => {
      component.isReSettledTickets = false;
      jest.spyOn(messageBoxService, 'confirm');
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(aioService, 'verifyChangedSettledTickets').mockReturnValue(of(true));
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('should show error message when validation failed', () => {
      component.isReSettledTickets = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(true);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(of(successfulResult));
      jest.spyOn(verificationBaseService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankScore);
    });

    it('should show error message when exist result confirmed', fakeAsync(() => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.match.resultDetails = [result];
      jest.spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    }));

  });


  describe('getMatch', () => {
    it('should call getMatch function with correct param', fakeAsync(async () => {
      const matchId = 123;
      const matchQuery = {
        matchId: matchId,
        settleType: "MNL"
      };
      jest.spyOn(aioService, 'getMatch').mockReturnValue(of(match));
      component.getMatch(matchId);

      expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
    }));

    it('should reset home value when result is refund', fakeAsync(async () => {
      const matchId = 123;
      const resultDetails = CreateDataTest.CreateResultDetail("00", "1", "2", true);
      resultDetails[0].homeValue = '1';
      match.resultDetails = resultDetails;
      jest.spyOn(aioService, 'getMatch').mockReturnValue(of(match));
      await component.getMatch(matchId);

      expect(resultDetails[0].homeValue).toEqual('');
    }));
  });

  it('should return true when have not input value', () => {
    component.isPressedCalculate = true;
    const result = new ResultDetail();
    result.checked = true;
    const isError = component.isErrorOnVerification(result);
    expect(isError).toBe(true);
  });

  it('selectedOnMap - should set false for isClickOnCalculate', () => {
    jest.spyOn(verificationService, 'isDisableUncalculate').mockReturnValue(false);
    component.selectToProceed();

    expect(component.isPressedCalculate).toBeFalsy();
  });

  it('isSaveScoreDisabled - should return false when exist map checked', () => {
    const map = new ResultDetail();
    map.checked = true;
    match.resultDetails = [map];
    component.match = match;

    const result = component.isSaveScoreDisabled();

    expect(result).toBe(false);
  });

  it('autoFillScoreOnLoad - should auto fill maps and final', () => {
    const resultDetail = new ResultDetail();
    const final = new ResultDetail();
    final.resourceId = 'final';
    resultDetail.resourceId = '00';
    component.match = match;
    component.matchDetail = matchDetail;
    jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);

    component.autoFillScoreOnLoad([resultDetail, final]);

    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
  });

  it('verifyAndAutoFillScore - should verify and auto fill score', () => {
    const resultDetail = new ResultDetail();
    component.match = match;
    component.matchDetail = matchDetail;
    jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);
    jest.spyOn(verificationService, 'autoFillScore');

    component.verifyAndAutoFillScore(resultDetail);

    expect(verificationService.autoFillScore).toHaveBeenCalled();
  });

  it('checkMapIsMatched - should call verification service', () => {
    const resultDetail = new ResultDetail();
    jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(true);

    component.checkMapIsMatched(resultDetail);

    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
  });

  describe('saveTraderScore', () => {
    it('should set error message when fail to save trader score', fakeAsync(() => {
      jest.spyOn(verificationBaseService, 'getChangedTraderScores').mockReturnValue({});
      jest.spyOn(verificationBaseService, 'getTraderScores').mockReturnValue({});
      jest.spyOn(aioService, 'saveScore').mockReturnValue(of(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');

      component.saveTraderScore();
      tick();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it('should uncheck all maps when successfully save trader score', fakeAsync(async () => {
      const resultDetail = new ResultDetail();
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      component.match.resultDetails = [resultDetail];
      jest.spyOn(verificationBaseService, 'getChangedTraderScores').mockReturnValue({});
      jest.spyOn(verificationBaseService, 'getTraderScores').mockReturnValue({});
      jest.spyOn(aioService, 'saveScore').mockReturnValue(of(successfulResult));

      component.saveTraderScore();
      tick();

      expect(resultDetail.checked).toBeFalsy();
    }));
  });

  describe('changeTraderScore', () => {
    it('should call autoFillScore', () => {
      const resultDetail = new ResultDetail();
      resultDetail.resultStatusId = 0;
      jest.spyOn(verificationService, 'autoFillScore');
      jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(true);

      component.changeTraderScore(resultDetail);

      expect(verificationService.autoFillScore).toHaveBeenCalled();
    });
  });
});


