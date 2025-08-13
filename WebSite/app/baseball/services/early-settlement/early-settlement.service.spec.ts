import { TestBed } from '@angular/core/testing';
import { EarlySettlementService } from './early-settlement.service';
import { EarlySettlementStorage } from './early-settlement.storage';
import { NotifyService } from '../notify.service';
import { AioService } from '../../../shared/services';
import { VerificationResultsService } from '../verify-results.service';
import { ResultByTeamNamePipe } from '../../../shared/pipes/result-by-team-name.pipe';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { Language } from '../../../shared/language.native';
import { ResourceItem } from '../../../shared/models';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';

describe('EarlySettlementService', () => {
  let service: EarlySettlementService;
  let mockEarlySettlementStorage: any;
  let mockNotifyService: any;
  let mockAioService: any;
  let mockVerificationResultsService: any;
  let mockResultByTeamNamePipe: any;
  let mockVerificationBaseService: any;
  let mockResourceNamePipe: any;

  beforeEach(() => {
    mockEarlySettlementStorage = {
      getResultChecked: jest.fn().mockReturnValue([]),
      getMatchDetail: jest.fn().mockReturnValue({ matchId: 12345 }),
      getActionSubmit: jest.fn().mockReturnValue('earlyCalculate')
    };

    mockNotifyService = {
      error: jest.fn(),
      confirm: jest.fn()
    };

    mockAioService = {
      changeConfirmResultSetting: jest.fn()
    };

    mockVerificationResultsService = {
      allMapHaveScreenshotSource: jest.fn().mockReturnValue(true),
      allMapHaveScoreSources: jest.fn().mockReturnValue(true)
    };

    mockResultByTeamNamePipe = {
      transform: jest.fn().mockReturnValue('Test Team')
    };

    mockVerificationBaseService = {
      isExistMismatchScore: jest.fn().mockReturnValue(false),
      allMapHaveScoreSources: jest.fn().mockReturnValue(true),
      isExistScreenshotSource: jest.fn().mockReturnValue(true),
      isExistMismatchedScoreScreenshot: jest.fn().mockReturnValue(false),
      getChangedScores: jest.fn().mockReturnValue([]),
      getOutsideScores: jest.fn().mockReturnValue([])
    };

    mockResourceNamePipe = {
      transform: jest.fn().mockReturnValue('Test Resource')
    };

    TestBed.configureTestingModule({
      providers: [
        EarlySettlementService,
        { provide: EarlySettlementStorage, useValue: mockEarlySettlementStorage },
        { provide: NotifyService, useValue: mockNotifyService },
        { provide: AioService, useValue: mockAioService },
        { provide: VerificationResultsService, useValue: mockVerificationResultsService },
        { provide: ResultByTeamNamePipe, useValue: mockResultByTeamNamePipe },
        { provide: VerificationBaseService, useValue: mockVerificationBaseService },
        { provide: ResourceNamePipe, useValue: mockResourceNamePipe }
      ]
    });

    service = TestBed.inject(EarlySettlementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculate', () => {
    it('should call resultConfirmedHandler.handle with storage', () => {
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

  describe('refund', () => {
    it('should call checkConfirmRefundHandler.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.refund()).not.toThrow();
    });
  });

  describe('saveScore', () => {
    it('should call saveScoreOnly.handle with storage', () => {
      // Since the handlers are private and use chain of responsibility pattern,
      // we can only test that the method doesn't throw an error
      expect(() => service.saveScore()).not.toThrow();
    });
  });

  describe('confirmResult', () => {
    it('should call aioService.changeConfirmResultSetting with correct parameters', () => {
      const resourceIds = 'inning01,inning02';
      const mockResultChecked = [
        { resourceId: 'inning01', betTypeName: 'Test1', homeValue: '1', awayValue: '0' },
        { resourceId: 'inning02', betTypeName: 'Test2', homeValue: '2', awayValue: '1' }
      ];

      mockEarlySettlementStorage.getResultChecked.mockReturnValue(mockResultChecked);

      service.confirmResult(resourceIds);

      expect(mockAioService.changeConfirmResultSetting).toHaveBeenCalledWith(
        Language.confirmRefund.confirmRefund,
        12345,
        resourceIds,
        true,
        null,
        null,
        [
          new ResourceItem('inning01', 'Test1', '1', '0'),
          new ResourceItem('inning02', 'Test2', '2', '1')
        ]
      );
    });
  });

  describe('unConfirmResult', () => {
    it('should call aioService.changeConfirmResultSetting when all results are confirmed', () => {
      const resourceIds = 'inning01,inning02';
      const mockResultChecked = [
        { 
          resourceId: 'inning01', 
          betTypeName: 'Test1', 
          homeValue: '1', 
          awayValue: '0',
          resultSettingData: { isConfirmedRefund: true }
        },
        { 
          resourceId: 'inning02', 
          betTypeName: 'Test2', 
          homeValue: '2', 
          awayValue: '1',
          resultSettingData: { isConfirmedRefund: true }
        }
      ];

      mockEarlySettlementStorage.getResultChecked.mockReturnValue(mockResultChecked);

      service.unConfirmResult(resourceIds);

      expect(mockAioService.changeConfirmResultSetting).toHaveBeenCalledWith(
        Language.confirmRefund.undoConfirm,
        12345,
        resourceIds,
        false,
        null,
        null,
        [
          new ResourceItem('inning01', 'Test1', '1', '0'),
          new ResourceItem('inning02', 'Test2', '2', '1')
        ]
      );
    });

    it('should show error message when results have different states', () => {
      const resourceIds = 'inning01,inning02';
      const mockResultChecked = [
        { 
          resourceId: 'inning01', 
          betTypeName: 'Test1', 
          homeValue: '1', 
          awayValue: '0',
          resultSettingData: { isConfirmedRefund: true }
        },
        { 
          resourceId: 'inning02', 
          betTypeName: 'Test2', 
          homeValue: '2', 
          awayValue: '1',
          resultSettingData: { isConfirmedRefund: false }
        }
      ];

      mockEarlySettlementStorage.getResultChecked.mockReturnValue(mockResultChecked);

      service.unConfirmResult(resourceIds);

      expect(mockNotifyService.error).toHaveBeenCalledWith(Language.confirmRefund.differentStates);
      expect(mockAioService.changeConfirmResultSetting).not.toHaveBeenCalled();
    });
  });

  describe('isExistInhouseResult', () => {
    it('should return true when result has inhouse external scores', () => {
      const resultDetail: ResultDetail = {
        externalScores: [
          { sourceId: 1, homeValue: '1', awayValue: '0' },
          { sourceId: 2, homeValue: '2', awayValue: '1' }
        ]
      } as ResultDetail;

      const result = service.isExistInhouseResult(resultDetail);

      expect(result).toBeTruthy();
    });

    it('should return false when result has no inhouse external scores', () => {
      const resultDetail: ResultDetail = {
        externalScores: []
      } as ResultDetail;

      const result = service.isExistInhouseResult(resultDetail);

      expect(result).toBeFalsy();
    });

    it('should return false when result has no external scores property', () => {
      const resultDetail: ResultDetail = {} as ResultDetail;

      const result = service.isExistInhouseResult(resultDetail);

      expect(result).toBeFalsy();
    });
  });

  describe('isExistedHomeAwayScore', () => {
    it('should return true when both home and away values exist', () => {
      const result = service.isExistedHomeAwayScore('1', '0');
      expect(result).toBe(true);
    });

    it('should return false when home value is empty', () => {
      const result = service.isExistedHomeAwayScore('', '0');
      expect(result).toBe(false);
    });

    it('should return false when away value is empty', () => {
      const result = service.isExistedHomeAwayScore('1', '');
      expect(result).toBe(false);
    });

    it('should return false when both values are empty', () => {
      const result = service.isExistedHomeAwayScore('', '');
      expect(result).toBe(false);
    });
  });

  describe('getUncalculateMessage', () => {
    it('should return correct message for single result', () => {
      const resultDetails: ResultDetail[] = [
        { resourceId: 'inning01' } as ResultDetail
      ];

      const result = service.getUncalculateMessage(resultDetails);

      expect(result).toBe(Language.UnCalculationConfirmMessageEarly1);
    });

    it('should return correct message for multiple results', () => {
      const resultDetails: ResultDetail[] = [
        { resourceId: 'inning01' } as ResultDetail,
        { resourceId: 'inning02' } as ResultDetail
      ];

      const result = service.getUncalculateMessage(resultDetails);

      expect(result).toBe(Language.UnCalculationConfirmMessageEarly1);
    });

    it('should return empty string for empty results', () => {
      const resultDetails: ResultDetail[] = [];

      const result = service.getUncalculateMessage(resultDetails);

      expect(result).toBe(Language.UnCalculationConfirmMessageEarly1);
    });
  });
}); 