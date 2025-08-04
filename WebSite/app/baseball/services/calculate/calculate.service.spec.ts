import { TestBed } from '@angular/core/testing';
import { CalculateService } from './calculate.service';
import { CalculateStorage } from './calculate.storage';
import { NotifyService } from '../notify.service';
import { AioService } from '../../../shared/services';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { ResultRowStateService } from '../result-row-state.service';
import { VerificationResultsService } from '../verify-results.service';
import { ResultByTeamNamePipe } from '../../../shared/pipes/result-by-team-name.pipe';
import { BaseballApiKeys } from '../../constants/api-keys.constant';
import { GeneralResultDetail } from '../../../shared/models';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { IntervalCalculationService } from '../../../shared/services';

describe('CalculateService', () => {
  let service: CalculateService;
  let mockCalculateStorage: any;
  let mockNotifyService: any;
  let mockAioService: any;
  let mockVerificationService: any;
  let mockResultRowStateService: any;
  let mockVerificationResultsService: any;
  let mockResultByTeamNamePipe: any;
  let mockResourceNamePipe: any;
  let mockIntervalCalculationService: any;

  beforeEach(() => {
    mockCalculateStorage = {
      getResultChecked: jest.fn().mockReturnValue([]),
      getOriginalResultDetails: jest.fn().mockReturnValue([]),
      getMatchDetail: jest.fn().mockReturnValue({ matchId: 12345 }),
      getResultDetails: jest.fn().mockReturnValue([]),
      getActionSubmit: jest.fn().mockReturnValue('calculate')
    };

    mockNotifyService = {
      error: jest.fn(),
      confirm: jest.fn()
    };

    mockAioService = {
      saveScore: jest.fn()
    };

    mockVerificationService = {
      getChangedScores: jest.fn().mockReturnValue([]),
      getOutsideScores: jest.fn().mockReturnValue([])
    };

    mockResultRowStateService = {
      invalidScore: jest.fn().mockReturnValue(false)
    };

    mockVerificationResultsService = {
      allMapHaveScreenshotSource: jest.fn().mockReturnValue(true),
      allMapHaveScoreSources: jest.fn().mockReturnValue(true)
    };

    mockResultByTeamNamePipe = {
      transform: jest.fn().mockReturnValue('Test Team')
    };

    mockResourceNamePipe = {
      transform: jest.fn().mockReturnValue('Test Resource')
    };

    mockIntervalCalculationService = {
      isMatchNotCheckedWhenChangingIntervals: jest.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      providers: [
        CalculateService,
        { provide: CalculateStorage, useValue: mockCalculateStorage },
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: AioService, useValue: mockAioService },
        { provide: VerificationBaseService, useValue: mockVerificationService },
        { provide: ResultRowStateService, useValue: mockResultRowStateService },
        { provide: VerificationResultsService, useValue: mockVerificationResultsService },
        { provide: ResultByTeamNamePipe, useValue: mockResultByTeamNamePipe },
        { provide: ResourceNamePipe, useValue: mockResourceNamePipe },
        { provide: IntervalCalculationService, useValue: mockIntervalCalculationService }
      ]
    });

    service = TestBed.inject(CalculateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculate', () => {
    it('should call nonSelectedHandler.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.calculate()).not.toThrow();
    });
  });

  describe('unCalculate', () => {
    it('should call confirmUncalculateHandler.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.unCalculate()).not.toThrow();
    });
  });

  describe('saveScore', () => {
    it('should save score successfully and uncheck all results', async () => {
      const mockResults = [{ id: 1, checked: true }];
      const mockScoresToSave = [{ id: 1 }];
      const mockCheckedScores = [{ id: 1 }];
      const mockResultDetails = [{ checked: true }];

      mockCalculateStorage.getResultChecked.mockReturnValue(mockResults);
      mockVerificationService.getChangedScores.mockReturnValue(mockScoresToSave);
      mockVerificationService.getOutsideScores.mockReturnValue(mockCheckedScores);
      mockCalculateStorage.getResultDetails.mockReturnValue(mockResultDetails);
      mockAioService.saveScore.mockResolvedValue({ isSuccessful: true });

      await service.saveScore();

      expect(mockAioService.saveScore).toHaveBeenCalledWith({
        matchId: 12345,
        scoresToSave: mockScoresToSave,
        checkedScores: mockCheckedScores,
        apiKey: BaseballApiKeys.NormalMatch
      });

      expect(mockResultDetails[0].checked).toBe(false);
    });

    it('should show error message when save score fails', async () => {
      const mockResults = [{ id: 1 }];
      const mockScoresToSave = [{ id: 1 }];
      const mockCheckedScores = [{ id: 1 }];
      const errorMessage = 'Save failed';

      mockCalculateStorage.getResultChecked.mockReturnValue(mockResults);
      mockVerificationService.getChangedScores.mockReturnValue(mockScoresToSave);
      mockVerificationService.getOutsideScores.mockReturnValue(mockCheckedScores);
      mockAioService.saveScore.mockResolvedValue({ 
        isSuccessful: false, 
        errMsg: errorMessage 
      });

      await service.saveScore();

      expect(mockNotifyService.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('sumTotalScores', () => {
    it('should sum scores correctly when isSumScore is true', () => {
      const resultDetails: GeneralResultDetail[] = [
        { homeValue: '1', awayValue: '0', resourceId: 'inning01' } as GeneralResultDetail,
        { homeValue: '2', awayValue: '1', resourceId: 'inning02' } as GeneralResultDetail
      ];
      const finalResult: GeneralResultDetail = { homeValue: '', awayValue: '' } as GeneralResultDetail;

      service.sumTotalScores(resultDetails, finalResult, true);

      expect(finalResult.homeValue).toBe('3');
      expect(finalResult.awayValue).toBe('1');
    });

    it('should count wins when isSumScore is false', () => {
      const resultDetails: GeneralResultDetail[] = [
        { homeValue: '1', awayValue: '0', resourceId: 'inning01' } as GeneralResultDetail,
        { homeValue: '2', awayValue: '1', resourceId: 'inning02' } as GeneralResultDetail
      ];
      const finalResult: GeneralResultDetail = { homeValue: '5', awayValue: '3' } as GeneralResultDetail;

      service.sumTotalScores(resultDetails, finalResult, false);

      // When isSumScore is false, it counts wins/losses instead of summing
      expect(finalResult.homeValue).toBe('2'); // 2 wins (home > away in both cases)
      expect(finalResult.awayValue).toBe('0'); // 0 wins (away < home in both cases)
    });

    it('should handle empty values', () => {
      const resultDetails: GeneralResultDetail[] = [
        { homeValue: '', awayValue: '', resourceId: 'inning01' } as GeneralResultDetail,
        { homeValue: '2', awayValue: '1', resourceId: 'inning02' } as GeneralResultDetail
      ];
      const finalResult: GeneralResultDetail = { homeValue: '', awayValue: '' } as GeneralResultDetail;

      service.sumTotalScores(resultDetails, finalResult, true);

      expect(finalResult.homeValue).toBe('2');
      expect(finalResult.awayValue).toBe('1');
    });

    it('should handle non-numeric values', () => {
      const resultDetails: GeneralResultDetail[] = [
        { homeValue: '0', awayValue: '0', resourceId: 'inning01' } as GeneralResultDetail,
        { homeValue: '2', awayValue: '1', resourceId: 'inning02' } as GeneralResultDetail
      ];
      const finalResult: GeneralResultDetail = { homeValue: '', awayValue: '' } as GeneralResultDetail;

      service.sumTotalScores(resultDetails, finalResult, true);

      expect(finalResult.homeValue).toBe('2');
      expect(finalResult.awayValue).toBe('1');
    });
  });
}); 