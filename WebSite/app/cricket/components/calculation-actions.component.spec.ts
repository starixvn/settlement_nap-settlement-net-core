import { ResultCommand } from './../../shared/models/result.model';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AioService, BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { ModalContentDialogComponent, ModalDialogComponent, NotReadyMatchComponent, ResettleCheckerComponent, TicketCountComponent } from '../../shared/components';
import { CalculationActionsComponent } from './calculation-actions.component';
import { CricketService, VerificationService } from '../services';
import { ResultNameByIdPipe, ResultValuePipe } from '../pipes';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { HedgeMatchDetail, Match } from '../models';
import { Language } from '../../shared/language';
import { of } from 'rxjs';
import { SettlementStatusId } from '../../shared/constants';
import { MatchDetail, Permission, ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ApiKeys } from '../constants';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultSettingModel } from '../../shared/models';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

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
  let cricketService: CricketService;
  let verificationBaseService: VerificationBaseService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: null,
    isSuccessful: true,
    resultCommand: ''
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };

  const successfulResultWithCommand = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    resultCommand: 'mock command'
  };

  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = false;
  const matchDetail = new MatchDetail();
  matchDetail.homeName = 'hTeam';
  const match = new Match(matchDetail);
  match.permission = permission;
  match.originalResultDetail = [];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CalculationActionsComponent,
        TicketCountComponent,
        ResultNameByIdPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        IntervalBackgroundPipe,
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        ResultByTeamNamePipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        ResultValuePipe
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MessageBoxService,
        CricketService,
        VerificationService,
        HttpRequestService,
        AioService,
        BlockUIService,
        ResultNameByIdPipe,
        ResultByTeamNamePipe,
        VerificationBaseService,
        ToastContainerDirective,
        ToastrService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent, NotReadyMatchComponent],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculationActionsComponent);
    component = fixture.componentInstance;
    component.match = match;
    cricketService = fixture.debugElement.injector.get(CricketService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    verificationService = fixture.debugElement.injector.get(VerificationService);
    aioService = fixture.debugElement.injector.get(AioService);
    verificationBaseService = fixture.debugElement.injector.get(VerificationBaseService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
    const resultDetail = new ResultDetail();
    match.resultDetails = [resultDetail];
    spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
    spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
    spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
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
        spyOn(aioService, 'push').and.returnValue(of(successfulResult));
        spyOn(messageBoxService, 'closePopup');
        spyOn(toastrService, 'error');
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        expect(toastrService.error).not.toHaveBeenCalled();
      }));

    it("should call netPosition when uncalculate is successful and return command", fakeAsync(() => {
      const hedgeMatch = new HedgeMatchDetail();
      hedgeMatch.matchId = 123;
      match.hedgeMatchDetail = hedgeMatch;
      component.applyHedgeMatch = true;
      spyOn(aioService, 'push').and.returnValue(of(successfulResultWithCommand));
      spyOn(messageBoxService, 'closePopup');
      spyOn(cricketService, 'netPosition').and.returnValue(of(successfulResult));
      component.uncalculate();

      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(cricketService.netPosition).toHaveBeenCalledTimes(2);
    }));

    it('Pass all validation and uncalculation is unsuccessful.'
      + 'Should return an error.', fakeAsync(() => {
        spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
        spyOn(toastrService, 'error');
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
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
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(messageBoxService, 'confirm');

      component.calculate();
      tick();
      const expected = Language.CalculationConfirmMessage + "<br/>"
        + Language.CalculationAdditionalConfirmation + "<br/>"
        + "Match Winner: 1-2<br/>";

      expect(component.confirmationDialogMessage.message).toEqual(expected);
    }));

    it('should push after confirm three times when outside score verification is fail and isLeader', fakeAsync(() => {
      component.isLeader = true;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(false);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(true);
      spyOn(messageBoxService, 'closePopup');
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.calculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      expect(aioService.push).toHaveBeenCalled();
    }));


    it('should show error message when there are running odds', fakeAsync(() => {
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');
      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('Pass all validation and calculation is successful and close popup.', fakeAsync(() => {
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(toastrService, 'error');

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
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(2);
    }));

    it('Pass all validation and calculation is unsuccessful. Should return an error.', fakeAsync(() => {
      component.isReSettledTickets = true;
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should confirm when score is changed', fakeAsync(() => {
      component.isReSettledTickets = false;
      spyOn(messageBoxService, 'confirm');
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('should show error message when validation failed', () => {
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(true);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankScore);
    });

    it('should call net position when settle successful and return command', fakeAsync(() => {
      component.isReSettledTickets = true;
      spyOn(aioService, 'push').and.returnValue(of(successfulResultWithCommand));
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(cricketService, 'netPosition').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(false);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(cricketService.netPosition).toHaveBeenCalled();
    }));

    it('should call net position when settle successful and return command with hedge match', fakeAsync(() => {
      component.isReSettledTickets = true;
      component.match.hedgeMatchDetail = new HedgeMatchDetail();
      component.match.hedgeMatchDetail.matchId = 1234;
      component.applyHedgeMatch = true;
      successfulResult.resultCommand = 'abc';
      spyOn(aioService, 'push').and.returnValue(of(successfulResultWithCommand));
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(cricketService, 'netPosition').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(false);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(cricketService.netPosition).toHaveBeenCalledTimes(2);
    }));

    it('should show error message when exist result confirmed', fakeAsync(() => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.match.resultDetails = [result];
      spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    }));

  });


  describe('getMatch', () => {
    it('should call getMatch function with correct param', () => {
      const matchId = 123;
      const matchQuery = {
        matchId,
        apikey: ApiKeys.NormalMatch,
        settleType: "MNL"
      };
      spyOn(aioService, 'getMatch').and.returnValue(of(match));
      component.getMatch(matchId, 'url');

      expect(aioService.getMatch).toHaveBeenCalledWith(matchQuery);
    });

    it('should reset home value when result is refund', async () => {
      const matchId = 123;
      const resultDetails = CreateDataTest.CreateResultDetail(
        "00",
        "1",
        "2",
        true
      );
      resultDetails[0].settlementStatusId = SettlementStatusId.Refund;
      resultDetails[0].homeValue = '1';
      match.resultDetails = resultDetails;
      spyOn(aioService, 'getMatch').and.returnValue(of(match));
      await component.getMatch(matchId, 'url');

      expect(resultDetails[0].homeValue).toEqual('');
    });
  });

  it('should return true when have not input value', () => {
    component.isPressedCalculate = true;
    const result = new ResultDetail();
    result.checked = true;
    const isError = component.isErrorOnVerification(result);
    expect(isError).toBe(true);
  });

  it('selectedOnMap - should set false for isClickOnCalculate', () => {
    component.isPressedCalculate = true;

    component.selectToProceed();

    expect(component.isPressedCalculate).toBe(false);
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
    resultDetail.resourceId = 'H1';
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    const final = new ResultDetail();
    final.resourceId = '00';
    final.homeValue = '1';
    final.awayValue = '1';
    match.resultDetails = [resultDetail, final];
    component.match = match;
    component.matchDetail = matchDetail;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);

    component.autoFillScoreOnLoad([resultDetail, final]);

    expect(final.isScoreMismatched).toBe(false);
  });

  it('verifyAndAutoFillScore - should verify and auto fill score', () => {
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = '00';
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    match.resultDetails = [resultDetail];
    component.match = match;
    component.matchDetail = matchDetail;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);
    spyOn(verificationService, 'autoFillScore');

    component.verifyAndAutoFillScore(resultDetail);

    expect(resultDetail.isScoreMismatched).toBe(false);
    expect(verificationService.autoFillScore).toHaveBeenCalled();
  });

  it('checkMapIsMatched - should call verification service', () => {
    const resultDetail = new ResultDetail();
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(true);

    component.checkMapIsMatched(resultDetail);

    expect(resultDetail.isScoreMismatched).toBe(true);
  });

  describe('saveTraderScore', () => {
    it('should set error message when fail to save trader score', fakeAsync(() => {
      spyOn(verificationBaseService, 'getChangedTraderScores').and.returnValue({});
      spyOn(verificationBaseService, 'getTraderScores').and.returnValue({});
      spyOn(aioService, 'saveScore').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.saveTraderScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should uncheck all maps when successfully save trader score', fakeAsync(async () => {
      const resultDetail = new ResultDetail();
      resultDetail.checked = true;
      component.match = match;
      component.match.resultDetails = [resultDetail];
      spyOn(verificationBaseService, 'getChangedTraderScores').and.returnValue({});
      spyOn(verificationBaseService, 'getTraderScores').and.returnValue({});
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));

      await component.saveTraderScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(resultDetail.checked).toBe(false);
    }));
  });

  it('changeTraderScore - should call autoFillScore', () => {
    component.canCalculate = true;
    const resultDetail = new ResultDetail();
    resultDetail.resultStatusId = 0;
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(true);

    component.changeTraderScore(resultDetail);

    expect(resultDetail.homeValue).toEqual('');
    expect(verificationService.autoFillScore).toHaveBeenCalled();
  });
});


