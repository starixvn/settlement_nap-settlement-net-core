import { TestBed } from '@angular/core/testing';
import { ScoreValidationHandler } from './score-validation.handler';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { ScoreService } from '../../../components/calc/services/score.service';
import { Language } from '../../../../shared/language.native';
import { CalculateAction, ScoreSourceType } from '../../../../shared/constants';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from '../../../components/calc/services/request.service';
import { MessageBoxService } from '../../../../shared/services';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';

describe('ScoreValidationHandler', () => {
  let handler: ScoreValidationHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let scoreService: ScoreService;
  let storage: CalculateBaseStorage;

  const createMockResultDetail = (externalScores: any[]): ResultDetail => ({
    externalScores
  } as ResultDetail);

  const createMockExternalScore = (sourceId: number, homeValue: string, awayValue: string) => ({
    sourceId,
    homeValue,
    awayValue
  } as any);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ScoreValidationHandler,
        VerifyScoreGoalService,
        ScoreService,
        CalculateStorage,
        ToastrService,
        RequestService,
        MessageBoxService,
        ResultByTeamNamePipe,
        VerificationBaseService
      ]
    });

    handler = TestBed.inject(ScoreValidationHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    scoreService = TestBed.inject(ScoreService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.error = jest.fn();
    scoreService.confirmCopyScore = jest.fn();
  });

  describe('when both HT and FT scores are invalid', () => {
    it('should call storage.error with noSBOScore message', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '', '')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '', '')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledTimes(2);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noSBOScore);
      expect(scoreService.confirmCopyScore).not.toHaveBeenCalled();
    });
  });

  describe('when HT score is invalid and FT score is valid', () => {
    it('should call confirmCopyScore with final score action', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '2', '1')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '', '')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn()
        .mockReturnValueOnce(true) 
        .mockReturnValueOnce(false);  

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, '2', '1'); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, '', ''); // HT check
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyFinalScore,
        CalculateAction.copyFTScore
      );
      expect(storage.error).not.toHaveBeenCalled();
    });
  });

  describe('when HT score is valid and FT score is invalid', () => {
    it('should call confirmCopyScore with half-time score action', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '', '')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '1', '0')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn()
        .mockReturnValueOnce(false) // FT invalid
        .mockReturnValueOnce(true);  // HT valid

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, '', ''); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, '1', '0'); // HT check
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyHalfTimeScore,
        CalculateAction.copyHTScore
      );
      expect(storage.error).not.toHaveBeenCalled();
    });
  });

  describe('when both HT and FT scores are valid', () => {
    it('should call confirmCopyScore with copy all score action', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '2', '1')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '1', '0')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, '2', '1'); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, '1', '0'); // HT check
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyScore,
        CalculateAction.copyAllScore
      );
      expect(storage.error).not.toHaveBeenCalled();
    });
  });

  describe('edge cases with external scores', () => {
    it('should handle case when no SBO score source is found in FT results', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.trader, '2', '1') // No SBO source
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '1', '0')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn()
        .mockReturnValueOnce(false) // FT invalid (no SBO source)
        .mockReturnValueOnce(true);  // HT valid

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, undefined, undefined); // FT check with undefined
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, '1', '0'); // HT check
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyHalfTimeScore,
        CalculateAction.copyHTScore
      );
    });

    it('should handle case when no SBO score source is found in HT results', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, '2', '1')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.trader, '1', '0') // No SBO source
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn()
        .mockReturnValueOnce(true)  // FT valid
        .mockReturnValueOnce(false); // HT invalid (no SBO source)

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, '2', '1'); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, undefined, undefined); // HT check with undefined
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyFinalScore,
        CalculateAction.copyFTScore
      );
    });

    it('should handle empty external scores arrays', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([]);
      const htResultDetail = createMockResultDetail([]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, undefined, undefined); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, undefined, undefined); // HT check
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noSBOScore);
    });

    it('should find SBO score among multiple external scores', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.trader, '1', '1'),
        createMockExternalScore(ScoreSourceType.Sbo, '2', '1'),
        createMockExternalScore(ScoreSourceType.screenshot, '3', '1')
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.screenshot, '0', '0'),
        createMockExternalScore(ScoreSourceType.Sbo, '1', '0'),
        createMockExternalScore(ScoreSourceType.trader, '2', '0')
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, '2', '1'); // FT SBO score
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, '1', '0'); // HT SBO score
      expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
        Language.soccer.confirmCopyScore,
        CalculateAction.copyAllScore
      );
    });

    it('should handle null/undefined score values', () => {
      // Arrange
      const ftResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, null, undefined)
      ]);
      const htResultDetail = createMockResultDetail([
        createMockExternalScore(ScoreSourceType.Sbo, undefined, null)
      ]);

      storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
      storage.getHalfTimeResult = jest.fn().mockReturnValue(htResultDetail);
      verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(1, null, undefined); // FT check
      expect(verifyScoreGoalService.isScoresValid).toHaveBeenNthCalledWith(2, undefined, null); // HT check
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noSBOScore);
    });
  });
});
