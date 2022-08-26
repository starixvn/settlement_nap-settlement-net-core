import { TestBed, waitForAsync, fakeAsync, ComponentFixture, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EarlyConstraintService, VerificationService } from '../services';
import { EarlySettlementComponent } from './early-settlement.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
  ResettleCheckerComponent,
  TicketCountComponent
} from '../../shared/components';
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService,
  IntervalCalculationService
} from '../../shared/services';
import { Match } from '../models';
import { Language } from '../../shared/language';
import * as _ from 'lodash';
import { ResultSettingModel } from '../../shared/models';
import { ExternalResultDetail, MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { ResultTypePipe } from '../../shared/pipes/result-type.pipe';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResultStatusPipe } from '../../shared/pipes/result-status.pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('EarlySettlementComponent', () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;
  let earlyConstraintService: EarlyConstraintService;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);

  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  };
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
  };
  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket = {
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


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EarlySettlementComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        IntervalBackgroundPipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        ResultStatusPipe,
        TicketStatusPipe,
        ResultTypePipe,
        ResultByTeamNamePipe,
      ],
      providers: [
        HttpClientModule,
        AioService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        VerificationService,
        ResultByTeamNamePipe,
        NgbModal,
        ToastContainerDirective,
        ToastrService,
        IntervalCalculationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
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
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        spyOn(toastrService, 'clear');
        spyOn(toastrService, 'error');
      });
  }));

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
    spyOn(verificationService, 'autoFillEarlyResult');
    spyOn(verificationService, 'isEarlyMismatchedWarning');

    component.autoFillResultOnLoad(resultDetails);

    expect(component.matchDetail.isSavedScore).toBe(false);
    expect(verificationService.autoFillEarlyResult).toHaveBeenCalled();
    expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
  });


  it('saveResult - should show confirm box', () => {
    spyOn(messageBoxService, 'confirm');

    component.saveResult();

    expect(messageBoxService.confirm).toHaveBeenCalled();
    expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.saveScore);
  });

  it("checkResultIsMatched - should call verify service", () => {
    const result = new ResultDetail();
    spyOn(verificationService, 'isEarlyMismatchedWarning').and.returnValue(true);

    component.checkResultIsMatched(result);

    expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    expect(result.isScoreMismatched).toBeTruthy();
  });

  describe('canSettleResult', () => {
    it('should return true when result is running and score is match and exist inhouse result', () => {
      resultDetail.resultStatus = 'Running';
      spyOn(verificationService, 'isExistInhouseResult').and.returnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when result is completed', () => {
      resultDetail.resultStatus = 'Completed';
      spyOn(verificationService, 'isExistInhouseResult').and.returnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe("refund", () => {
    beforeEach(() => {
      component.match = match;
      component.match.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.permission = new Permission();
    });
    it("should pass all validation and success", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResult));
      spyOn(closePopupService, "closePopup");

      await component.refund();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it("should return error message when fail to refund", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(unSuccessfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it("should alert when exist marked ticket", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(existMarkedTicket)
      );

      await component.refund();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it("should alert when exist result not confirm", fakeAsync(async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      component.resultDetails = [resultDetail];

      await component.refund();

      expect(toastrService.error).toHaveBeenCalled();
    }));
  });

  describe("uncalculate", () => {
    beforeEach(() => {
      component.match = match;
      component.match.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.permission = new Permission();
    });

    it('should pass all validation and success', fakeAsync(() => {
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should return error message when result is unsuccessful', fakeAsync(() => {
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
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

    it('Pass all validation and calculation is successful. error should have not been involved',fakeAsync(async () => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      match.originalResultDetail = resultDetails;
      component.match = match;
      component.resultDetails = resultDetails;
      component.permission = new Permission();
      component.matchDetail = matchDetail;

      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      await component.calculate();

      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should error message when pass validation and exist running odds', fakeAsync(async () => {
      component.match = match;
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(errorMessage);

      fixture.detectChanges();
      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should confirm when score settled is changed', fakeAsync(async () => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      component.resultDetails = resultDetails;
      component.match = match;
      spyOn(messageBoxService, 'confirm');
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));

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

      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      await component.calculate();

      const expected = Language.CalculationConfirmMessageEarly + "<br/>"
        + `Test bet type name: ${matchDetail.homeName}<br/>`
        + `Test bet type name: ${matchDetail.awayName}<br/>`

      expect(component.confirmationDialogMessage.message).toEqual(expected);
    }));

    it('should alert when result is invalid',async () => {
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      component.match = match;
      component.permission = new Permission();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should alert when non-leader user calculate with mismatched score',async () => {
      component.match = match;
      component.permission = new Permission();
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(earlyConstraintService, "verifyBeforeCalculation").and.returnValue('');
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(true);

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith('WARNING! There are inconsistent results! Please check inputted values.');
    });

    it('should alert when exist result confirmed', fakeAsync(async() => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      component.permission = new Permission();
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue(errorMessage);

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  it('getMatch - should get match and init component info', async () => {
    spyOn(aioService, 'getMatch').and.returnValue(of(match));
    spyOn(verificationService, 'generateExternalScores');
    spyOn(earlyConstraintService, 'getGroupMap').and.returnValue([]);
    spyOn(earlyConstraintService, 'renderResultStatus');
    spyOn(earlyConstraintService, 'renderTicketStatus');
    spyOn(earlyConstraintService, 'renderResultType');
    spyOn(verificationService, 'isMismatchedWarning');
    spyOn(verificationService, 'autoFillScore');

    await component.getMatch(12345, '');

    expect(component.match.matchDetail.matchId).toEqual(match.matchDetail.matchId);
  });
});
