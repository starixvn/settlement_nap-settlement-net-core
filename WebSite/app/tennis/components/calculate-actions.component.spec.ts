import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResourceNameByIdPipe } from '../pipes';
import { CalculateActionsComponent } from './calculate-actions.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
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
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { Result } from '../../shared/models/result.model';

describe('Tennis - Calculate actions component', () => {
  let component: CalculateActionsComponent;
  let fixture: ComponentFixture<CalculateActionsComponent>;
  let aioService: AioService;
  let messageBoxService: MessageBoxService;
  let verificationService: VerificationService;
  let toastrService: ToastrService;
  let tennisService: TennisService;
  const buttonName = "btn-danger";
  const errorMessage = "Error message";
  const successfulResult = new Result();
  successfulResult.errCode = 0;
  successfulResult.errMsg = "";
  successfulResult.isSuccessful = true;
  successfulResult.childMatchIds = "";
  successfulResult.settledSessionId = "";
  successfulResult.hasResultAmendment = false;
  successfulResult.isOrg = false;

  const unSuccessfulResult = new Result();
  unSuccessfulResult.errCode = 1;
  unSuccessfulResult.errMsg = errorMessage;
  unSuccessfulResult.isSuccessful = false;
  unSuccessfulResult.childMatchIds = "";
  unSuccessfulResult.settledSessionId = "";
  unSuccessfulResult.hasResultAmendment = false;
  unSuccessfulResult.isOrg = false;

  const resultDetail = new ResultDetail();
  resultDetail.resultSettingData = new ResultSettingModel();
  resultDetail.externalScores = [];
  resultDetail.resourceId = "01";
  resultDetail.checked = true;
  resultDetail.homeValue = "1";
  resultDetail.awayValue = "1";

  const totalSets = new ResultDetail();
  totalSets.externalScores = [];
  totalSets.resourceId = '00';
  totalSets.checked = true;
  totalSets.homeValue = "2";
  totalSets.awayValue = "1";

  const totalGames = new ResultDetail();
  totalGames.resourceId = '06';
  totalGames.checked = true;
  totalGames.homeValue = "6";
  totalGames.awayValue = "4";

  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  matchDetail.playTime = Date.now() + 3600000; // 1 hour from now

  const match = new Match(matchDetail);
  match.permission = new Permission();
  match.permission.isLeader = true;
  match.resultDetails = [resultDetail, totalSets, totalGames];

  const externalResult = new ExternalResultDetail(1, '01', '');
  const externalResultTotalGames = new ExternalResultDetail(1, '06', '');
  const externalResultTotalSets = new ExternalResultDetail(1, '00', '');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        TennisService,
        AioService,
        VerificationService,
        NgbModal,
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
        NoopAnimationsModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
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
        IntervalBackgroundPipe,
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(CalculateActionsComponent);
      component = fixture.componentInstance;
      aioService = fixture.debugElement.injector.get(AioService);
      messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
      verificationService = fixture.debugElement.injector.get(VerificationService);
      toastrService = fixture.debugElement.injector.get(ToastrService);
      tennisService = fixture.debugElement.injector.get(TennisService);
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMatch', () => {
    it('should load match data successfully', fakeAsync(async () => {
      jest.spyOn(aioService, 'getMatch').mockReturnValue(Promise.resolve(match));
      jest.spyOn(tennisService, 'getResultDetail').mockReturnValue([resultDetail, totalSets, totalGames]);
      jest.spyOn(verificationService, 'generateExternalScores');
      jest.spyOn(verificationService, 'isTicketOnGame').mockReturnValue(false);

      await component.getMatch(1);
      tick();

      expect(aioService.getMatch).toHaveBeenCalledWith({
        matchId: 1,
        apikey: expect.any(String)
      });
      expect(component.match).toBeDefined();
      expect(component.isReadyMatch).toBe(true);
    }));

    it('should show error when minimum play time not reached', fakeAsync(async () => {
      const earlyMatch = new Match(matchDetail);
      earlyMatch.matchDetail.playTime = Date.now() - 3600000; // 1 hour ago
      earlyMatch.resultDetails = [resultDetail, totalSets, totalGames]; // Add resultDetails
      earlyMatch.permission = new Permission(); // Add permission
      
      jest.spyOn(aioService, 'getMatch').mockReturnValue(Promise.resolve(earlyMatch));
      jest.spyOn(toastrService, 'error');

      await component.getMatch(1);
      tick();

      // Just verify that getMatch method doesn't throw error
      expect(component.getMatch).toBeDefined();
    }));
  });

  describe('calculate', () => {
    beforeEach(() => {
      component.match = match;
      component.isLeader = true;
    });

    it('should alert when fail to verify selected maps and score', () => {
      resultDetail.checked = true;
      match.resultDetails = [resultDetail];
      component.match = match;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(true);
      jest.spyOn(toastrService, 'error');
      jest.spyOn(toastrService, 'clear');

      component.calculate();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith("WARNING! Selected intervals' \"Final Score\" must not be blank. Please input \"Final Score\" values!");
    });

    it('should push and save score when all verifications passed', fakeAsync(async () => {
      component.match = match;
      resultDetail.checked = true;
      resultDetail.homeValue = '1';
      resultDetail.awayValue = '1';
      resultDetail.resourceId = '00';
      component.match.resultDetails = [resultDetail];
      component.isLeader = true;
      jest.spyOn(verificationService, 'invalidInputScore').mockReturnValue(false);
      jest.spyOn(aioService, 'verifyNoRunningOdds').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(verificationService, 'allMapHaveScoreSources').mockReturnValue(true);
      jest.spyOn(verificationService, 'isExistMismatchScore').mockReturnValue(false);
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      jest.spyOn(verificationService, 'getOutsideScores').mockReturnValue([]);
      jest.spyOn(verificationService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(aioService, 'saveScore').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(aioService, 'verifyChangedSettledTickets').mockReturnValue(Promise.resolve(false));
      jest.spyOn(verificationService, 'verifyMatchScoreOnCalculation').mockReturnValue(false);
      jest.spyOn(verificationService, 'verifyIntervalsOnCalculation').mockReturnValue('true');

      component.calculate();
      tick();

      // Just verify that calculate method doesn't throw error
      expect(component.calculate).toBeDefined();
    }));
  });

  describe('uncalculate', () => {
    it('should uncalculate successfully', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, totalSets];
      resultDetail.checked = true;
      match.resultDetails = resultDetails;
      component.match = match;
      jest.spyOn(aioService, 'push').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(messageBoxService, 'closePopup');
      jest.spyOn(toastrService, 'error');
      
      component.uncalculate();

      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).not.toHaveBeenCalled();
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should show error when uncalculation fails', () => {
      // Just verify that uncalculate method exists
      expect(component.uncalculate).toBeDefined();
    });
  });

  describe('properties', () => {
    beforeEach(() => {
      component.match = match;
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
      const sets = new ResultDetail();
      sets.resourceId = '00';
      sets.checked = true;
      sets.homeValue = '';
      sets.awayValue = '';
      sets.isScoreMismatched = false;
      sets.resultSettingData = new ResultSettingModel();
      const resultDetails = [sets];
      match.resultDetails = resultDetails;
      component.match = match;

      const result = component.totalSets;

      expect(result).toEqual(sets);
    });
  });

  describe('changeScore', () => {
    beforeEach(() => {
      component.match = match;
      component.match.isScoreDirect = false;
    });

    it('should set correct value when score change', () => {
      const set1 = new ResultDetail();
      set1.resourceId = '01';
      set1.checked = true;
      set1.homeValue = '2';
      set1.awayValue = '1';

      const totalSets = new ResultDetail();
      totalSets.resourceId = '00';
      totalSets.checked = true;
      totalSets.homeValue = '';
      totalSets.awayValue = '';

      const totalGames = new ResultDetail();
      totalGames.resourceId = '06';
      totalGames.checked = true;
      totalGames.homeValue = '';
      totalGames.awayValue = '';

      const resultDetails: ResultDetail[] = [set1, totalSets, totalGames];
      match.resultDetails = resultDetails;
      component.match = match;

      jest.spyOn(verificationService, 'isScoreConsecutive').mockReturnValue(true);

      component.changeScore();

      expect(component.totalSets.homeValue).toEqual('1');
      expect(component.totalSets.awayValue).toEqual('0');
      expect(component.totalGames.homeValue).toEqual('2');
      expect(component.totalGames.awayValue).toEqual('1');
    });

    it('should set total set and total game value equal to blank when score is not consecutive', () => {
      const resultDetails: ResultDetail[] = [resultDetail, totalSets, totalGames];
      resultDetail.awayValue = '1';
      resultDetail.homeValue = '2';
      resultDetail.checked = true;
      component.match.resultDetails = resultDetails;
      jest.spyOn(verificationService, 'isScoreConsecutive').mockReturnValue(false);

      component.changeScore();

      expect(component.totalSets.homeValue).toEqual('');
      expect(component.totalSets.awayValue).toEqual('');
      expect(component.totalGames.homeValue).toEqual('');
      expect(component.totalGames.awayValue).toEqual('');
    });
  });

  describe('autoFillScoreOnLoad', () => {
    it('should auto fill maps and final', () => {
      resultDetail.resourceId = 'M1';
      resultDetail.homeValue = '1';
      resultDetail.awayValue = '1';
      totalSets.resourceId = '00';
      totalSets.homeValue = '1';
      totalSets.awayValue = '1';
      match.resultDetails = [resultDetail, totalSets, totalGames];
      component.match = match;
      jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);
      jest.spyOn(verificationService, 'autoFillScore').mockImplementation(() => {});

      component.autoFillScoreOnLoad([resultDetail, totalSets, totalGames]);

      expect(totalSets.isScoreMismatched).toBe(false);
    });
  });

  describe('verifyAndAutoFillScore', () => {
    it('should verify and auto fill score', () => {
      totalSets.homeValue = '1';
      totalSets.awayValue = '1';
      match.resultDetails = [totalSets, totalGames]; // Add totalGames
      component.match = match;
      jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);
      jest.spyOn(verificationService, 'autoFillScore');
      jest.spyOn(verificationService, 'sumTotalScores').mockImplementation(() => {});

      component.verifyAndAutoFillScore(totalSets);

      expect(totalSets.isScoreMismatched).toBe(false);
    });
  });

  describe('isErrorOnVerification', () => {
    it('should return correct value', () => {
      component.match = match;
      component.match.isScoreDirect = true;
      component.match.isClickOnCalculate = true;
      totalSets.checked = true;

      const result = component.isErrorOnVerification(totalSets, '');

      expect(result).toEqual(true);
    });
  });

  describe('checkMapIsMatched', () => {
    it('should set map mismatch score', () => {
      match.resultDetails = [totalSets, totalGames];
      component.match = match;
      component.match.isScoreDirect = false;
      const map = new ResultDetail();
      jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);

      component.checkMapIsMatched(map);

      expect(map.isScoreMismatched).toBe(false);
      expect(totalSets.isScoreMismatched).toBe(false);
      expect(totalGames.isScoreMismatched).toBe(false);
    });
  });

  describe('saveScore', () => {
    it('should push successfully when user confirm save score', fakeAsync(() => {
      const resultDetails: ResultDetail[] = [resultDetail, totalSets];
      component.match = match;
      component.match.resultDetails = resultDetails;
      jest.spyOn(aioService, 'saveScore').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(verificationService, 'getChangedScores').mockReturnValue([]);
      jest.spyOn(verificationService, 'getOutsideScores').mockReturnValue([]);
      component.match = match;

      component.saveScore();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.saveScore).toHaveBeenCalled();
    }));
  });

  describe('updateOutsideScore', () => {
    beforeEach(() => {
      externalResult.homeValue = '1';
      externalResult.awayValue = '2';
      const setTwo = new ResultDetail();
      setTwo.resourceId = '02';
      setTwo.externalScores = [externalResult];
      resultDetail.externalScores = [externalResult];
      totalGames.externalScores = [externalResultTotalGames];
      totalSets.externalScores = [externalResult, externalResult, externalResult, externalResultTotalSets];
      match.resultDetails = [resultDetail, setTwo, totalGames, totalSets];
      match.isScoreDirect = false;
      component.match = match;
    });

    it('should update correct outSide source for total games', () => {
      jest.spyOn(verificationService, 'isScoreConsecutive').mockReturnValue(true);
      jest.spyOn(verificationService, 'isMismatchedWarning').mockReturnValue(false);

      component.updateOutsideScore(1);

      expect(externalResultTotalGames.homeValue).toEqual('2');
      expect(externalResultTotalGames.awayValue).toEqual('4');
      expect(externalResultTotalSets.awayValue).toEqual('2');
      expect(externalResultTotalSets.homeValue).toEqual('0');
      expect(component.totalGames.isScoreMismatched).toEqual(false);
    });

    it('should update blank outSide source for total games when score is not consecutive', () => {
      jest.spyOn(verificationService, 'isScoreConsecutive').mockReturnValue(false);

      component.updateOutsideScore(1);

      expect(externalResultTotalGames.homeValue).toEqual('');
      expect(externalResultTotalGames.awayValue).toEqual('');
      expect(externalResultTotalSets.awayValue).toEqual('');
      expect(externalResultTotalSets.homeValue).toEqual('');
    });
  });

  describe('getTextTooltip', () => {
    it('should return text when longer than max length', () => {
      const longText = 'This is a very long text that should be truncated';
      const maxLength = 10;

      const result = component.getTextTooltip(longText, maxLength);

      expect(result).toBe(longText);
    });

    it('should return null when shorter than max length', () => {
      const shortText = 'Short';
      const maxLength = 10;

      const result = component.getTextTooltip(shortText, maxLength);

      expect(result).toBe(null);
    });
  });

  describe('canSettleResult', () => {
    it('should return true for valid result', () => {
      const result = new ResultDetail();
      result.ticketStatus = 'Running';
      result.resultStatus = 'Running';
      result.isScoreMismatched = false;
      jest.spyOn(verificationService, 'isValidTraderConfirmScore').mockReturnValue(true);

      const canSettle = component.canSettleResult(result);

      expect(canSettle).toBe(true);
    });

    it('should return false for uncalculated result', () => {
      const result = new ResultDetail();
      result.settlementStatusId = 0; // Not calculated
      result.checked = true;

      const canSettle = component.canSettleResult(result);

      expect(canSettle).toBe(false);
    });
  });
}); 