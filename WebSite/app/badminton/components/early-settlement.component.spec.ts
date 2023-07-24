import { TestBed, fakeAsync, ComponentFixture, tick, flush } from '@angular/core/testing';
import { EarlyConstraintService, VerificationService } from '../services';
import { EarlySettlementComponent } from './early-settlement.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import {
  MessageBoxService,
  AioService,
} from '../../shared/services';
import { Match } from '../models';
import { Language } from '../../shared/language.native';
import * as _ from 'lodash';
import { MarkedTicketsModel, Result, ResultSettingModel } from '../../shared/models';
import { ExternalResultDetail, MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { BadmintonApiKeys } from '../constants';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { PipesModule } from '../../shared/pipes/pipes.module.native';

describe('EarlySettlementComponent', () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;
  let earlyConstraintService: EarlyConstraintService;
  let aioService: AioService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);

  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult: Result = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,

    childMatchIds: ''
  };
  const unSuccessfulResult: Result = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,

    childMatchIds: ''
  };
  const existMarkedTicket: MarkedTicketsModel = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket: MarkedTicketsModel = {
    isExistMarkedTicket: false,
  };

  const resultSettingData = new ResultSettingModel();
  const resultDetail = new ResultDetail();
  const externalScores = new ExternalResultDetail(1, "", "", "");
  resultDetail.resourceId = "7120103";
  resultDetail.map = 0;
  resultDetail.betTypeName = "Test bet type name";
  resultDetail.awayValue = "";
  resultDetail.homeValue = "H";
  resultDetail.resultStatusId = 1;
  resultDetail.settlementStatusId = 4;
  resultDetail.resultSettingData = resultSettingData;
  resultDetail.checked = true;
  resultDetail.externalScores = [externalScores];
  const externalResult = new ExternalResultDetail(1, '1', '1', '', '1', '2');


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      imports: [
        EarlySettlementComponent,
        HttpClientModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        ResettleCheckerComponent,
        TicketCountComponent,
        IntervalBackgroundPipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        ResultByTeamNamePipe,
        PipesModule
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(EarlySettlementComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        earlyConstraintService = fixture.debugElement.injector.get(EarlyConstraintService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        component.initService();
        toastrService.clear = jest.fn();
        toastrService.error = jest.fn();
        component.apiKeys = BadmintonApiKeys;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('autoFillResultOnLoad - should call verify and auto fill services', () => {
    const homeAway = new ResultDetail();
    homeAway.betType = '9063';
    homeAway.inputType = 4;
    const duration = new ResultDetail();
    duration.betType = '9058';
    duration.inputType = 0;
    const resultDetails = [homeAway, duration];
    component.match = new Match(new MatchDetail());
    component.matchDetail = new MatchDetail();
    verificationService.autoFillEarlyResult = jest.fn();
    verificationService.isEarlyMismatchedWarning = jest.fn();

    component.autoFillResultOnLoad(resultDetails);

    expect(component.match.matchDetail.isSavedScore).toBe(false);
    expect(verificationService.autoFillEarlyResult).toHaveBeenCalled();
    expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
  });


  it('saveResult - should show confirm box', () => {
    messageBoxService.confirm = jest.fn();

    component.saveResult();

    expect(messageBoxService.confirm).toHaveBeenCalled();
    expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.saveScore);
  });

  it("checkResultIsMatched - should call verify service", () => {
    const result = new ResultDetail();
    jest.spyOn(verificationService, 'isEarlyMismatchedWarning').mockReturnValue(true);

    component.checkResultIsMatched(result);

    expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    expect(result.isScoreMismatched).toBeTruthy();
  });

  describe('canSettleResult', () => {
    it('should return true when result is running and score is match and exist inhouse result', () => {
      resultDetail.resultStatus = 'Running';
      jest.spyOn(verificationService, 'isExistInhouseResult').mockReturnValue(externalResult);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when result is completed', () => {
      resultDetail.resultStatus = 'Completed';
      jest.spyOn(verificationService, 'isExistInhouseResult').mockReturnValue(externalResult);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe("refund", () => {
    beforeEach(() => {
      component.match = match;
      match.resultDetails = [resultDetail];
      component.permission = new Permission();
      component.matchDetail = matchDetail;
    });
    it("should pass all validation and success", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockReturnValue(
        Promise.resolve(notExistMarkedTicket)
      );
      jest.spyOn(aioService, "push").mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, "closePopup");

      await component.refund();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it("should return error message when fail to refund", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockReturnValue(
        Promise.resolve(notExistMarkedTicket)
      );
      jest.spyOn(aioService, "push").mockReturnValue(Promise.resolve(unSuccessfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it("should alert when exist marked ticket", fakeAsync(async () => {
      jest.spyOn(aioService, "checkMarkedTickets").mockReturnValue(
        Promise.resolve(existMarkedTicket)
      );

      await component.refund();
      flush();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it("should alert when exist result not confirm", fakeAsync(async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      component.resultDetails = [resultDetail];

      await component.refund();
      flush();

      expect(toastrService.error).toHaveBeenCalled();
    }));
  });

  describe("uncalculate", () => {
    beforeEach(() => {
      component.match = match;
      component.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.permission = new Permission();
    });

    it('should pass all validation and success', fakeAsync(() => {
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should return error message when result is unsuccessful', fakeAsync(() => {
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(unSuccessfulResult));
      component.unCalculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });



  describe("calculate", () => {
    beforeEach(() => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      resultDetail.checked = true;
      resultDetail.resourceId = '123456';
      match.resultDetails = [resultDetail];
      const permission = new Permission();
      permission.isLeader = true;
      component.permission = permission;
    });

    it('Pass all validation and calculation is successful. error should have not been involved', fakeAsync(async () => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      match.originalResultDetail = resultDetails;
      component.match = match;
      component.resultDetails = resultDetails;
      component.permission = new Permission();
      component.matchDetail = matchDetail;

      jest.spyOn(earlyConstraintService, 'verifyBeforeCalculation').mockReturnValue(Promise.resolve(''));
      jest.spyOn(aioService, 'checkingNoRunningOdds').mockReturnValue(null);
      jest.spyOn(verificationService, 'allResultsHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(verificationService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(aioService, 'saveScore').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(aioService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(false));
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));
      messageBoxService.closePopup = jest.fn();
      await component.calculate();

      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should error message when pass validation and exist running odds', fakeAsync(async () => {
      component.match = match;
      jest.spyOn(earlyConstraintService, 'verifyBeforeCalculation').mockReturnValue(Promise.resolve(''));
      jest.spyOn(aioService, 'checkingNoRunningOdds').mockReturnValue(Promise.resolve(errorMessage));

      fixture.detectChanges();
      await component.calculate();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should confirm when score settled is changed', fakeAsync(async () => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      component.resultDetails = resultDetails;
      component.match = match;
      component.matchDetail = matchDetail;
      messageBoxService.confirm = jest.fn();
      jest.spyOn(earlyConstraintService, 'verifyBeforeCalculation').mockReturnValue(Promise.resolve(''));
      jest.spyOn(aioService, 'checkingNoRunningOdds').mockReturnValue(null);
      jest.spyOn(verificationService, 'allResultsHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(true));

      await component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('Should return correct confirm message', fakeAsync(async () => {
      resultDetail.homeValue = 'H';
      const resultDetails: ResultDetail[] = [resultDetail];
      const away = _.clone(resultDetail);
      away.homeValue = "A";
      resultDetails.push(away);
      matchDetail.homeName = 'home';
      matchDetail.awayName = 'away';
      match.matchDetail = matchDetail;
      component.resultDetails = resultDetails;
      component.match = match;
      component.match.matchDetail = matchDetail;
      component.isReSettledTickets = true;
      component.permission = new Permission();
      component.matchDetail = matchDetail;

      jest.spyOn(earlyConstraintService, 'verifyBeforeCalculation').mockReturnValue(Promise.resolve(''));
      jest.spyOn(aioService, 'checkingNoRunningOdds').mockReturnValue(null);
      jest.spyOn(verificationService, 'allResultsHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationService, 'isExistMismatchScore').mockReturnValue(false);
      await component.calculate();

      const expected = Language.CalculationConfirmMessageEarly + "<br/>"
        + `Test bet type name: ${matchDetail.homeName}<br/>`
        + `Test bet type name: ${matchDetail.awayName}<br/>`

      expect(component.confirmationDialogMessage.message).toEqual(expected);
    }));

    it('should alert when result is invalid', async () => {
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      component.match = match;
      component.permission = new Permission();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should alert when non-leader user calculate with mismatched score', async () => {
      component.match = match;
      component.permission = new Permission();
      jest.spyOn(aioService, 'checkingNoRunningOdds').mockReturnValue(null);
      jest.spyOn(earlyConstraintService, "verifyBeforeCalculation").mockReturnValue(Promise.resolve(''));
      jest.spyOn(verificationService, 'allResultsHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationService, 'isExistMismatchScore').mockReturnValue(true);

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith('WARNING! There are inconsistent results! Please check inputted values.');
    });

    it('should alert when exist result confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      component.permission = new Permission();
      jest.spyOn(earlyConstraintService, 'verifyBeforeCalculation').mockReturnValue(Promise.resolve(errorMessage));

      await component.calculate();
      flush();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  it('getMatch - should get match and init component info', async () => {
    match.resultDetails = [resultDetail];
    component.match = match;
    earlyConstraintService.renderResultStatus = jest.fn();
    earlyConstraintService.renderTicketStatus = jest.fn();
    verificationService.generateExternalScores = jest.fn();
    earlyConstraintService.renderResultType = jest.fn();
    verificationService.isMismatchedWarning = jest.fn();
    verificationService.autoFillScore = jest.fn();
    earlyConstraintService.getEarlyResultDetails = jest.fn().mockReturnValue(match.resultDetails);
    jest.spyOn(aioService, 'getMatch').mockReturnValue(Promise.resolve(match));

    await component.getMatch(12345);

    expect(component.match.matchDetail.matchId).toEqual(match.matchDetail.matchId);
  });
});
