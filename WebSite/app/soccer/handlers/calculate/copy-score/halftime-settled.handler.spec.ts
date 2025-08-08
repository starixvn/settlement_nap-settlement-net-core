import { TestBed } from '@angular/core/testing';
import { HalfTimeSettledHandler } from './halftime-settled.handler';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { ScoreService } from '../../../components/calc/services/score.service';
import { Language } from '../../../../shared/language.native';
import { CalculateAction, ScoreSourceType } from '../../../../shared/constants';
import { CalculateStorage } from '../../../storage/calculate.storage';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { RequestService } from '../../../components/calc/services/request.service';
import { MessageBoxService } from '../../../../shared/services';
import { AbstractHandler } from '../../abstract.handler.native';
import { Match, MatchDetailSoccer } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { HedgeMatchDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { ResultByTeamNamePipe } from '../../../../shared/pipes/result-by-team-name.pipe';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';

describe('HalfTimeSettledHandler', () => {
  let handler: HalfTimeSettledHandler;
  let verifyScoreGoalService: VerifyScoreGoalService;
  let scoreService: ScoreService;
  let storage: CalculateBaseStorage;

  const matchDetail = {
    exFTHomeScore: 2,
    exFTAwayScore: 1,
    exHTHomeScore: 1,
    exHTAwayScore: 0
  } as any;

  const match: Match = {
    matchDetail,
    permission: new Permission(),
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

  const ftResultDetail: ResultDetail = {
    externalScores: [
      {
        sourceId: ScoreSourceType.Sbo,
        homeValue: '2',
        awayValue: '1'
      }
    ]
  } as ResultDetail;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        HalfTimeSettledHandler,
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

    handler = TestBed.inject(HalfTimeSettledHandler);
    verifyScoreGoalService = TestBed.inject(VerifyScoreGoalService);
    scoreService = TestBed.inject(ScoreService);
    storage = TestBed.inject(CalculateStorage);
    
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getFullTimeResult = jest.fn().mockReturnValue(ftResultDetail);
    storage.error = jest.fn();
    
    // Reset to default values
    ftResultDetail.externalScores = [
      {
        sourceId: ScoreSourceType.Sbo,
        homeValue: '2',
        awayValue: '1'
      } as any
    ];
  });

  it('should call scoreService.confirmCopyScore when half-time is settled and external FT score is valid', () => {
    // Arrange
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);
    scoreService.confirmCopyScore = jest.fn();

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isHalfTimeSettled).toHaveBeenCalledWith(matchDetail);
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith('2', '1');
    expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
      Language.soccer.confirmCopyFinalScore,
      CalculateAction.copyFTScore
    );
  });

  it('should call storage.error when half-time is settled but external FT score is invalid', () => {
    // Arrange
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isHalfTimeSettled).toHaveBeenCalledWith(matchDetail);
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith('2', '1');
    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
  });

  it('should call super.handle when half-time is not settled', () => {
    // Arrange
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(false);
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isHalfTimeSettled).toHaveBeenCalledWith(matchDetail);
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should handle case when external scores array is empty', () => {
    // Arrange
    ftResultDetail.externalScores = [];
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith(undefined, undefined);
    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
  });

  it('should handle case when no SBO score source is found', () => {
    // Arrange
    ftResultDetail.externalScores = [
      {
        sourceId: ScoreSourceType.trader, // Different source
        homeValue: '2',
        awayValue: '1'
      } as any
    ];
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith(undefined, undefined);
    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
  });

  it('should handle case with valid SBO score among multiple external scores', () => {
    // Arrange
    ftResultDetail.externalScores = [
      {
        sourceId: ScoreSourceType.trader,
        homeValue: '1',
        awayValue: '0'
      } as any,
      {
        sourceId: ScoreSourceType.Sbo,
        homeValue: '3',
        awayValue: '2'
      } as any,
      {
        sourceId: ScoreSourceType.screenshot,
        homeValue: '2',
        awayValue: '1'
      } as any
    ];
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(true);
    scoreService.confirmCopyScore = jest.fn();

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith('3', '2');
    expect(scoreService.confirmCopyScore).toHaveBeenCalledWith(
      Language.soccer.confirmCopyFinalScore,
      CalculateAction.copyFTScore
    );
  });

  it('should handle case with invalid scores (null/empty values)', () => {
    // Arrange
    ftResultDetail.externalScores = [
      {
        sourceId: ScoreSourceType.Sbo,
        homeValue: null,
        awayValue: ''
      } as any
    ];
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(true);
    verifyScoreGoalService.isScoresValid = jest.fn().mockReturnValue(false);

    // Act
    handler.handle(storage);

    // Assert
    expect(verifyScoreGoalService.isScoresValid).toHaveBeenCalledWith(null, '');
    expect(storage.error).toHaveBeenCalledWith(Language.soccer.halfTimeAlreadySettled);
  });

  it('should not call scoreService or storage.error when half-time is not settled', () => {
    // Arrange
    verifyScoreGoalService.isHalfTimeSettled = jest.fn().mockReturnValue(false);
    scoreService.confirmCopyScore = jest.fn();
    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(scoreService.confirmCopyScore).not.toHaveBeenCalled();
    expect(storage.error).not.toHaveBeenCalled();
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });
});
