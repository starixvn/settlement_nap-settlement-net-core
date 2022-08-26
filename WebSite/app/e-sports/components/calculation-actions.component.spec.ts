import {
  TestBed,
  waitForAsync,
  ComponentFixture,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { of } from "rxjs";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ResourceNameByIdPipe } from "../pipes";
import { CalculationActionsComponent, CalculationMatchDetailComponent } from ".";
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
  ResettleCheckerComponent,
  TicketCountComponent,
  NotReadyMatchComponent,
} from "../../shared/components";
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService,
} from "../../shared/services";
import {
  Match,
} from "../models";
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { VerificationService, ESportsService } from "../services";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { ExternalResultDetail, HedgeMatchDetail, MatchDetail, Permission, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { MaterialModule } from "../../shared/material-module";
import { ResultSettingModel } from "../../shared/models";
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { Resources } from '../constants';
import { Language } from '../../shared/language';
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

describe("Esport - Calculation Actions Component", () => {
  let component: CalculationActionsComponent;
  let fixture: ComponentFixture<CalculationActionsComponent>;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let verificationService: VerificationService;
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
  const matchDetail = new MatchDetail();
  matchDetail.bestOfMap = 3;
  const match = new Match(matchDetail);
  match.permission = new Permission();
  const resultDetail = new ResultDetail();
  resultDetail.resultSettingData = new ResultSettingModel();
  resultDetail.checked = true;
  resultDetail.resourceId = 'M1';
  match.resultDetails = [resultDetail];
  const final = new ResultDetail();
  final.resourceId = '00';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculationActionsComponent,
        TicketCountComponent,
        ResourceNameByIdPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResettleCheckerComponent,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
        IntervalBackgroundPipe,
        NotReadyMatchComponent,
        CalculationMatchDetailComponent
      ],
      providers: [
        MessageBoxService,
        AioService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        NgbModal,
        ResourceNameByIdPipe,
        IntervalBackgroundPipe,
        VerificationService,
        VerificationBaseService,
        ResultByTeamNamePipe,
        ESportsService,
        ToastContainerDirective,
        ToastrService
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculationActionsComponent);
        component = fixture.componentInstance;
        component.match = match;
        aioService = fixture.debugElement.injector.get(AioService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
      });
  }));

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  describe("calculate", () => {
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

    it('should show error message when have not selected maps', () => {
      const resultDetails = CreateDataTest.CreateResultDetail("00", "1", "2", false);
      match.resultDetails = resultDetails;
      component.match = match;
      spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Resources.UnSelectedMapForCalculation);
    });

    it('should show error message when selected results are confirmed to refund', () => {
      const resultDetails = CreateDataTest.CreateResultDetail("00", "1", "2", true);
      const resultSettingData = new ResultSettingModel();
      resultSettingData.isConfirmedRefund = true;
      resultDetails[0].resultSettingData = resultSettingData;
      match.resultDetails = resultDetails;
      component.match = match;
      spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    });

    it('should show error message when invalid score and permission is not Leader', () => {

      spyOn(verificationService, 'invalidInputScore').and.returnValue(true);
      spyOn(toastrService, 'error');

      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankScore);
    });

    it('should show error message when invalid score and permission is Leader', () => {

      spyOn(verificationService, 'invalidInputScore').and.returnValue(true);
      spyOn(toastrService, 'error');
      component.isLeader = true;
      component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.leader.blankScore);
    });

    it('should show error message when there are running odds', fakeAsync(() => {
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe("uncalculate", () => {
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

    it("Pass all validation and uncalculation is successful." +
      "Should error message is empty and close popup.",
      fakeAsync(() => {
        spyOn(aioService, "push").and.returnValue(of(successfulResult));
        spyOn(closePopupService, "closePopup");
        spyOn(toastrService, 'error');
        component.uncalculate();
        tick();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        expect(toastrService.error).not.toHaveBeenCalled();
      })
    );

    it("Pass all validation and uncalculation is unsuccessful." +
      "Should return an error.", fakeAsync(() => {
        spyOn(aioService, "push").and.returnValue(of(unSuccessfulResult));
        spyOn(toastrService, 'error');

        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      }));
  });

  describe("getMatch", () => {
    it("should true for hedgeMatch and enableUncalculate", async () => {
      match.resultDetails = CreateDataTest.CreateResultDetail(
        "00",
        "1",
        "2",
        true
      );
      match.hedgeMatchDetail = new HedgeMatchDetail();
      spyOn(aioService, 'getMatch').and.returnValue(of(match));
      component.match = match;
      await component.getMatch(match.matchDetail.matchId, 'url');

      expect(component.applyHedgeMatch).toBe(true);
      expect(component.enableUncalculate).toBe(true);
    });

    it("should call initial functions", async () => {

      spyOn(verificationService, 'enableUncalculateButton');
      spyOn(verificationService, 'hasTicketBetOnMap');
      spyOn(verificationService, 'generateExternalScores');
      spyOn(verificationService, 'autoFillScore');
      spyOn(aioService, 'getMatch').and.returnValue(of(match));
      component.match = match;
      await component.getMatch(match.matchDetail.matchId, 'url');

      expect(verificationService.enableUncalculateButton).toHaveBeenCalled();
      expect(verificationService.hasTicketBetOnMap).toHaveBeenCalled();
      expect(verificationService.generateExternalScores).toHaveBeenCalled();
      expect(verificationService.autoFillScore).toHaveBeenCalled();
    });
  });

  it("finalScore value should equal sum maps", () => {
    const resultDetails = CreateDataTest.CreateResultDetail(
      "01",
      "1",
      "2",
      false
    );
    const final = new ResultDetail();
    final.resourceId = "00";
    resultDetails.push(final);
    component.match = match;
    component.match.resultDetails = resultDetails;
    component.matchDetail = matchDetail;

    component.changeScore();

    const finalScore = component.match.resultDetails.find(
      (m) => m.resourceId === "00"
    );
    expect(finalScore.homeValue).toBe("1");
    expect(finalScore.awayValue).toBe("2");
  });

  it("should return true when have not input value", () => {
    match.isClickOnCalculate = true;
    matchDetail.bestOfMap = 3;
    component.matchDetail = matchDetail;
    component.match = match;
    component.isScoreDirect = false;
    resultDetail.checked = true;

    const isError = component.isErrorOnVerification(resultDetail, "");
    expect(isError).toBe(true);
  });

  it("checkMapIsMatched - should set map mismatch score", () => {
    component.match = match;
    const map = new ResultDetail();
    spyOn(verificationService, "isMismatchedWarning").and.returnValue(false);

    component.checkMapIsMatched(map);

    expect(map.isScoreMismatched).toBe(false);
  });


  it("onResettleCheckboxChange - should change resettle status", () => {
    component.onResettleCheckboxChange(true);
    expect(component.isReSettledTickets).toBe(true);
  });

  it('selectedOnMap - should set false for isClickOnCalculate', () => {
    component.match = match;

    component.selectedOnMap();

    expect(component.match.isClickOnCalculate).toBe(false);
  });

  it('selectedOnFullTime - should verify full time score', fakeAsync(() => {

    spyOn(verificationService, 'getNewFinalResource').and.returnValue('');
    spyOn(verificationService, 'verifyFinalResource').and.returnValue('confirm message');
    spyOn(verificationService, 'changeToNewFinalResource');
    component.match = match;
    component.selectedOnFullTime();
    const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();
    expect(verificationService.changeToNewFinalResource).toHaveBeenCalled();
    expect(component.confirmationDialogMessage.message).toEqual("confirm message");
  }));

  it('changeInputDirectly - should check final map only', () => {
    resultDetail.resourceId = '00';
    match.resultDetails = [resultDetail];
    component.match = match;
    component.isScoreDirect = true;

    component.changeInputDirectly();

    expect(resultDetail.checked).toBe(true);
  });

  it('isFullTimeMismatched - should call esports service method', () => {
    component.match = match;
    spyOn(verificationService, 'isFullTimeMismatched').and.returnValue(true);

    const result = component.isFullTimeMismatched();

    expect(result).toBe(true);
  });

  it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
    const resultDetail = new ResultDetail();
    match.resultDetails = [resultDetail];
    spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
    spyOn(verificationService, 'getChangedScores').and.returnValue([]);
    spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
    component.match = match;
    component.saveScore();
    const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
    buttonYes.click();
    tick();

    expect(aioService.saveScore).toHaveBeenCalled();
  }));

  it('verifyAndAutoFillScore - should verify and auto fill score', () => {
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
  });

  it('autoFillScoreOnLoad - should auto fill maps and final', () => {
    resultDetail.resourceId = 'M1';
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
    spyOn(verificationService, 'autoFillScore').and.returnValue(true);

    component.autoFillScoreOnLoad([resultDetail, final]);

    expect(final.isScoreMismatched).toBe(false);
  });

  describe('isFinalScoreDisabled', () => {
    it('should return false for leader score direct last map', () => {
      component.isLeader = true;
      component.matchDetail = new MatchDetail();
      component.matchDetail.bestOfMap = 3;
      component.isScoreDirect = true;

      const result = component.isFinalScoreDisabled(true);

      expect(result).toBe(false);
    });

    it('should return true for leader score direct on other maps', () => {
      component.isLeader = true;
      component.matchDetail = new MatchDetail();
      component.matchDetail.bestOfMap = 3;
      component.isScoreDirect = true;

      const result = component.isFinalScoreDisabled(false);

      expect(result).toBe(true);
    });

    it('should return true for non-leader', () => {
      component.isLeader = false;

      const result = component.isFinalScoreDisabled(false);

      expect(result).toBe(true);
    });
  });

  it('isSaveScoreDisabled - should return false when exist map checked', () => {
    const map = new ResultDetail();
    map.checked = true;
    match.resultDetails = [map];
    component.match = match;

    const result = component.isSaveScoreDisabled();

    expect(result).toBe(false);
  });

  describe('updateOutsideScore', () => {
    it('update outside total points when have at least two scores', () => {
      const mapOne = new ResultDetail();
      const mapTwo = new ResultDetail();
      const external = new ExternalResultDetail(1, '', '');
      final.externalScores = [external, external, external, external];
      external.resourceId = '0101';
      external.awayValue = '1';
      external.homeValue = '2';
      mapOne.externalScores = [external, external, external, external];
      mapTwo.externalScores = [external, external, external, external];
      match.resultDetails = [mapOne, mapTwo, final];
      match.isScoreDirect = false;
      component.matchDetail = match.matchDetail;
      component.match = match;

      component.updateOutsideScore(1);

      expect(final.externalScores[0].awayValue).toEqual('2');
      expect(final.externalScores[0].homeValue).toEqual('4');
    });

    it('update outside score when only has one score', () => {
      const mapOne = new ResultDetail();
      const external = new ExternalResultDetail(1, '', '');
      final.externalScores = [external, external, external, external];
      external.awayValue = '1';
      external.homeValue = '2';
      mapOne.externalScores = [external, external, external, external];
      match.resultDetails = [mapOne, final];
      component.match = match;
      component.matchDetail = match.matchDetail;

      component.updateOutsideScore(1);

      expect(final.externalScores[0].awayValue).toEqual('1');
      expect(final.externalScores[0].homeValue).toEqual('2');
    });
  });
});
