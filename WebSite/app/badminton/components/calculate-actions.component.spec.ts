import { TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ResourceNameByIdPipe } from '../pipes';
import {
  MessageBoxService,
  AioService,
} from '../../shared/services';
import { UrlHelper } from '../../helper';
import { Match, HedgeMatchDetail, ChildMatch } from '../models';
import { BadmintonService, VerificationService } from '../services';
import { Result, ResultSettingModel } from '../../shared/models';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ResultPipe } from '../../shared/pipes/result.pipe';
import { BadmintonApiKeys, Resources } from '../constants';
import { SportType } from '../../shared/constants';
import { Language } from '../../shared/language.native';
import { CalculateActionsComponent } from './calculate-actions.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';

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
    item.resultSettingData = new ResultSettingModel();
    const resultDetails: ResultDetail[] = [];
    resultDetails.push(item);
    return resultDetails;
  }

  public static createResultDetail(
    resourceId: string = "0101",
    checked: boolean = true
  ): ResultDetail {
    const result = new ResultDetail();
    result.resourceId = resourceId;
    result.checked = checked;
    result.resultSettingData = new ResultSettingModel();
    return result;
  }
}

describe('Badminton - Calculate actions component', () => {
  let component: CalculateActionsComponent;
  let fixture: ComponentFixture<CalculateActionsComponent>;
  let aioService: AioService;
  let messageBoxService: MessageBoxService;
  let badmintonService: BadmintonService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult: Result = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: false
  };
  const unSuccessfulResult: Result = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: false
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalculateActionsComponent,
        HttpClientModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
        ResettleCheckerComponent,
        TicketCountComponent,
        CalculateMatchDetailComponent,
        ResourceNameByIdPipe,
        ExternalSourceNamePipe,
        ResultPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalculateActionsComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        badmintonService = fixture.debugElement.injector.get(BadmintonService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        toastrService.clear = jest.fn();
        toastrService.error = jest.fn();
        fixture.detectChanges();
        component.apiKeys = BadmintonApiKeys;
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("UnCalculate", () => {
    it("Pass all validation and unCalculation is successful. Should error message is empty and close popup.",
      fakeAsync(() => {
        match.resultDetails = CreateDataTest.CreateResultDetail("00","1","2", true);
        component.match = match;
        aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
        messageBoxService.closePopup = jest.fn();
        
        component.uncalculate();
        tick();
        flush();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(messageBoxService.closePopup).toHaveBeenCalled();
      })
    );

    it("Pass all validation and uncalculation is unsuccessful. Should return an error.",
      fakeAsync(() => {
        match.resultDetails = CreateDataTest.CreateResultDetail("00","1","2",true);
        component.match = match;

        aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
        component.uncalculate();
        tick();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
       
        flush();
        
        expect(aioService.push).toHaveReturnedWith(Promise.resolve(unSuccessfulResult));
        expect(toastrService.error).toBeCalled();

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
      aioService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));
      UrlHelper.getUrlParameter = jest.fn().mockReturnValue('6');

      await component.getMatch(12345);

      expect(component.applyHedgeMatch).toBe(true);
      expect(component.enableUncalculate).toBe(true);
    });

    it("should call initial functions", async () => {
      verificationService.isTicketOnGame = jest.fn();
      verificationService.generateExternalScores = jest.fn();
      aioService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));
      UrlHelper.getUrlParameter = jest.fn().mockReturnValue('9');

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
      component.match = match;
      component.match.isScoreDirect = false;
      resultDetail.checked = true;

      const isError = component.isErrorOnVerification(resultDetail, "");
      expect(isError).toBe(true);
    });

    it("checkMapIsMatched - should set map mismatch score", () => {
      const map = new ResultDetail();
      component.match = match;
      verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);

      component.checkMapIsMatched(map);

      expect(map.isScoreMismatched).toBe(false);
    });


    it("onResettleCheckboxChange - should change resettle status", () => {
      component.onResettleCheckboxChange(true);
      expect(component.isReSettledTickets).toBe(true);
    });

    it('selectedOnMap - should set false for isClickOnCalculate', () => {
      component.match = match;

      component.selectedOnMap(null);

      expect(component.match.isClickOnCalculate).toBe(false);
    });

    it('selectedOnLastMap - should verify full time score', () => {
      verificationService.verifyFinalResource = jest.fn();

      component.selectedOnLastMap(null);

      expect(verificationService.verifyFinalResource).toHaveBeenCalled();
    });

    it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
      component.apiKeys = BadmintonApiKeys;
      aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      verificationService.getChangedScores = jest.fn().mockReturnValue([]);
      verificationService.getOutsideScores = jest.fn().mockReturnValue([]);
      component.match = match;

      component.saveScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.saveScore).toHaveBeenCalled();
    }));

    it('getClass - return correct value', () => {
      verificationService.isFullTimeMismatched = jest.fn().mockReturnValue(true);
      badmintonService.getIntervalBackground = jest.fn().mockReturnValue("refunded");
      const result = new ResultDetail();

      const actual = component.getClass(result);

      expect(actual).toEqual("col-mismatched refunded");

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
    match.resultDetails = [final, totalPoint];
    component.match = match;
    component.match.matchDetail = matchDetail;
    verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);
    verificationService.autoFillScore = jest.fn();

    component.verifyAndAutoFillScore(final);

    expect(final.isScoreMismatched).toBe(false);
    expect(totalPoint.isScoreMismatched).toBe(false);
  });

  it('autoFillScoreOnLoad - should auto fill games and final', () => {
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    final.homeValue = '1';
    final.awayValue = '1';
    match.resultDetails = [resultDetail, final, totalPoint];
    component.match = match;
    verificationService.isMismatchedWarning = jest.fn().mockReturnValue(false);
    verificationService.autoFillScore = jest.fn();

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

  describe("calculate", () => {
    beforeEach(() => {
      component.match = match;
      component.permission = new Permission();
      
      // Mock the totalGames getter
      const mockTotalGames = new ResultDetail();
      mockTotalGames.checked = false;
      mockTotalGames.homeValue = '0';
      mockTotalGames.awayValue = '0';
      jest.spyOn(component, 'totalGames', 'get').mockReturnValue(mockTotalGames);
      
      // Mock the selectedResources getter
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([]);
    });

    it('should show error when no maps are selected', async () => {
      component.match.resultDetails = [];
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([]);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Resources.UnSelectedMapForCalculation);
    });

    it('should show error when result is confirmed for refund', async () => {
      const result = CreateDataTest.createResultDetail();
      result.resultSettingData.isConfirmedRefund = true;
      component.match.resultDetails = [result];
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.confirmRefund.calculateResultNotConfirmed);
    });

    it('should show error when input score is invalid for non-leader', async () => {
      const result = CreateDataTest.createResultDetail();
      component.match.resultDetails = [result];
      component.permission.isLeader = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankScore);
    });

    it('should show error when input score is invalid for leader', async () => {
      const result = CreateDataTest.createResultDetail();
      component.match.resultDetails = [result];
      component.permission.isLeader = true;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Selected intervals' \"Final Score\" must not be blank! Please check Score Sources or contact leaders.");
    });

    it('should show error when final time is draw for non-leader', async () => {
      const result = CreateDataTest.createResultDetail("00");
      result.homeValue = "1";
      result.awayValue = "1";
      component.match.resultDetails = [result];
      component.permission.isLeader = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      const mockTotalGames = new ResultDetail();
      mockTotalGames.checked = true;
      mockTotalGames.homeValue = '1';
      mockTotalGames.awayValue = '1';
      jest.spyOn(component, 'totalGames', 'get').mockReturnValue(mockTotalGames);
      verificationService.isFTDrawWithInputNormal = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.finalIsDraw);
    });

    it('should show confirmation when final time is draw for leader', async () => {
      const result = CreateDataTest.createResultDetail("00");
      result.homeValue = "1";
      result.awayValue = "1";
      component.match.resultDetails = [result];
      component.permission.isLeader = true;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      const mockTotalGames = new ResultDetail();
      mockTotalGames.checked = true;
      mockTotalGames.homeValue = '1';
      mockTotalGames.awayValue = '1';
      jest.spyOn(component, 'totalGames', 'get').mockReturnValue(mockTotalGames);
      verificationService.isFTDrawWithInputNormal = jest.fn().mockReturnValue(true);
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show error when directly calculating with child match', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      component.match.resultDetails = [result];
      component.match.isScoreDirect = true;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      const childMatch = new ChildMatch();
      childMatch.checked = true;
      childMatch.matchId = 123;
      childMatch.resourceId = "0101";
      childMatch.matchCode = "MATCH1";
      childMatch.eventStatus = "Running";
      component.match.childMatches = [childMatch];
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.directlyWithChildMAtch);
    });

    it('should show error when child match is consistent for volleyball', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      component.match.resultDetails = [result];
      component.match.matchDetail.sportType = SportType.volleyBall;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      const childMatch = new ChildMatch();
      childMatch.checked = true;
      childMatch.matchId = 123;
      childMatch.resourceId = "0101";
      childMatch.matchCode = "MATCH1";
      childMatch.eventStatus = "Running";
      component.match.childMatches = [childMatch];
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.consistentRelatedMatch);
    });

    it('should show error when cannot settle child match', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      const childMatch = new ChildMatch();
      childMatch.checked = true;
      childMatch.matchId = 123;
      childMatch.resourceId = "0101";
      childMatch.matchCode = "MATCH1";
      childMatch.eventStatus = "Running";
      childMatch.resultSettingData = new ResultSettingModel();
      component.match.childMatches = [childMatch];
      verificationService.verifyCannotSettleChildMatch = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.cannotSettleChildMatch);
    });

    it('should show confirmation for volleyball child match', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      result.externalScores = [];
      result.resultStatus = "Running";
      result.homeValue = "1";
      result.awayValue = "1";
      const totalGames = new ResultDetail();
      totalGames.checked = true;
      totalGames.resourceId = "00";
      totalGames.resultSettingData = new ResultSettingModel();
      totalGames.externalScores = [];
      totalGames.resultStatus = "Running";
      component.match.resultDetails = [result, totalGames];
      component.match.matchDetail.sportType = SportType.volleyBall;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.getChangedScores = jest.fn().mockReturnValue([]);
      const childMatch = new ChildMatch();
      childMatch.checked = true;
      childMatch.matchId = 123;
      childMatch.resourceId = "0101";
      childMatch.matchCode = "MATCH1";
      childMatch.eventStatus = "Running";
      childMatch.resultSettingData = new ResultSettingModel();
      childMatch.relatedResourceId = "0101";
      component.match.childMatches = [childMatch];
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show error when running odds exist', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
      verificationService.getCalculationConfirmMessage = jest.fn().mockReturnValue("Confirm message");
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve("Error message"));
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith("Error message");
    });

    it('should show error when no screenshot source', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(false);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.notScreenshot);
    });

    it('should show error when screenshot is mismatched', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.mismatchedScreenshot);
    });

    it('should show error when no score sources for non-leader', async () => {
      const result = new ResultDetail();
      result.checked = true;
      result.resourceId = "0101";
      result.resultSettingData = new ResultSettingModel();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.isLeader = false;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(false);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.insufficientSources);
    });

    it('should show confirmation when no score sources for leader', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.permission.isLeader = true;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(false);
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show error when score is mismatched for non-leader', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.permission.isLeader = false;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.mismatchedScore);
    });

    it('should show confirmation when score is mismatched for leader', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.permission.isLeader = true;
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(true);
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show error when intervals are inconsistent', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue("Error message");
      toastrService.error = jest.fn();

      await component.calculate();

      expect(toastrService.error).toHaveBeenCalledWith("Error message");
    });

    it('should show confirmation when settled tickets need to be recalculated', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(true));
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should show confirmation for calculation results', async () => {
      const result = CreateDataTest.createResultDetail();
      result.externalScores = [];
      result.resultStatus = "Running";
      component.match.resultDetails = [result];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
      verificationService.getCalculationConfirmMessage = jest.fn().mockReturnValue("Confirm message");
      messageBoxService.confirm = jest.fn();

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should save score and calculate successfully', fakeAsync(async () => {
      const result = CreateDataTest.createResultDetail();
      result.homeValue = "1";
      result.awayValue = "1";
      result.externalScores = [];
      result.resultStatus = "Running";
      const totalGames = new ResultDetail();
      totalGames.checked = true;
      totalGames.resourceId = "00";
      totalGames.resultSettingData = new ResultSettingModel();
      totalGames.externalScores = [];
      totalGames.resultStatus = "Running";
      component.match.resultDetails = [result, totalGames];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
      verificationService.getCalculationConfirmMessage = jest.fn().mockReturnValue("Confirm message");
      verificationService.getChangedScores = jest.fn().mockReturnValue([]);
      aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      aioService.pushChildMatch = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      messageBoxService.closePopup = jest.fn();
      messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
        callback();
      });

      await component.calculate();
      tick();

      expect(aioService.saveScore).toHaveBeenCalled();
      expect(aioService.push).toHaveBeenCalled();
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should show error when save score fails', fakeAsync(async () => {
      const result = CreateDataTest.createResultDetail();
      result.homeValue = "1";
      result.awayValue = "1";
      result.externalScores = [];
      result.resultStatus = "Running";
      const totalGames = new ResultDetail();
      totalGames.checked = true;
      totalGames.resourceId = "00";
      totalGames.resultSettingData = new ResultSettingModel();
      totalGames.externalScores = [];
      totalGames.resultStatus = "Running";
      component.match.resultDetails = [result, totalGames];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
      verificationService.getCalculationConfirmMessage = jest.fn().mockReturnValue("Confirm message");
      verificationService.getChangedScores = jest.fn().mockReturnValue([]);
      aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();
      messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
        callback();
      });

      await component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should show error when push fails', fakeAsync(async () => {
      const result = CreateDataTest.createResultDetail();
      result.homeValue = "1";
      result.awayValue = "1";
      result.externalScores = [];
      result.resultStatus = "Running";
      const totalGames = new ResultDetail();
      totalGames.checked = true;
      totalGames.resourceId = "00";
      totalGames.resultSettingData = new ResultSettingModel();
      totalGames.externalScores = [];
      totalGames.resultStatus = "Running";
      component.match.resultDetails = [result, totalGames];
      component.match.isScoreDirect = false;
      jest.spyOn(component, 'selectedResources', 'get').mockReturnValue([result]);
      verificationService.invalidInputScore = jest.fn().mockReturnValue(false);
      verificationService.verifyConsistentChildMatch = jest.fn().mockReturnValue(false);
      verificationService.verifyMatchScoreOnCalculation = jest.fn().mockReturnValue(null);
      aioService.checkingNoRunningOdds = jest.fn().mockReturnValue(Promise.resolve(null));
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.allMapHaveScoreSources = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchScore = jest.fn().mockReturnValue(false);
      verificationService.verifyIntervalsOnCalculation = jest.fn().mockReturnValue(null);
      aioService.verifyChangedSettledTickets = jest.fn().mockReturnValue(Promise.resolve(false));
      verificationService.getCalculationConfirmMessage = jest.fn().mockReturnValue("Confirm message");
      verificationService.getChangedScores = jest.fn().mockReturnValue([]);
      aioService.saveScore = jest.fn().mockReturnValue(Promise.resolve(successfulResult));
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));
      toastrService.error = jest.fn();
      messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => {
        callback();
      });

      await component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });
});