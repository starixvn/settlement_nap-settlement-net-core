import {
  TestBed,
  waitForAsync,
  fakeAsync,
  ComponentFixture,
  tick,
  flush,
} from "@angular/core/testing";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { HttpClientModule } from "@angular/common/http";
import { ResourceNameByIdPipe } from "../pipes";
import { EarlySettlementComponent } from "./early-settlement.component";
import { Language } from '../../shared/language.native';
import {
  MessageBoxService,
  AioService,
} from "../../shared/services";
import { EarlyConstraintService, VerificationService } from "../services";
import {
  Match,
} from "../models";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import * as _ from "lodash";
import { MaterialModule } from "../../shared/material-module";
import { ResultSettingModel } from "../../shared/models";
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { PipesModule } from "../../shared/pipes/pipes.module.native";
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { ModalContentDialogComponent } from "../../shared/components/modal-dialog/modal-content-dialog.component";
import { ResettleCheckerComponent } from "../../shared/components/resettle-checker/resettle-checker.component";
import { TicketCountComponent } from "../../shared/components/ticket-count/ticket-count.component";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
describe("E-sport - Early Settlement Component", () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;
  let earlyConstraintService: EarlyConstraintService;
  let aioService: AioService;
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
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      imports: [
        HttpClientModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        PipesModule,
        ResettleCheckerComponent,
        TicketCountComponent,
        NewMultipleSelectComponent,
        IntervalBackgroundPipe,
        ResultByTeamNamePipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        EarlySettlementComponent,
        ResourceNameByIdPipe,
      ]
    })
      
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(EarlySettlementComponent);
        component = fixture.componentInstance;
        component.permission = permission;
        aioService = fixture.debugElement.injector.get(AioService);
        earlyConstraintService = fixture.debugElement.injector.get(EarlyConstraintService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        aioService = fixture.debugElement.injector.get(AioService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        resultByTeamNamePipe = fixture.debugElement.injector.get(ResultByTeamNamePipe);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        fixture.detectChanges();
        component.initService();
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
      earlyConstraintService.isInValidResultValue= jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.leader.blankResult);
    });

    it('should show error message when non-leader user calculate with mismatched score', async () => {
      resultDetail.checked = true;
      resultDetail.homeValue = '';
      component.resultDetails = [resultDetail];
      component.permission = new Permission();
      earlyConstraintService.isInValidResultValue= jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

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
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    }));

    it('should alert when pass validation and exist running odds', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, resultDetail];
      match.resultDetails = resultDetails;
      component.match = match;
      earlyConstraintService.isInValidResultValue = jest.fn().mockReturnValue(false);
      earlyConstraintService.isInValidDuration = jest.fn().mockReturnValue(false);
      aioService.verifyNoRunningOdds= jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();

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
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(
        Promise.resolve(notExistMarkedTicket)
      );
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      messageBoxService.closePopup = jest.fn();
      toastrService.clear = jest.fn();
      toastrService.error = jest.fn();

      await component.refund();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it("should return error message when fail to refund", fakeAsync(async () => {
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(
        Promise.resolve(notExistMarkedTicket)
      );
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();

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
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(
        Promise.resolve(existMarkedTicket)
      );
      messageBoxService.alert = jest.fn();
      toastrService.clear = jest.fn();
      toastrService.error = jest.fn();

      await component.refund();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it("should show error message when exist result not confirm refund", fakeAsync(async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      component.resultDetails = [resultDetail];
      messageBoxService.alert = jest.fn();
      toastrService.error = jest.fn();

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
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      messageBoxService.closePopup = jest.fn();
      earlyConstraintService.getBetTypeGroup= jest.fn().mockReturnValue(0);
      resultByTeamNamePipe.transform= jest.fn().mockReturnValue('');
      toastrService.error = jest.fn();

      component.unCalculate();
      const buttonYes = document.getElementsByClassName(
        buttonName
      )[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
    }));

    it("should return error message when result is unsuccessful", fakeAsync(() => {
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();

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
    verificationService.autoFillScore = jest.fn();
    verificationService.autoFillEarlyResult = jest.fn();
    verificationService.isMismatchedWarning = jest.fn();
    verificationService.isEarlyMismatchedWarning = jest.fn();

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
      earlyConstraintService.getBetTypeGroup= jest.fn().mockReturnValue(0);
      verificationService.isExistInhouseResult= jest.fn().mockReturnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when result is completed', () => {
      resultDetail.resultStatus = 'Completed';
      earlyConstraintService.getBetTypeGroup= jest.fn().mockReturnValue(0);
      verificationService.isExistInhouseResult= jest.fn().mockReturnValue(true);

      const result = component.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('checkResultIsMatched', () => {
    it('should call is mismatch warning when this is couple result', () => {
      const result = new ResultDetail();
      result.groupBetType = 4;
      verificationService.isMismatchedWarning = jest.fn();

      component.checkResultIsMatched(result);

      expect(verificationService.isMismatchedWarning).toHaveBeenCalled();
    });

    it('should call is early mismatch warning when this is couple result', () => {
      const result = new ResultDetail();
      result.groupBetType = 0;
      verificationService.isEarlyMismatchedWarning = jest.fn();

      component.checkResultIsMatched(result);

      expect(verificationService.isEarlyMismatchedWarning).toHaveBeenCalled();
    });
  });

  it('getMatch - should get match and init component info', async () => {
    aioService.getMatch= jest.fn().mockReturnValue(Promise.resolve(match));
    earlyConstraintService.getGroupMap= jest.fn().mockReturnValue([]);
    earlyConstraintService.renderResultStatus = jest.fn();
    earlyConstraintService.renderTicketStatus = jest.fn();
    verificationService.isMismatchedWarning = jest.fn();
    verificationService.autoFillScore = jest.fn();

    await component.getMatch(12345);

    expect(component.match.matchDetail.matchId).toEqual(match.matchDetail.matchId);
  });

  it('saveResult - should call save score', fakeAsync(() => {
    component.match = match;
    verificationService.getChangedScores = jest.fn();
    verificationService.getOutsideScores = jest.fn();
    aioService.saveScore= jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));

    component.saveResult();
    tick();
    const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(aioService.saveScore).toHaveBeenCalled();
    flush();
  }));
});
