import { TestBed } from '@angular/core/testing';
import { VerifyScoreConfirmHandler } from './verify-score-confirm.handler';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';
import { Language } from '../../../../shared/language.native';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Match, MatchDetailSoccer } from '../../../components/calc/models/match.model';
import { AbstractHandler } from '../../abstract.handler.native';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { HedgeMatchDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { CalculateAction } from '../../../../shared/constants/calculate-action.native';
import { ResultStatusId } from '../../../../shared/constants';
import { LeagueGroup, TimeMinute } from '../../../components/calc/models/constant.model';

describe('VerifyScoreConfirmHandler', () => {
  let handler: VerifyScoreConfirmHandler;
  let verificationService: VerificationBaseService;
  let storage: CalculateBaseStorage;

  const permission = new Permission();
  const matchDetail: MatchDetailSoccer = {
    playTime: 50,
    confirmHT: 1,
    confirmFT: 1,
    leagueGroupId: 1
  } as MatchDetailSoccer;

  const match: Match = {
    matchDetail,
    permission,
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: undefined,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: new HedgeMatchDetail,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  const halfTimeResult: ResultDetail = {
    resultStatusId: ResultStatusId.AutoCompleted,
    checked: true
  } as ResultDetail;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyScoreConfirmHandler,
        VerificationBaseService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService,
        RequestService,
        ResultByTeamNamePipe
      ]
    });

    handler = TestBed.inject(VerifyScoreConfirmHandler);
    verificationService = TestBed.inject(VerificationBaseService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTimeResult);
    storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculate);
    storage.error = jest.fn();

    // Reset match detail to default values
    matchDetail.playTime = 50;
    matchDetail.confirmHT = 1;
    matchDetail.confirmFT = 1;
    matchDetail.leagueGroupId = 1;
    halfTimeResult.resultStatusId = ResultStatusId.AutoCompleted;
    halfTimeResult.checked = true;
  });

  describe('validateHalfTimeCompletion', () => {
    it('should call storage.error when half-time is not completed for full-time calculation', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      halfTimeResult.resultStatusId = ResultStatusId.RunningOne;
      halfTimeResult.checked = false;

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeNotSettleYet);
    });

    it('should not validate half-time completion for half-time calculation', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      halfTimeResult.resultStatusId = ResultStatusId.RunningOne;
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalledWith(Language.soccer.halfTimeNotSettleYet);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('validateScoreConfirmation', () => {
    it('should call storage.error when half-time score is not confirmed for half-time calculation', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      matchDetail.playTime = 30; // Less than firstHalf (45)
      matchDetail.confirmHT = 0; // Not confirmed

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "HT"));
    });

    it('should call storage.error when full-time score is not confirmed for full-time calculation', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      matchDetail.playTime = 80; // Less than total (100)
      matchDetail.confirmFT = 0; // Not confirmed

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "FT"));
    });

    it('should call storage.error when full-time score is not confirmed for calculate action', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculate);
      matchDetail.playTime = 80; // Less than total (100)
      matchDetail.confirmFT = 0; // Not confirmed

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "FT"));
    });

    it('should bypass disable rule for pinGoal league', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      matchDetail.playTime = 30; // Less than firstHalf (45)
      matchDetail.confirmHT = 0; // Not confirmed
      matchDetail.leagueGroupId = LeagueGroup.pinGoal; // Should bypass
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "HT"));
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should bypass disable rule for pinGoalMarble league', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      matchDetail.playTime = 80; // Less than total (100)
      matchDetail.confirmFT = 0; // Not confirmed
      matchDetail.leagueGroupId = LeagueGroup.pinGoalMarble; // Should bypass
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "FT"));
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should bypass disable rule for sabaVirtual league', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      matchDetail.playTime = 80; // Less than total (100)
      matchDetail.confirmFT = 0; // Not confirmed
      matchDetail.leagueGroupId = LeagueGroup.sabaVirtual; // Should bypass
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalledWith(Language.soccer.scoreNotConfirmed.replaceAll('{0}', "FT"));
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('validateScreenshotSources', () => {
    it('should call storage.error when not all results have screenshot sources', async () => {
      // Arrange
      const resultDetails = [
        { checked: true, resourceId: '01' },
        { checked: true, resourceId: '02' }
      ] as ResultDetail[];
      match.resultDetails = resultDetails;
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(verificationService.allMapHaveScreenshotSource).toHaveBeenCalledWith(resultDetails);
      expect(storage.error).toHaveBeenCalledWith(Language.sop.notScreenshot);
    });

    it('should call storage.error when there are mismatched screenshot scores', async () => {
      // Arrange
      const resultDetails = [
        { checked: true, resourceId: '01' },
        { checked: true, resourceId: '02' }
      ] as ResultDetail[];
      match.resultDetails = resultDetails;
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(true);

      // Act
      await handler.handle(storage);

      // Assert
      expect(verificationService.isExistMismatchedScoreScreenshot).toHaveBeenCalledWith(resultDetails);
      expect(storage.error).toHaveBeenCalledWith(Language.sop.mismatchedScreenshot);
    });

    it('should call super.handle when all screenshot validations pass', async () => {
      // Arrange
      const resultDetails = [
        { checked: true, resourceId: '01' },
        { checked: true, resourceId: '02' }
      ] as ResultDetail[];
      match.resultDetails = resultDetails;
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(verificationService.allMapHaveScreenshotSource).toHaveBeenCalledWith(resultDetails);
      expect(verificationService.isExistMismatchedScoreScreenshot).toHaveBeenCalledWith(resultDetails);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('getCheckedResults filtering', () => {
    it('should only pass checked results to verification methods', async () => {
      // Arrange
      const resultDetails = [
        { checked: true, resourceId: '01' },
        { checked: false, resourceId: '02' },
        { checked: true, resourceId: '03' }
      ] as ResultDetail[];
      match.resultDetails = resultDetails;
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      const expectedCheckedResults = [
        { checked: true, resourceId: '01' },
        { checked: true, resourceId: '03' }
      ];

      // Act
      await handler.handle(storage);

      // Assert
      expect(verificationService.allMapHaveScreenshotSource).toHaveBeenCalledWith(expectedCheckedResults);
      expect(verificationService.isExistMismatchedScoreScreenshot).toHaveBeenCalledWith(expectedCheckedResults);
    });
  });

  describe('edge cases', () => {
    it('should handle empty result details', async () => {
      // Arrange
      match.resultDetails = [];
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(verificationService.allMapHaveScreenshotSource).toHaveBeenCalledWith([]);
      expect(verificationService.isExistMismatchedScoreScreenshot).toHaveBeenCalledWith([]);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle case where half-time result is checked for full-time calculation', async () => {
      // Arrange
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      halfTimeResult.resultStatusId = ResultStatusId.AutoCompleted;
      halfTimeResult.checked = true; // Checked, so should not trigger error
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');
      verificationService.allMapHaveScreenshotSource = jest.fn().mockReturnValue(true);
      verificationService.isExistMismatchedScoreScreenshot = jest.fn().mockReturnValue(false);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalledWith(Language.soccer.halfTimeNotSettleYet);
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });
});
