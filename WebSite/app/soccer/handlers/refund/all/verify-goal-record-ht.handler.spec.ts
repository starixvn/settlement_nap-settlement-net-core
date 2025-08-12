import { TestBed } from '@angular/core/testing';
import { VerifyGoalRecordHTHandler } from './verify-goal-record-ht.handler';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetailSoccer as MatchDetail, HedgeMatchDetail } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { RequestService } from '../../../components/calc/services/request.service';

describe('VerifyGoalRecordHTHandler', () => {
  let handler: VerifyGoalRecordHTHandler;
  let storage: RefundBaseStorage;
  let verificationBaseService: VerificationBaseService;

  const createMatchDetail = (
    applyGoalRecord: boolean = false,
    goalRecord: string = '',
    isScoreInconsistent: boolean = false,
    halfTimeHomeScore: string = '',
    halfTimeAwayScore: string = ''
  ): MatchDetail => ({
    matchId: 123,
    applyGoalRecord,
    goalRecord,
    isScoreInconsistent,
    halfTimeHomeScore,
    halfTimeAwayScore
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: null,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: null,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyGoalRecordHTHandler,
        VerificationBaseService,
        RefundStorage,
        ToastrService,
        VerifyScoreGoalService,
        RequestService
      ]
    });

    handler = TestBed.inject(VerifyGoalRecordHTHandler);
    storage = TestBed.inject(RefundStorage);
    verificationBaseService = TestBed.inject(VerificationBaseService);

    match.matchDetail = createMatchDetail();

    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.error = jest.fn();

    verificationBaseService.goalRecordExistSemicolon = jest.fn();
    verificationBaseService.isHtGoalRecordInvalid = jest.fn();
  });

  describe('handle method', () => {
    it('should call super.handle when all validations pass', () => {
      // Arrange
      match.matchDetail = createMatchDetail(false, '', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should show error when goal record contains semicolon', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'H;A', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show error when goal record is applied and HT goal record is invalid', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', false, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show error when score is inconsistent', () => {
      // Arrange
      match.matchDetail = createMatchDetail(false, '', true);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.confirmWithInconsistentScore);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should not check HT goal record when goal record is not applied', () => {
      // Arrange
      match.matchDetail = createMatchDetail(false, 'HHA', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).not.toHaveBeenCalled();
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should prioritize semicolon check over HT goal record validation', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'H;A', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).not.toHaveBeenCalled();
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should prioritize HT goal record check over score inconsistency', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', true, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should handle valid goal record with valid HT scores', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', false, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should proceed when goal record is applied but HT goal record is valid', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HA', false, '1', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('validation order priority', () => {
    it('should check validations in correct order: semicolon -> HT goal record -> score consistency', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'H;A', true);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).not.toHaveBeenCalled();
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
    });

    it('should proceed to HT goal record check when semicolon check passes', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', true, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeGoalRecordNotConsistent);
    });

    it('should proceed to score consistency check when previous checks pass', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', true, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.confirmWithInconsistentScore);
    });
  });

  describe('edge cases', () => {
    it('should handle empty goal record with applyGoalRecord true', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, '', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(match.matchDetail);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle goal record with semicolon but applyGoalRecord false', () => {
      // Arrange
      match.matchDetail = createMatchDetail(false, 'H;A', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(match.matchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).not.toHaveBeenCalled();
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle match detail with multiple validation failures', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'H;A', true);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledTimes(1);
      expect(storage.error).toHaveBeenCalledWith(Language.soccer.noNeedSemicolonOnGoalRecord);
    });

    it('should pass correct match detail to verification service methods', () => {
      // Arrange
      const customMatchDetail = createMatchDetail(true, 'HHAA', false, '2', '2');
      match.matchDetail = customMatchDetail;
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledWith(customMatchDetail);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledWith(customMatchDetail);
    });
  });

  describe('service integration', () => {
    it('should use VerificationBaseService for all validation logic', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'HHA', false, '2', '1');
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(false);
      verificationBaseService.isHtGoalRecordInvalid = jest.fn().mockReturnValue(false);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledTimes(1);
      expect(verificationBaseService.isHtGoalRecordInvalid).toHaveBeenCalledTimes(1);
    });

    it('should not call verification methods when earlier validations fail', () => {
      // Arrange
      match.matchDetail = createMatchDetail(true, 'H;A', false);
      verificationBaseService.goalRecordExistSemicolon = jest.fn().mockReturnValue(true);

      // Act
      handler.handle(storage);

      // Assert
      expect(verificationBaseService.goalRecordExistSemicolon).toHaveBeenCalledTimes(1);
      expect(verificationBaseService.isHtGoalRecordInvalid).not.toHaveBeenCalled();
    });
  });
});