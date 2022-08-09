import {
  TestBed,
  waitForAsync,
  fakeAsync,
  ComponentFixture,
  tick,
} from "@angular/core/testing";
import { of } from "rxjs";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { EarlySettlementComponent } from ".";
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
  ResettleCheckerComponent,
  TicketCountComponent,
} from "../../shared/components";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService,
} from "../../shared/services";
import { EarlyConstraintService, VerificationService } from "../services";
import { Match } from "../models";
import { Language } from "../../shared/language";
import * as _ from "lodash";
import { MaterialModule } from "../../shared/material-module";
import { ResultSettingModel } from "../../shared/models";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ExternalResultDetail, GroupMap, MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResultByPlayerNamePipe, ResultValuePipe } from "../pipes";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { ResultTypePipe } from "../../shared/pipes/result-type.pipe";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ResultStatusId } from "../../shared/constants";
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResultStatusPipe } from '../../shared/pipes/result-status.pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe("Cricket - Early Settlement Component", () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;
  let earlyConstraintService: EarlyConstraintService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let verificationBaseService: VerificationBaseService
  let aioService: AioService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: null,
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
  resultDetail.resourceId = "H1";
  resultDetail.betTypeName = "Test bet type name";
  resultDetail.homeValue = 'H';
  resultDetail.isShow = true;
  resultDetail.inputType = 0;
  resultDetail.resultSettingData = resultSettingData;
  resultDetail.checked = true;
  resultDetail.externalScores = [externalScores];

  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = false;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  match.permission = permission;
  match.resultDetails = [resultDetail];

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
        ResultValuePipe,
        TicketStatusPipe,
        ResultStatusPipe,
        ResultTypePipe,
        ResultByTeamNamePipe,
        ResultByPlayerNamePipe,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MessageBoxService,
        EarlyConstraintService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        VerificationBaseService,
        NgbModal,
        VerificationService,
        IntervalBackgroundPipe,
        ExternalSourceNamePipe,
        ResultByTeamNamePipe,
        AioService,
        ResultValuePipe,
        ResultByPlayerNamePipe,
        ToastContainerDirective,
        ToastrService,
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
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
        component.match = match;
        earlyConstraintService = fixture.debugElement.injector.get(EarlyConstraintService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        aioService = fixture.debugElement.injector.get(AioService);
        verificationBaseService = fixture.debugElement.injector.get(VerificationBaseService);
        component.permission = permission;
        toastrService = fixture.debugElement.injector.get(ToastrService);
        fixture.detectChanges();
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  describe('saveTraderScore', () => {
    it('should push successfully', fakeAsync(() => {
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(verificationBaseService, 'getChangedTraderScores').and.returnValue(of([]));
      spyOn(verificationBaseService, 'getTraderScores').and.returnValue(of([]));
      component.resultDetails = [resultDetail];
      const groupMap = new GroupMap('1', [resultDetail]);
      component.groupMap = [groupMap];


      component.saveTraderScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.saveScore).toHaveBeenCalled();
      expect(component.resultDetails[0].checked).toBeFalsy();
    }));

    it('should set error message when save score unsuccessfully', fakeAsync(() => {
      spyOn(aioService, 'saveScore').and.returnValue(of(unSuccessfulResult));
      spyOn(verificationBaseService, 'getChangedTraderScores').and.returnValue(of([]));
      spyOn(verificationBaseService, 'getTraderScores').and.returnValue(of([]));
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      component.saveTraderScore();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
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
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'isMismatchedWarning');

    component.autoFillResultOnLoad(resultDetails);

    expect(component.match.matchDetail.isSavedScore).toBe(false);
    expect(verificationService.autoFillScore).toHaveBeenCalled();
    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
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
      resultDetail.checked = true;
      component.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.match = match;
    });
    it("should pass all validation and success", fakeAsync(async () => {
      spyOn(aioService, "checkMarkedTickets").and.returnValue(
        of(notExistMarkedTicket)
      );
      spyOn(aioService, "push").and.returnValue(of(successfulResult));
      spyOn(closePopupService, "closePopup");
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

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
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

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
      spyOn(messageBoxService, "alert");
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      await component.refund();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it("should show error message when exist result not confirm refund", fakeAsync(async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      component.resultDetails = [resultDetail];
      spyOn(messageBoxService, "alert");
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      component.refund();
      tick();

      expect(toastrService.error).toHaveBeenCalled();
    }));

  });

  describe("uncalculate", () => {
    beforeEach(() => {
      component.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.match = match;
    });

    it('should pass all validation and success', fakeAsync(() => {
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(toastrService, 'error');

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it('should return error message when result is unsuccessful', fakeAsync(() => {
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe("calculate", () => {
    beforeEach(() => {
      resultDetail.checked = true;
      resultDetail.resourceId = '123456';
      match.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
    });

    it('Pass all validation and calculation is successful. Should error message is empty and close popup.', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      match.originalResultDetail = resultDetails;
      component.match = match;
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(earlyConstraintService, 'getOtherInfo');
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationBaseService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationBaseService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(toastrService, 'clear');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(closePopupService.closePopup).toHaveBeenCalled();
    }));

    it('should confirm when score settled is changed', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      component.match = match;
      spyOn(messageBoxService, 'confirm');
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      spyOn(earlyConstraintService, 'isInValidResultValue').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      component.calculate();
      tick();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('Should return correct confirm message', fakeAsync(() => {
      resultDetail.homeValue = 'H';
      const resultDetails: ResultDetail[] = [resultDetail];
      const away = _.clone(resultDetail);
      away.homeValue = "A";
      resultDetails.push(away);
      const caughtType = _.clone(resultDetail);
      caughtType.inputType = 1;
      caughtType.homeValue = "C";
      resultDetails.push(caughtType);
      matchDetail.homeName = 'home';
      matchDetail.awayName = 'away';
      match.matchDetail = matchDetail;
      component.match = match;
      component.resultDetails = resultDetails;
      component.matchDetail = matchDetail;
      component.isReSettledTickets = true;
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(earlyConstraintService, 'getOtherInfo');
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');
      component.calculate();
      tick();

      const expected = Language.CalculationConfirmMessageEarly + "<br/>"
        + `Test bet type name: ${matchDetail.homeName}<br/>`
        + `Test bet type name: ${matchDetail.awayName}<br/>`
        + "Test bet type name: Caught<br/>";

      expect(component.confirmationDialogMessage.message).toEqual(expected);
    }));

    it('should show error message when result is invalid', async () => {
      resultDetail.checked = true;
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('error');
      spyOn(earlyConstraintService, 'getOtherInfo');
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should show error message when non-leader user calculate with mismatched score', fakeAsync(() => {
      component.match = match;
      component.permission = new Permission();
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(earlyConstraintService, 'verifyBeforeCalculation').and.returnValue('');
      spyOn(earlyConstraintService, 'getOtherInfo');
      spyOn(verificationService, 'allResultsHaveScoreSources').and.returnValue(true);
      spyOn(verificationBaseService, 'isExistMismatchScore').and.returnValue(true);
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it('should show error message when exist result confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      component.permission = match.permission;
      spyOn(earlyConstraintService, 'getOtherInfo');
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Cannot continue due to selected results are confirmed to refund. Please undo-confirm refund and try again.");
    }));
  });

  it('saveScore - should show confirm box', fakeAsync(() => {
    spyOn(messageBoxService, 'confirm');
    spyOn(toastrService, 'clear');

    component.saveScore();

    expect(messageBoxService.confirm).toHaveBeenCalled();
    expect(component.confirmationDialogMessage.message).toEqual(Language.eSports.saveScore);
  }));

  it("checkResultIsMatched - should call verify service", () => {
    const result = new ResultDetail();
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(true);

    component.checkResultIsMatched(result);

    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
    expect(result.isScoreMismatched).toBeTruthy();
  });

  describe('getColSpanGroupMap', () => {
    it('return correct value when have permission calc', () => {
      component.permission.canCalculate = true;
      component.permission.isLeader = true;
      resultDetail.externalScores = [new ExternalResultDetail(1, '', '')];
      match.resultDetails = [resultDetail];
      component.match = match;

      const actualResult = component.getColSpanGroupMap();

      expect(actualResult).toEqual(5);
    });

    it('return correct value when only have permission trader', () => {
      component.permission = new Permission();
      component.permission.isTrader = true;
      resultDetail.externalScores = [new ExternalResultDetail(1, '', '')];
      match.resultDetails = [resultDetail];
      component.match = match;
      component.resultDetails = match.resultDetails;

      const actualResult = component.getColSpanGroupMap();

      expect(actualResult).toEqual(4);
    });

    it('return zero when not exist permission', () => {
      component.permission = new Permission();
      component.permission.canCalculate = false;
      component.permission.isTrader = false;
      component.resultDetails = [resultDetail];
      resultDetail.externalScores = [new ExternalResultDetail(1, '', '')];
      match.resultDetails = [resultDetail];
      component.match = match;

      const actualResult = component.getColSpanGroupMap();

      expect(actualResult).toEqual(0);
    });
  });

  it('changeTraderScore - should call verify and auto fill services', () => {
    const homeAway = new ResultDetail();
    homeAway.betType = '9063';
    homeAway.inputType = 4;
    homeAway.homeValue = '4';
    homeAway.awayValue = '4';
    homeAway.resultStatusId = ResultStatusId.RunningOne;
    component.match = new Match(new MatchDetail());
    component.resultDetails = [homeAway];
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'isMismatchedWarning');

    component.changeTraderScore(homeAway);

    expect(homeAway.homeValue).toEqual("");
    expect(homeAway.awayValue).toEqual("");
    expect(verificationService.autoFillScore).toHaveBeenCalled();
    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
  });

  it('getMatch - should get match and init component info', async () => {
    spyOn(aioService, 'getMatch').and.returnValue(of(match));
    spyOn(verificationBaseService, 'generateExternalScores');
    spyOn(earlyConstraintService, 'getGroupMap').and.returnValue([]);
    spyOn(earlyConstraintService, 'renderResultStatus');
    spyOn(earlyConstraintService, 'renderTicketStatus');
    spyOn(earlyConstraintService, 'renderResultType');
    spyOn(verificationService, 'isMismatchedWarning');
    spyOn(verificationService, 'autoFillScore');

    await component.getMatch(12345, '');

    expect(component.match.matchDetail.matchId).toEqual(match.matchDetail.matchId);
  });

  it("onSelectPlayerResult - should call verify service", () => {
    const result = new ResultDetail();
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(true);

    component.onSelectPlayerResult([], result);

    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
    expect(result.isScoreMismatched).toBeTruthy();
  });

  it('onTraderSelectPlayerResult - should call verify and auto fill services', () => {
    const homeAway = new ResultDetail();
    homeAway.betType = '9063';
    homeAway.inputType = 4;
    homeAway.homeValue = '4';
    homeAway.awayValue = '4';
    homeAway.resultStatusId = ResultStatusId.RunningOne;
    component.match = new Match(new MatchDetail());
    component.resultDetails = [homeAway];
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'autoFillItemSelect');
    spyOn(verificationService, 'isMismatchedWarning');

    component.onTraderSelectPlayerResult([], homeAway, externalScores);

    expect(verificationService.autoFillScore).toHaveBeenCalled();
    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
  });

  it('onOutsideSelectPlayerResult - should call verify and auto fill services', () => {
    const homeAway = new ResultDetail();
    homeAway.betType = '9063';
    homeAway.inputType = 6;
    homeAway.homeValue = '4';
    homeAway.awayValue = '4';
    homeAway.resultStatusId = ResultStatusId.RunningOne;
    component.match = new Match(new MatchDetail());
    component.resultDetails = [homeAway];
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'autoFillItemSelect');
    spyOn(verificationService, 'isMismatchedWarning');

    component.onOutsideSelectPlayerResult([], homeAway, externalScores);

    expect(verificationService.autoFillScore).toHaveBeenCalled();
    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
  });
});
