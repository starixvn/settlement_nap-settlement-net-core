import { TestBed, ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ResourceNameByIdPipe } from '../pipes';
import { CalculateActionsComponent } from './';
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
  IntervalCalculationService,
} from '../../shared/services';
import { Match, HedgeMatchDetail, } from '../models';
import { BadmintonService, VerificationService } from '../services';
import { ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { UrlHelper } from '../../helper';
import { ResultPipe } from '../../shared/pipes/result.pipe';
import { BadmintonApiKeys } from '../constants';


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
    const resultDetails: ResultDetail[] = [];
    resultDetails.push(item);
    return resultDetails;
  }
}

describe('Badminton - Calculate actions component', () => {
  let component: CalculateActionsComponent;
  let fixture: ComponentFixture<CalculateActionsComponent>;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let badmintonService: BadmintonService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
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

  const resultSettingData = new ResultSettingModel();
  const resultDetail = new ResultDetail();
  resultDetail.checked = true;
  resultDetail.resourceId = "0101";
  resultDetail.map = 0;
  resultDetail.awayValue = "1";
  resultDetail.homeValue = "2";
  resultDetail.resultStatusId = 1;
  resultDetail.settlementStatusId = 4;
  resultDetail.resultSettingData = resultSettingData;
  const final = new ResultDetail();
  final.resourceId = "00";
  const totalPoint = new ResultDetail();

  const totalGame = new ResultDetail();
  totalPoint.resourceId = "01";
  totalGame.resourceId = "00";
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  match.permission = new Permission();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculateActionsComponent,
        CalculateMatchDetailComponent,
        ResourceNameByIdPipe,
        ExternalSourceNamePipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        ResultPipe
      ],
      providers: [
        IntervalBackgroundPipe,
        MessageBoxService,
        BadmintonService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        AioService,
        VerificationService,
        NgbModal,
        ResourceNameByIdPipe,
        ResultByTeamNamePipe,
        IntervalCalculationService,
        ToastContainerDirective,
        ToastrService,
        { provide: MessageBoxService, useClass: MessageBoxService },
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
        fixture = TestBed.createComponent(CalculateActionsComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        badmintonService = fixture.debugElement.injector.get(BadmintonService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        spyOn(toastrService, 'clear');
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("calculate", () => {
    beforeEach(() => {
      component.apiKeys = BadmintonApiKeys;
    });
    it('should alert fail to verify selected maps and score', async () => {
      match.resultDetails = [];
      component.match = match;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    });

    it('should push twice and save score when all verifications passed', fakeAsync(async () => {
      component.match = match;
      resultDetail.checked = true;
      resultDetail.homeValue = '1';
      resultDetail.awayValue = '1';
      component.match.resultDetails = [resultDetail];
      component.match.hedgeMatchDetail = new HedgeMatchDetail();
      component.match.hedgeMatchDetail.matchId = 12345;
      component.isLeader = true;
      component.applyHedgeMatch = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');

      await component.calculate();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      await component.calculate();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(2);
      expect(aioService.saveScore).toHaveBeenCalled();
    }));

    it('should not push hedge match when not apply for hedge match', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      component.applyHedgeMatch = false;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');

      await component.calculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(1);
    }));

    it('should set error message when calculate unsuccessfully', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      component.applyHedgeMatch = false;
      component.isReSettledTickets = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');
      spyOn(toastrService, 'error');

      await component.calculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should set error message when save score unsuccessfully', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      component.applyHedgeMatch = false;
      component.isReSettledTickets = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(unSuccessfulResult));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');
      spyOn(toastrService, 'error');

      await component.calculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should alert when missing score source for maps and user is not leader', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = false;
      component.isReSettledTickets = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(false);
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it('should alert when score is mismatch and user is not leader', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = false;
      component.isReSettledTickets = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(true);
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it('should alert when pass validation and exist running odds', fakeAsync(async () => {
      component.match = match;
      component.match.resultDetails = [resultDetail];
      component.isLeader = false;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(errorMessage);
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should alert when exist result confirmed', fakeAsync(async () => {
      const result = new ResultDetail();
      result.resultSettingData = new ResultSettingModel();
      result.resultSettingData.isConfirmedRefund = true;
      result.checked = true;
      component.match = match;
      component.match.resultDetails = [result];
      spyOn(toastrService, 'error');

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalled();
    }));

    it('should set recalculate tickets when settled match not selected', fakeAsync(async () => {
      component.match = match;
      const total = new ResultDetail();
      total.checked = true;
      total.homeValue = '1';
      total.awayValue = '1';
      total.resourceId = '00';
      total.resultStatusId = 1;
      total.settlementStatusId = 4;
      total.resultSettingData = resultSettingData;
      component.match.resultDetails = [total];
      component.isLeader = true;
      spyOn(aioService, 'checkingNoRunningOdds').and.returnValue(null);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(true);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue('');

      await component.calculate();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBe(true);
    }));
  });


  describe("uncalculate", () => {
    it(
      "Pass all validation and uncalculation is successful." +
      "Should error message is empty and close popup.",
      fakeAsync(() => {
        match.resultDetails = CreateDataTest.CreateResultDetail(
          "00",
          "1",
          "2",
          true
        );
        component.match = match;
        spyOn(aioService, "push").and.returnValue(of(successfulResult));
        spyOn(messageBoxService, "closePopup");
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(
          buttonName
        )[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(messageBoxService.closePopup).toHaveBeenCalled();
      })
    );

    it(
      "Pass all validation and uncalculation is unsuccessful." +
      "Should return an error.",
      fakeAsync(() => {
        match.resultDetails = CreateDataTest.CreateResultDetail(
          "00",
          "1",
          "2",
          true
        );
        component.match = match;

        spyOn(aioService, "push").and.returnValue(of(unSuccessfulResult));
        spyOn(toastrService, 'error');
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(
          buttonName
        )[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      })
    );
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
      spyOn(UrlHelper, 'getUrlParameter').and.returnValue(6);

      await component.getMatch(12345);

      expect(component.applyHedgeMatch).toBe(true);
      expect(component.enableUncalculate).toBe(true);
    });

    it("should call initial functions", async () => {
      spyOn(verificationService, 'isTicketOnGame');
      spyOn(verificationService, 'generateExternalScores');
      spyOn(aioService, 'getMatch').and.returnValue(of(match));
      spyOn(UrlHelper, 'getUrlParameter').and.returnValue(9);

      await component.getMatch(12345);

      expect(verificationService.isTicketOnGame).toHaveBeenCalled();
      expect(verificationService.generateExternalScores).toHaveBeenCalled();
    });
  });

  describe('function related totalPoint and Match', () => {
    beforeEach(() => {
      const resultDetails = CreateDataTest.CreateResultDetail(
        "0101",
        "1",
        "2",
        false
      );
      const gameTwo = new ResultDetail();
      gameTwo.resourceId = '0102';
      gameTwo.homeValue = '2';
      gameTwo.awayValue = '2';
      resultDetails.push(gameTwo);
      resultDetails.push(final);
      resultDetails.push(totalPoint);
      resultDetails.push(totalGame);
      component.match = match;
      component.match.resultDetails = resultDetails;
    });

    it("MatchScore value should equal game win", () => {
      component.match = match;
      component.changeScore();

      expect(component.totalGames.homeValue).toEqual("0");
      expect(component.totalGames.awayValue).toEqual("1");
      expect(component.totalPoints.homeValue).toEqual('3');
      expect(component.totalPoints.awayValue).toEqual('4');
    });

    it("isErrorOnVerification - should return true when have not input value", () => {
      match.isClickOnCalculate = true;
      matchDetail.bestOfMap = 3;
      component.match = match;
      component.match.isScoreDirect = false;
      resultDetail.checked = true;

      const isError = component.isErrorOnVerification(resultDetail, "");
      expect(isError).toBe(true);
    });

    it("checkMapIsMatched - should set map mismatch score", () => {
      const map = new ResultDetail();
      component.match = match;
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

    it('selectedOnLastMap - should verify full time score', () => {
      spyOn(verificationService, 'verifyFinalResource');

      component.selectedOnLastMap();

      expect(verificationService.verifyFinalResource).toHaveBeenCalled();
    });

    it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
      component.apiKeys = BadmintonApiKeys;
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

    it('getClass - return correct value', () => {
      spyOn(verificationService, 'isFullTimeMismatched').and.returnValue(true);
      spyOn(badmintonService, 'getIntervalBackground').and.returnValue("class");
      const result = new ResultDetail();

      const actual = component.getClass(result);

      expect(actual).toEqual("col-mismatched class");

    });
  });

  it('changeInputDirectly - should check final map only', () => {
    match.resultDetails = [final];
    component.match = match;
    component.match.isScoreDirect = true;

    component.changeInputDirectly();

    expect(resultDetail.checked).toBe(true);
  });

  it('verifyAndAutoFillScore - should verify and auto fill score', () => {
    final.homeValue = '1';
    final.awayValue = '1';
    match.resultDetails = [final];
    component.match = match;
    component.match.matchDetail = matchDetail;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);
    spyOn(verificationService, 'autoFillScore');

    component.verifyAndAutoFillScore(final);

    expect(final.isScoreMismatched).toBe(false);
  });

  it('autoFillScoreOnLoad - should auto fill games and final', () => {
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    final.homeValue = '1';
    final.awayValue = '1';
    match.resultDetails = [resultDetail, final, totalPoint];
    component.match = match;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);
    spyOn(verificationService, 'autoFillScore').and.returnValue(true);

    component.autoFillScoreOnLoad([resultDetail, final]);

    expect(final.isScoreMismatched).toBe(false);
  });

  describe('isFinalScoreDisabled', () => {
    it('should return false for leader score direct last games', () => {
      component.isLeader = true;
      component.match = match;
      component.match.isScoreDirect = true;

      const result = component.isFinalScoreDisabled(final);

      expect(result).toBe(false);
    });

    it('should return true for leader score direct on other games', () => {
      component.isLeader = true;
      component.match = match;
      component.match.isScoreDirect = true;

      const result = component.isFinalScoreDisabled(resultDetail);

      expect(result).toBe(true);
    });

    it('should return true for non-leader', () => {
      component.isLeader = false;

      const result = component.isFinalScoreDisabled(resultDetail);

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

  describe('updateOutsideTotalPoints', () => {
    beforeAll(() => {
      totalGame.resourceId = "00";
      totalPoint.resourceId = "01";
    });
    it('update outside total points when have at least two scores', () => {
      const gameOne = new ResultDetail();
      const gameTwo = new ResultDetail();
      const external = new ExternalResultDetail(1, '', '');
      const externalTwo = new ExternalResultDetail(1, '', '');
      totalPoint.externalScores = [external, external, external, external];
      totalGame.externalScores = [externalTwo, externalTwo, externalTwo, externalTwo];
      external.resourceId = '0101';
      external.awayValue = '1';
      external.homeValue = '2';
      gameOne.externalScores = [external];
      gameTwo.externalScores = [external];
      match.resultDetails = [gameOne, gameTwo, totalPoint, totalGame];
      match.isScoreDirect = false;
      component.match = match;

      spyOn(verificationService, 'isOutsideScoreConsecutive').and.returnValue(true);

      component.updateOutsideScore(1);

      expect(totalPoint.externalScores[0].awayValue).toEqual('2');
      expect(totalPoint.externalScores[0].homeValue).toEqual('4');
      expect(totalGame.externalScores[0].awayValue).toEqual('0');
      expect(totalGame.externalScores[0].homeValue).toEqual('2');
    });

    it('update outside score when only has one score', () => {
      const gameOne = new ResultDetail();
      const external = new ExternalResultDetail(1, '', '');
      totalPoint.externalScores = [external, external, external, external];
      totalGame.externalScores = [external, external, external, external];
      external.awayValue = '1';
      external.homeValue = '2';
      gameOne.externalScores = [external];
      match.resultDetails = [gameOne, totalPoint, totalGame];
      component.match = match;

      component.updateOutsideScore(1);

      expect(totalPoint.externalScores[0].awayValue).toEqual('');
      expect(totalPoint.externalScores[0].homeValue).toEqual('');
      expect(totalGame.externalScores[0].awayValue).toEqual('');
      expect(totalGame.externalScores[0].homeValue).toEqual('');
    });

    it('update outside score when score not Consecutive', () => {
      const gameOne = new ResultDetail();
      const external = new ExternalResultDetail(1, '', '');
      totalPoint.externalScores = [external, external, external, external];
      totalGame.externalScores = [external, external, external, external];
      external.awayValue = '1';
      external.homeValue = '2';
      gameOne.externalScores = [external];
      match.resultDetails = [gameOne, totalPoint, totalGame];
      component.match = match;
      spyOn(verificationService, 'isScoreConsecutive').and.returnValue(false);

      component.updateOutsideScore(1);

      expect(totalPoint.externalScores[0].awayValue).toEqual('');
      expect(totalPoint.externalScores[0].homeValue).toEqual('');
    });

  });
});