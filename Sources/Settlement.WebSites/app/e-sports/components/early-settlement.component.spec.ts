import {
  TestBed,
  waitForAsync,
  fakeAsync,
  ComponentFixture,
  tick,
  flush,
} from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { of } from "rxjs";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ResourceNameByIdPipe } from "../pipes";
import { EarlySettlementComponent } from ".";
import { Language } from '../../shared/language';
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
  ResettleCheckerComponent,
  TicketCountComponent,
  NewMultipleSelectComponent,
} from "../../shared/components";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService,
} from "../../shared/services";
import { EarlyConstraintService, VerificationService, ESportsService } from "../services";
import {
  Match,
} from "../models";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import * as _ from "lodash";
import { MaterialModule } from "../../shared/material-module";
import { ResultSettingModel } from "../../shared/models";
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResultStatusPipe } from '../../shared/pipes/result-status.pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status.pipe';
import { MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
describe("E-sport - Early Settlement Component", () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;
  let earlyConstraintService: EarlyConstraintService;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let resultByTeamNamePipe: ResultByTeamNamePipe;
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
  resultDetail.resourceId = "H1";
  resultDetail.betTypeName = "Test bet type name";
  resultDetail.homeValue = 'H';
  resultDetail.isShow = true;
  resultDetail.inputType = 0;
  resultDetail.resultSettingData = resultSettingData;
  resultDetail.checked = true;
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  const permission = new Permission();
  permission.canCalculate = true;
  permission.canUncalculate = true;
  permission.canRefund = true;
  permission.canChangeScoreSource = true;
  permission.isLeader = true;
  permission.isTrader = false;
  match.permission = permission;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EarlySettlementComponent,
        ResourceNameByIdPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        NewMultipleSelectComponent,
        IntervalBackgroundPipe,
        ResultByTeamNamePipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        TicketStatusPipe,
        ResultStatusPipe,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MessageBoxService,
        EarlyConstraintService,
        AioService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        NgbModal,
        VerificationService,
        AioService,
        ResultByTeamNamePipe,
        ESportsService,
        ResourceNameByIdPipe,
        IntervalBackgroundPipe,
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
      ]
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
        component.permission = permission;
        aioService = fixture.debugElement.injector.get(AioService);
        earlyConstraintService = fixture.debugElement.injector.get(EarlyConstraintService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        aioService = fixture.debugElement.injector.get(AioService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        resultByTeamNamePipe = fixture.debugElement.injector.get(ResultByTeamNamePipe);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        fixture.detectChanges();
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  describe("calculate", () => {
    beforeEach(() => {
      resultDetail.checked = true;
      resultDetail.resourceId = '123456';
      match.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
    });

    it('should show error message when result is leader and invalid', async () => {
      resultDetail.checked = true;
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      spyOn(earlyConstraintService, 'isInValidResultValue').and.returnValue(true);
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.leader.blankResult);
    });

    it('should show error message when non-leader user calculate with mismatched score', async () => {
      resultDetail.checked = true;
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      component.permission = new Permission();
      spyOn(earlyConstraintService, 'isInValidResultValue').and.returnValue(true);
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankResult);
    });

    it('should show error message when exist result confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.resultDetails = [result];
      component.permission = match.permission;
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    }));

    it('should alert when pass validation and exist running odds', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      component.match = match;
      spyOn(earlyConstraintService, "isInValidResultValue").and.returnValue(false);
      spyOn(earlyConstraintService, "isInValidDuration").and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe("refund", () => {
    beforeEach(() => {
      resultDetail.checked = true;
      component.matchDetail = matchDetail;
      match.resultDetails = [resultDetail];
      component.match = match;
    });
    it("should pass all validation and success", fakeAsync(async () => {
      resultDetail.resultSettingData.isConfirmedRefund = true;
      match.resultDetails = [resultDetail];
      component.match = match;
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
      spyOn(toastrService, 'error');

      await component.refund();
      tick();
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

    it("should pass all validation and success", fakeAsync(() => {
      spyOn(aioService, "push").and.returnValue(of(successfulResult));
      spyOn(closePopupService, "closePopup");
      spyOn(earlyConstraintService, 'getBetTypeGroup').and.returnValue(0);
      spyOn(resultByTeamNamePipe, 'transform').and.returnValue('');
      spyOn(toastrService, 'error');

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it("should return error message when result is unsuccessful", fakeAsync(() => {
      spyOn(aioService, "push").and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.unCalculate();
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
    homeAway.groupBetType = 4;
    const duration = new ResultDetail();
    duration.betType = '9058';
    duration.groupBetType = 0;
    const resultDetails = [homeAway, duration];
    component.match = new Match(new MatchDetail());
    spyOn(verificationService, 'autoFillScore');
    spyOn(verificationService, 'autoFillEarlyResult');
    spyOn(verificationService, 'isMismatchedWarning');
    spyOn(verificationService, 'isEarlyMismatchedWarning');

    component.autoFillResultOnLoad(resultDetails);

    expect(component.match.matchDetail.isSavedScore).toBe(false);
    expect(verificationService.autoFillScore).toHaveBeenCalled();
    expect(verificationService.autoFillEarlyResult).toHaveBeenCalled();
    expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
    expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
  });


  describe('canSettleResult', () => {
    it('should return true when result is running and score is match and exist inhouse result', () => {
      resultDetail.resultStatus = 'Running';
      spyOn(earlyConstraintService, 'getBetTypeGroup').and.returnValue(0);
      spyOn(verificationService, 'isExistInhouseResult').and.returnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when result is completed', () => {
      resultDetail.resultStatus = 'Completed';
      spyOn(earlyConstraintService, 'getBetTypeGroup').and.returnValue(0);
      spyOn(verificationService, 'isExistInhouseResult').and.returnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('checkResultIsMatched', () => {
    it('should call is mismatch warning when this is couple result', () => {
      const result = new ResultDetail();
      result.groupBetType = 4;
      spyOn(verificationService, 'isMismatchedWarning');

      component.checkResultIsMatched(result);

      expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
    });

    it('should call is early mismatch warning when this is couple result', () => {
      const result = new ResultDetail();
      result.groupBetType = 0;
      spyOn(verificationService, 'isEarlyMismatchedWarning');

      component.checkResultIsMatched(result);

      expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    });
  });

  it('getMatch - should get match and init component info', async () => {
    spyOn(aioService, 'getMatch').and.returnValue(of(match));
    spyOn(earlyConstraintService, 'getGroupMap').and.returnValue([]);
    spyOn(earlyConstraintService, 'renderResultStatus');
    spyOn(earlyConstraintService, 'renderTicketStatus');
    spyOn(verificationService, 'isMismatchedWarning');
    spyOn(verificationService, 'autoFillScore');

    await component.getMatch(12345, '');

    expect(component.match.matchDetail.matchId).toEqual(match.matchDetail.matchId);
  });

  it('saveResult - should call save score', fakeAsync(() => {
    component.match = match;
    spyOn(verificationService, 'getChangedScores');
    spyOn(verificationService, 'getOutsideScores');
    spyOn(aioService, 'saveScore').and.returnValue(of(unSuccessfulResult));

    component.saveResult();
    tick();
    const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(aioService.saveScore).toHaveBeenCalled();
    flush();
  }));
});
