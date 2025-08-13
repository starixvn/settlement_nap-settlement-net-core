import { TestBed } from '@angular/core/testing';
import { ResultRowStateService } from './result-row-state.service';
import { CalculateStorage } from './calculate/calculate.storage';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResourceIds, ResultStatus, TicketStatusText } from '../../shared/constants';

describe('ResultRowStateService', () => {
  let service: ResultRowStateService;
  let mockCalculateStorage: any;
  let mockVerificationService: any;
  let mockIntervalBackgroundPipe: any;

  beforeEach(() => {
    mockCalculateStorage = {
      isLeader: jest.fn().mockReturnValue(true),
      isConfirmed: jest.fn().mockReturnValue(true),
      isScoreDirect: jest.fn().mockReturnValue(true),
      getResultDetails: jest.fn().mockReturnValue([]),
      isMatchSeries: jest.fn().mockReturnValue(false),
      getIsClickOnCalculate: jest.fn().mockReturnValue(false),
      fulltimeResult: {
        resultSettingData: {}
      }
    };

    mockVerificationService = {
      isFullTimeMismatched: jest.fn().mockReturnValue(false),
      isValidTraderConfirmScore: jest.fn().mockReturnValue(true)
    };

    mockIntervalBackgroundPipe = {
      transform: jest.fn().mockReturnValue('test-class')
    };

    TestBed.configureTestingModule({
      providers: [
        ResultRowStateService,
        { provide: CalculateStorage, useValue: mockCalculateStorage },
        { provide: VerificationBaseService, useValue: mockVerificationService },
        { provide: IntervalBackgroundPipe, useValue: mockIntervalBackgroundPipe }
      ]
    });

    service = TestBed.inject(ResultRowStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isConfirmed', () => {
    it('should return true for extraInning when leader and confirmed', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.extraInning
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(true);
      mockCalculateStorage.isConfirmed.mockReturnValue(true);

      const result = service.isConfirmed(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false for extraInning when not leader', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.extraInning
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(false);

      const result = service.isConfirmed(resultDetail);

      expect(result).toBe(false);
    });

    it('should return true for regular resource when leader and confirmed', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01'
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(true);
      mockCalculateStorage.isConfirmed.mockReturnValue(true);

      const result = service.isConfirmed(resultDetail);

      expect(result).toBe(true);
    });
  });

  describe('isFinalScoreDisabled', () => {
    it('should return false for fullTime when leader and score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.fullTime
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(true);
      mockCalculateStorage.isScoreDirect.mockReturnValue(true);

      const result = service.isFinalScoreDisabled(resultDetail);

      expect(result).toBe(false);
    });

    it('should return true for fullTime when leader and not score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.fullTime
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(true);
      mockCalculateStorage.isScoreDirect.mockReturnValue(false);

      const result = service.isFinalScoreDisabled(resultDetail);

      expect(result).toBe(true);
    });

    it('should return true when not leader and not outside source', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01'
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(false);

      const result = service.isFinalScoreDisabled(resultDetail, false);

      expect(result).toBe(true);
    });

    it('should return false for non-fullTime when leader and not score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01'
      } as ResultDetail;

      mockCalculateStorage.isLeader.mockReturnValue(true);
      mockCalculateStorage.isScoreDirect.mockReturnValue(false);

      const result = service.isFinalScoreDisabled(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('finalScoreClass', () => {
    it('should return class with mismatched when fullTime is mismatched', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01',
        settlementStatusId: 1
      } as ResultDetail;

      mockVerificationService.isFullTimeMismatched.mockReturnValue(true);
      mockIntervalBackgroundPipe.transform.mockReturnValue('test-class');

      const result = service.finalScoreClass(resultDetail);

      expect(result).toContain('col-mismatched');
      expect(result).toContain('test-class');
    });

    it('should return only background class when not mismatched', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01',
        settlementStatusId: 1
      } as ResultDetail;

      mockVerificationService.isFullTimeMismatched.mockReturnValue(false);
      mockIntervalBackgroundPipe.transform.mockReturnValue('test-class');

      const result = service.finalScoreClass(resultDetail);

      expect(result).toBe('test-class');
    });
  });

  describe('invalidScore', () => {
    it('should return false for extraInning when both home and away values are empty', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.extraInning,
        homeValue: '',
        awayValue: '',
        checked: true
      } as ResultDetail;

      mockCalculateStorage.getIsClickOnCalculate.mockReturnValue(true);

      const result = service.invalidScore(resultDetail, true);

      expect(result).toBe(false);
    });

    it('should return false for fullTime when checked and no home value but score direct is false', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.fullTime,
        homeValue: '',
        checked: true
      } as ResultDetail;

      mockCalculateStorage.getIsClickOnCalculate.mockReturnValue(true);
      mockCalculateStorage.isScoreDirect.mockReturnValue(false);

      const result = service.invalidScore(resultDetail, true);

      expect(result).toBe(false);
    });

    it('should return false when not clicked on calculate', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01',
        homeValue: '',
        checked: true
      } as ResultDetail;

      mockCalculateStorage.getIsClickOnCalculate.mockReturnValue(false);

      const result = service.invalidScore(resultDetail, true);

      expect(result).toBe(false);
    });
  });

  describe('canSettleResult', () => {
    it('should return true for running ticket with valid score', () => {
      const resultDetail: ResultDetail = {
        ticketStatus: TicketStatusText.running,
        resultStatus: ResultStatus.running,
        isScoreMismatched: false
      } as ResultDetail;

      mockVerificationService.isValidTraderConfirmScore.mockReturnValue(true);

      const result = service.canSettleResult(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when score is mismatched', () => {
      const resultDetail: ResultDetail = {
        ticketStatus: TicketStatusText.running,
        resultStatus: ResultStatus.running,
        isScoreMismatched: true
      } as ResultDetail;

      const result = service.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });

    it('should return false when trader confirm score is invalid', () => {
      const resultDetail: ResultDetail = {
        ticketStatus: TicketStatusText.running,
        resultStatus: ResultStatus.running,
        isScoreMismatched: false
      } as ResultDetail;

      mockVerificationService.isValidTraderConfirmScore.mockReturnValue(false);

      const result = service.canSettleResult(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('isCheckBoxDisabled', () => {
    it('should return true for extraInning when not score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.extraInning
      } as ResultDetail;

      mockCalculateStorage.isScoreDirect.mockReturnValue(false);

      const result = service.isCheckBoxDisabled(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false for extraInning when score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: ResourceIds.extraInning
      } as ResultDetail;

      mockCalculateStorage.isScoreDirect.mockReturnValue(true);

      const result = service.isCheckBoxDisabled(resultDetail);

      expect(result).toBe(false);
    });

    it('should return true for regular resource when score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01'
      } as ResultDetail;

      mockCalculateStorage.isScoreDirect.mockReturnValue(true);

      const result = service.isCheckBoxDisabled(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false for regular resource when not score direct', () => {
      const resultDetail: ResultDetail = {
        resourceId: 'inning01'
      } as ResultDetail;

      mockCalculateStorage.isScoreDirect.mockReturnValue(false);

      const result = service.isCheckBoxDisabled(resultDetail);

      expect(result).toBe(false);
    });
  });
}); 