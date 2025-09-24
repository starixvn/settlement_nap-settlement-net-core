import { TestBed } from '@angular/core/testing';
import { ResultDetailsService } from './resultdetails.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { ExternalResult, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResourceID, ResourceIDs, LeagueType } from '../../constants';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { ResultSettingModel } from '../../../shared/models/result-setting.model';

describe('ResultDetailsService', () => {
  let service: ResultDetailsService;

  const createMockResultDetail = (resourceId: string, homeValue: string = '', awayValue: string = '', resultStatusId = 0, settlementStatusId = 0): ResultDetail => {
    const result = new ResultDetail();
    result.resourceId = resourceId;
    result.homeValue = homeValue;
    result.awayValue = awayValue;
    result.resultStatusId = resultStatusId;
    result.settlementStatusId = settlementStatusId;
    result.className = '';
    result.disabled = false;
    result.resultSettingData = new ResultSettingModel();
    result.resultSettingData.isConfirmedRefund = false;
    return result;
  };

  const createMockExternalResultDetail = (resourceId: string, homeValue: string = '', awayValue: string = '', sourceId = 1, sourceName = 'Test Source'): ExternalResultDetail => {
    const result = new ExternalResultDetail(sourceId, resourceId, sourceName);
    result.homeValue = homeValue;
    result.awayValue = awayValue;
    return result;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultDetailsService]
    });
    service = TestBed.inject(ResultDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateFullResultDetails', () => {
    it('should generate full result details with existing results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.generateFullResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      expect(result.find(r => r.resourceId === ResourceID.FirstHalf)).toBeDefined();
      expect(result.find(r => r.resourceId === ResourceID.Final)).toBeDefined();
      expect(result.find(r => r.resourceId === ResourceID.FullTime)).toBeDefined();
      expect(result.find(r => r.resourceId === ResourceID.Et)).toBeDefined();
      expect(result.find(r => r.resourceId === ResourceID.Pen)).toBeDefined();
    });

    it('should return temp results when final result has valid score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.generateFullResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      expect(result.find(r => r.resourceId === ResourceID.Final)?.homeValue).toBe('2');
      expect(result.find(r => r.resourceId === ResourceID.Final)?.awayValue).toBe('1');
    });

    it('should calculate match result details when final result is empty', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Final, '', '')
      ];

      // Act
      const result = service.generateFullResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      const finalResult = result.find(r => r.resourceId === ResourceID.Final);
      expect(finalResult?.homeValue).toBe('2'); // 1 + 1
      expect(finalResult?.awayValue).toBe('0'); // 0 + 0
    });

    it('should create default results for missing resource IDs', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0')
      ];

      // Act
      const result = service.generateFullResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      const fullTimeResult = result.find(r => r.resourceId === ResourceID.FullTime);
      expect(fullTimeResult?.homeValue).toBe('');
      expect(fullTimeResult?.awayValue).toBe('');
      expect(fullTimeResult?.className).toBe('');
    });
  });

  describe('generateConfirmResultDetails', () => {
    it('should filter and return only trader confirm results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm),
        createMockResultDetail(ResourceID.FullTime, '1', '0', ResultStatusId.AutoCompleted),
        createMockResultDetail(ResourceID.Final, '2', '1', ResultStatusId.TraderConfirm)
      ];

      // Act
      const result = service.generateConfirmResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(r => r.resultStatusId === ResultStatusId.TraderConfirm)).toBe(true);
    });

    it('should return empty array when no trader confirm results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.AutoCompleted),
        createMockResultDetail(ResourceID.FullTime, '1', '0', ResultStatusId.ManualCompleted)
      ];

      // Act
      const result = service.generateConfirmResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should return deep clone of results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm)
      ];

      // Act
      const result = service.generateConfirmResultDetails(resultDetails);

      // Assert
      expect(result).not.toBe(resultDetails);
      expect(result[0]).not.toBe(resultDetails[0]);
    });
  });

  describe('generateFullExternalResultDetails', () => {
    it('should generate full external result details with existing results', () => {
      // Arrange
      const externalResult = {
        sourceId: 1,
        sourceName: 'Test Source',
        remark: 'Test remark',
        resultDetails: [
          createMockExternalResultDetail(ResourceID.FirstHalf, '1', '0'),
          createMockExternalResultDetail(ResourceID.Final, '2', '1')
        ]
      } as ExternalResult;

      // Act
      const result = service.generateFullExternalResultDetails(externalResult);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      expect(result.find(r => r.resourceId === ResourceID.FirstHalf)?.homeValue).toBe('1');
      expect(result.find(r => r.resourceId === ResourceID.Final)?.homeValue).toBe('2');
    });

    it('should create default external results for missing resource IDs', () => {
      // Arrange
      const externalResult = {
        sourceId: 1,
        sourceName: 'Test Source',
        remark: 'Test remark',
        resultDetails: []
      } as ExternalResult;

      // Act
      const result = service.generateFullExternalResultDetails(externalResult);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      expect(result.every(r => r.sourceId === 1)).toBe(true);
      expect(result.every(r => r.sourceName === 'Test Source')).toBe(true);
    });

    it('should handle null external result', () => {
      // Arrange
      const externalResult = null;

      // Act
      const result = service.generateFullExternalResultDetails(externalResult);

      // Assert
      expect(result).toHaveLength(ResourceIDs.length);
      expect(result.every(r => r.sourceId === undefined)).toBe(true);
      expect(result.every(r => r.sourceName === undefined)).toBe(true);
    });
  });

  describe('hidenScoreResultDetails', () => {
    it('should hide scores for non-leader when not showing score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', 0, 0)
      ];
      const isLeader = false;

      // Act
      service.hidenScoreResultDetails(resultDetails, isLeader);

      // Assert
      expect(resultDetails[0].homeValue).toBe('');
      expect(resultDetails[0].awayValue).toBe('');
    });

    it('should show scores for leader when showing score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm, SettlementStatusId.Calculated)
      ];
      const isLeader = true;

      // Act
      service.hidenScoreResultDetails(resultDetails, isLeader);

      // Assert
      expect(resultDetails[0].homeValue).toBe('1');
      expect(resultDetails[0].awayValue).toBe('0');
    });

    it('should hide scores for refund settlement status', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm, SettlementStatusId.Refund)
      ];
      const isLeader = true;

      // Act
      service.hidenScoreResultDetails(resultDetails, isLeader);

      // Assert
      expect(resultDetails[0].homeValue).toBe('');
      expect(resultDetails[0].awayValue).toBe('');
    });
  });

  describe('generateRefundResultDetails', () => {
    it('should generate refund result details for FirstHalf and Final', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.generateRefundResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.find(r => r.resourceId === ResourceID.FirstHalf)).toBeDefined();
      expect(result.find(r => r.resourceId === ResourceID.Final)).toBeDefined();
      expect(result.every(r => r.className === '')).toBe(true);
    });

    it('should create default refund results for missing resource IDs', () => {
      // Arrange
      const resultDetails = [];

      // Act
      const result = service.generateRefundResultDetails(resultDetails);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(r => r.homeValue === '')).toBe(true);
      expect(result.every(r => r.awayValue === '')).toBe(true);
      expect(result.every(r => r.className === '')).toBe(true);
      expect(result.every(r => r.resultSettingData.isConfirmedRefund === false)).toBe(true);
    });
  });

  describe('calcMatchResultDetails', () => {
    it('should calculate final result from game results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '0', '0'),
        createMockResultDetail(ResourceID.Final, '', '')
      ];

      // Act
      const result = service.calcMatchResultDetails(resultDetails);

      // Assert
      const finalResult = result.find(r => r.resourceId === ResourceID.Final);
      expect(finalResult?.homeValue).toBe('2'); // 1 + 1 + 0
      expect(finalResult?.awayValue).toBe('0'); // 0 + 0 + 0
    });

    it('should not modify non-final results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Final, '', '')
      ];

      // Act
      const result = service.calcMatchResultDetails(resultDetails);

      // Assert
      expect(result.find(r => r.resourceId === ResourceID.FirstHalf)?.homeValue).toBe('1');
      expect(result.find(r => r.resourceId === ResourceID.FullTime)?.homeValue).toBe('1');
    });

    it('should handle empty game results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '', ''),
        createMockResultDetail(ResourceID.Final, '', '')
      ];

      // Act
      const result = service.calcMatchResultDetails(resultDetails);

      // Assert
      const finalResult = result.find(r => r.resourceId === ResourceID.Final);
      expect(finalResult?.homeValue).toBe('');
      expect(finalResult?.awayValue).toBe('');
    });
  });

  describe('disabledInputResult', () => {
    it('should disable final result for all league types', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Final, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      service.disabledInputResult(resultDetails, LeagueType.General);

      // Assert
      expect(resultDetails.find(r => r.resourceId === ResourceID.Final)?.disabled).toBe(true);
    });

    it('should disable ET and Pen for General and Regular league types', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Final, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      service.disabledInputResult(resultDetails, LeagueType.General);

      // Assert
      expect(resultDetails.find(r => r.resourceId === ResourceID.Et)?.disabled).toBe(true);
      expect(resultDetails.find(r => r.resourceId === ResourceID.Pen)?.disabled).toBe(true);
    });

    it('should disable ET and Pen for OtPenalty when full time is empty or not equal', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Final, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '', ''),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      service.disabledInputResult(resultDetails, LeagueType.OtPenalty);

      // Assert
      expect(resultDetails.find(r => r.resourceId === ResourceID.Et)?.disabled).toBe(true);
      expect(resultDetails.find(r => r.resourceId === ResourceID.Pen)?.disabled).toBe(true);
    });

    it('should enable ET and disable Pen for OtPenalty when full time is equal and ET is empty or not equal', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Final, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '1'),
        createMockResultDetail(ResourceID.Et, '', ''),
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      service.disabledInputResult(resultDetails, LeagueType.OtPenalty);

      // Assert
      expect(resultDetails.find(r => r.resourceId === ResourceID.Et)?.disabled).toBe(false);
      expect(resultDetails.find(r => r.resourceId === ResourceID.Pen)?.disabled).toBe(true);
    });
  });

  describe('resetHomeAwayValue', () => {
    it('should reset home and away values for disabled results except final', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];
      
      // Set some results as disabled
      resultDetails[1].disabled = true; // FullTime
      resultDetails[2].disabled = true; // ET
      resultDetails[4].disabled = true; // Final

      // Act
      service.resetHomeAwayValue(resultDetails);

      // Assert
      expect(resultDetails[0].homeValue).toBe('1'); // FirstHalf - not disabled
      expect(resultDetails[1].homeValue).toBe(''); // FullTime - disabled
      expect(resultDetails[2].homeValue).toBe(''); // ET - disabled
      expect(resultDetails[3].homeValue).toBe('1'); // Pen - not disabled
      expect(resultDetails[4].homeValue).toBe('2'); // Final - disabled but excluded
    });
  });

  describe('copyResultFromProvider', () => {
    it('should copy home and away values from provider results', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '', ''),
        createMockResultDetail(ResourceID.Final, '', '')
      ];
      const providerResultDetails = [
        createMockExternalResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockExternalResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      service.copyResultFromProvider(resultDetails, providerResultDetails);

      // Assert
      expect(resultDetails[0].homeValue).toBe('1');
      expect(resultDetails[0].awayValue).toBe('0');
      expect(resultDetails[1].homeValue).toBe('2');
      expect(resultDetails[1].awayValue).toBe('1');
    });

    it('should not modify results when no matching provider result', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0')
      ];
      const providerResultDetails = [
        createMockExternalResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      service.copyResultFromProvider(resultDetails, providerResultDetails);

      // Assert
      expect(resultDetails[0].homeValue).toBe('1');
      expect(resultDetails[0].awayValue).toBe('0');
    });
  });

  describe('isShowScore', () => {
    it('should return true for leader with trader confirm status', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm, SettlementStatusId.Calculated);
      const isLeader = true;

      // Act
      const resultValue = service.isShowScore(result, isLeader);

      // Assert
      expect(resultValue).toBe(true);
    });

    it('should return true for non-leader with auto completed status', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated);
      const isLeader = false;

      // Act
      const resultValue = service.isShowScore(result, isLeader);

      // Assert
      expect(resultValue).toBe(true);
    });

    it('should return false for refund settlement status', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.FirstHalf, '1', '0', ResultStatusId.TraderConfirm, SettlementStatusId.Refund);
      const isLeader = true;

      // Act
      const resultValue = service.isShowScore(result, isLeader);

      // Assert
      expect(resultValue).toBe(false);
    });
  });
});
