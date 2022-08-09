import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
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
  TicketCountComponent,
  NotReadyMatchComponent
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
import { TennisService, VerificationService } from '../services';
import { ResultDetail, MatchDetail, Permission, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { MaterialModule } from '../../shared/material-module';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { ResultSettingModel } from '../../shared/models';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { Language } from '../../shared/language';

describe('Tennis - Calculate actions component', () => {
  let component: CalculateActionsComponent;
  let fixture: ComponentFixture<CalculateActionsComponent>;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  let tennisService: TennisService;
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
  const resultDetail = new ResultDetail();
  resultDetail.resultSettingData = new ResultSettingModel();
  resultDetail.externalScores = [];
  resultDetail.resourceId = "01";
  const totalSets = new ResultDetail();
  totalSets.externalScores = [];
  totalSets.resourceId = '00';
  const totalGames = new ResultDetail();
  totalGames.resourceId = '06';
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  match.permission = new Permission();
  const externalResult = new ExternalResultDetail(1, '01', '');
  const externalResultTotalGames = new ExternalResultDetail(1, '06', '');
  const externalResultTotalSets = new ExternalResultDetail(1, '00', '');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculateActionsComponent,
        ResourceNameByIdPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        CalculateMatchDetailComponent,
        TicketCountComponent,
        ResultByTeamNamePipe,
        ExternalSourceNamePipe,
        ExternalLinkPipe,
      ],
      providers: [
        IntervalBackgroundPipe,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        TennisService,
        AioService,
        VerificationService,
        NgbModal,
        ResourceNameByIdPipe,
        ResultByTeamNamePipe,
        IntervalCalculationService,
        ToastContainerDirective,
        { provide: ToastrService, useClass: ToastrService },
        { provide: MessageBoxService, useClass: MessageBoxService },
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
        fixture = TestBed.createComponent(CalculateActionsComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        tennisService = fixture.debugElement.injector.get(TennisService);
        verificationService = fixture.debugElement.injector.get(VerificationService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   describe("calculate", () => {
    it('should alert when fail to verify selected maps and score', () => {
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(true);
      spyOn(toastrService, 'error');
      spyOn(toastrService, 'clear');

      component.calculate();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith(Language.sop.nonLeader.blankScore);
    });

    it('should push and save score when all verifications passed', fakeAsync(async () => {
      component.match = match;
      resultDetail.checked = true;
      resultDetail.homeValue = '1';
      resultDetail.awayValue = '1';
      resultDetail.resourceId = '00';
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(false));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue(true);

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalled();
      expect(aioService.saveScore).toHaveBeenCalled();
    }));

    it('should set error message when calculate unsuccessfully', fakeAsync(() => {
      component.match = match;
      component.match.resultDetails = [resultDetail, totalSets];
      component.isLeader = true;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue(true);
      spyOn(toastrService, 'error');

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should set error message when save score unsuccessfully', fakeAsync(() => {
      component.match = match;
      component.match.resultDetails = [resultDetail, totalSets];
      component.isLeader = true;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(unSuccessfulResult));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue(true);
      spyOn(toastrService, 'error')

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should push after confirm three times when outside score verification is fail and isLeader', fakeAsync(() => {
      component.match = match;
      component.match.resultDetails = [resultDetail, totalSets];
      component.isLeader = true;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(false);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(true);
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(false);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue(true);
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

    it('should alert when missing score source for maps and user is not leader', fakeAsync(() => {
      component.match = match;
      resultDetail.checked = true;
      component.match.resultDetails = [resultDetail];
      component.isLeader = false;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(false);
      spyOn(toastrService, 'error');

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.insufficientSources);
    }));

    it('should alert when score is mismatch and user is not leader', fakeAsync(() => {
      component.match = match;
      resultDetail.checked = true;
      component.match.resultDetails = [resultDetail];
      component.isLeader = false;
      component.isReSettledTickets = true;
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(true);
      spyOn(toastrService, 'error');

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.nonLeader.mismatchedScore);
    }));

    it('should alert when there are running odds', fakeAsync(() => {
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      spyOn(toastrService, 'error');
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(unSuccessfulResult));

      component.calculate();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should show confirm when result changed.', fakeAsync(async () => {
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      const message = "WARNING! Changing score may affect settled tickets. Do you want to automatically select to recalculate settled tickets also?";
      spyOn(messageBoxService, 'confirm');
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);

      component.calculate();
      tick();

      expect(component.confirmationDialogMessage.message).toEqual(message);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    }));

    it('should set recalculate tickets when settled match not selected', fakeAsync(() => {
      component.match = match;
      resultDetail.checked = true;
      resultDetail.homeValue = '1';
      resultDetail.awayValue = '1';
      resultDetail.resourceId = '00';
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      component.isReSettledTickets = false;

      spyOn(verificationService, 'invalidInputScore').and.returnValue(false);
      spyOn(aioService, 'verifyNoRunningOdds').and.returnValue(of(successfulResult));
      spyOn(verificationService, 'allMapHaveScoreSources').and.returnValue(true);
      spyOn(verificationService, 'isExistMismatchScore').and.returnValue(false);
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');
      spyOn(verificationService, 'getOutsideScores').and.returnValue([]);
      spyOn(verificationService, 'getChangedScores').and.returnValue([]);
      spyOn(aioService, 'saveScore').and.returnValue(of(successfulResult));
      spyOn(aioService, 'verifyChangedSettledTickets').and.returnValue(of(true));
      spyOn(verificationService, 'verifyMatchScoreOnCalculation').and.returnValue(true);
      spyOn(verificationService, 'verifyIntervalsOnCalculation').and.returnValue(true);

      component.calculate();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.isReSettledTickets).toBe(true);
    }));

    it('should alert when exist result confirmed', fakeAsync(() => {
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

  describe('uncalculate', () => {
    it('Pass all validation and uncalculation is successful.'
      + 'Should error message is empty and close popup.', fakeAsync(() => {
        const resultDetails: ResultDetail[] = [resultDetail, totalSets];
        resultDetail.checked = true;
        match.resultDetails = resultDetails;
        component.match = match;
        spyOn(aioService, 'push').and.returnValue(of(successfulResult));
        spyOn(closePopupService, 'closePopup');
        spyOn(toastrService, 'error');
        component.uncalculate();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).not.toHaveBeenCalled();
        expect(closePopupService.closePopup).toHaveBeenCalled();
      }));

    it('Pass all validation and uncalculation is unsuccessful. Should return an error.', fakeAsync(() => {
        const resultDetails: ResultDetail[] = [resultDetail, totalSets];
        resultDetail.resourceId = "01";
        resultDetail.checked = true;
        match.resultDetails = resultDetails;
        component.match = match;
        spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));
        spyOn(toastrService, 'error');
        component.uncalculate();
        tick();

        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
      }));

    it('show set home value and away value equal to blank', fakeAsync(() => {

      const resultDetails: ResultDetail[] = [resultDetail, totalSets];
      resultDetail.awayValue = '1';
      resultDetail.homeValue = '2';
      resultDetail.checked = true;
      match.resultDetails = resultDetails;
      component.match = match;
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));
      spyOn(closePopupService, 'closePopup');

      component.uncalculate();

      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(resultDetail.awayValue).toEqual('');
      expect(resultDetail.homeValue).toEqual('');
    }));
  });

  it('selectedResources - should return checked sets', () => {
    const unchecked = new ResultDetail();
    resultDetail.checked = true;
    const resultDetails = [resultDetail, resultDetail, unchecked];
    component.match = match;
    component.match.resultDetails = resultDetails;

    const result = component.selectedResources;

    expect(result.length).toEqual(2);
  });

  it('totalGames - should return total games only', () => {
    const resultDetails = [resultDetail, resultDetail, totalGames];
    match.resultDetails = resultDetails;
    component.match = match;

    const result = component.totalGames;

    expect(result).toEqual(totalGames);
  });

  it('totalSets - should return total sets only', () => {
    totalSets.checked = true;
    totalSets.homeValue = '';
    totalSets.awayValue = '';
    totalSets.isScoreMismatched = false;
    const resultDetails = [resultDetail, resultDetail, totalSets];
    match.resultDetails = resultDetails;
    component.match = match;

    const result = component.totalSets;

    expect(result).toEqual(totalSets);
  });

  describe('changeScore.', () => {
    beforeEach(() => {
      component.match = match;
      component.match.isScoreDirect = false;
    });

    it('should set correct value when score change.', () => {
      resultDetail.awayValue = '1';
      resultDetail.homeValue = '2';
      resultDetail.checked = true;
      const resultDetails: ResultDetail[] = [resultDetail, totalSets, totalGames];
      component.match.resultDetails = resultDetails;

      spyOn(verificationService, 'isScoreConsecutive').and.returnValue(true);

      component.changeScore();

      expect(component.totalSets.homeValue).toEqual('1');
      expect(component.totalSets.awayValue).toEqual('0');
      expect(component.totalGames.homeValue).toEqual('2');
      expect(component.totalGames.awayValue).toEqual('1');
    });

    it('set total set and total game value equal to blank when score is consecutive.', () => {
      const resultDetails: ResultDetail[] = [resultDetail, totalSets, totalGames];
      resultDetail.awayValue = '1';
      resultDetail.homeValue = '2';
      resultDetail.checked = true;
      component.match.resultDetails = resultDetails;
      spyOn(verificationService, 'isScoreConsecutive').and.returnValue(false);

      component.changeScore();

      expect(component.totalSets.homeValue).toEqual('');
      expect(component.totalSets.awayValue).toEqual('');
      expect(component.totalGames.homeValue).toEqual('');
      expect(component.totalGames.awayValue).toEqual('');
    });
  });

  it('autoFillScoreOnLoad - should auto fill maps and final', () => {
    resultDetail.resourceId = 'M1';
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    totalSets.resourceId = '00';
    totalSets.homeValue = '1';
    totalSets.awayValue = '1';
    match.resultDetails = [resultDetail, totalSets, totalGames];
    component.match = match;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);
    spyOn(verificationService, 'autoFillScore').and.returnValue(true);

    component.autoFillScoreOnLoad([resultDetail, totalSets, totalGames]);

    expect(totalSets.isScoreMismatched).toBe(false);
  });

  it('should verify and auto fill score', () => {
    totalSets.homeValue = '1';
    totalSets.awayValue = '1';
    match.resultDetails = [totalSets];
    component.match = match;
    spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);
    spyOn(verificationService, 'autoFillScore');

    component.verifyAndAutoFillScore(totalSets);

    expect(totalSets.isScoreMismatched).toBe(false);
  });

  it('isErrorOnVerification - return correct value', () => {
    component.match = match;
    component.match.isScoreDirect = true;
    component.match.isClickOnCalculate = true;
    totalSets.checked = true;

    const result = component.isErrorOnVerification(totalSets, '');

    expect(result).toEqual(true);
  });

  it("checkMapIsMatched - should set map mismatch score", () => {
    match.resultDetails = [totalSets, totalGames];
    component.match = match;
    component.match.isScoreDirect = false;
    const map = new ResultDetail();
    spyOn(verificationService, "isMismatchedWarning").and.returnValue(false);

    component.checkMapIsMatched(map);

    expect(map.isScoreMismatched).toBe(false);
    expect(totalSets.isScoreMismatched).toBe(false);
    expect(totalGames.isScoreMismatched).toBe(false);
  });

  it('saveScore - should push successfully when user confirm save score', fakeAsync(() => {
    const resultDetails: ResultDetail[] = [resultDetail, totalSets];
    component.match = match;
    component.match.resultDetails = resultDetails;
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

  describe('updateOutsideTotalGames', () => {
    beforeEach(() => {
      externalResult.homeValue = '1';
      externalResult.awayValue = '2';
      const setTwo = new ResultDetail();
      setTwo.resourceId = '02';
      setTwo.externalScores = [externalResult]
      resultDetail.externalScores = [externalResult];
      totalGames.externalScores = [externalResultTotalGames];
      totalSets.externalScores = [externalResult, externalResult ,externalResult, externalResultTotalSets];
      match.resultDetails = [resultDetail, setTwo, totalGames, totalSets];
      match.isScoreDirect = false;
      component.match = match;
    });
    it('update correct outSide source for total games.', () => {
      spyOn(verificationService, 'isScoreConsecutive').and.returnValue(true);
      spyOn(verificationService, 'isMismatchedWarning').and.returnValue(false);

      component.updateOutsideScore(1);

      expect(externalResultTotalGames.homeValue).toEqual('2');
      expect(externalResultTotalGames.awayValue).toEqual('4');
      expect(externalResultTotalSets.awayValue).toEqual('2');
      expect(externalResultTotalSets.homeValue).toEqual('0');
      expect(component.totalGames.isScoreMismatched).toEqual(false);
    });

    it('update blank outSide source for total games when score is Consecutive.', () => {
      spyOn(verificationService, 'isScoreConsecutive').and.returnValue(false);

      component.updateOutsideScore(1);

      expect(externalResultTotalGames.homeValue).toEqual('');
      expect(externalResultTotalGames.awayValue).toEqual('');
      expect(externalResultTotalSets.awayValue).toEqual('');
      expect(externalResultTotalSets.homeValue).toEqual('');
    });
  });
});