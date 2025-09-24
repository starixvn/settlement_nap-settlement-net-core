import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { ResultByTeamNamePipe } from '../../../shared/pipes/result-by-team-name.pipe';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { ExternalResult, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResourceID } from '../../constants';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { GeneralResultDetail } from '../../../shared/models';

describe('ValidationService', () => {
  let service: ValidationService;
  let mockResultByTeamNamePipe: jest.Mocked<ResultByTeamNamePipe>;

  const createMockResultDetail = (resourceId: string, homeValue: string, awayValue: string, checked = false): ResultDetail => {
    return {
      resourceId,
      homeValue,
      awayValue,
      checked,
      resultStatusId: 0,
      settlementStatusId: 0,
      ticketStatus: 'Active',
      isScoreMismatched: false
    } as ResultDetail;
  };

  const createMockExternalResultDetail = (resourceId: string, homeValue: string, awayValue: string): ExternalResultDetail => {
    return {
      resourceId,
      homeValue,
      awayValue
    } as ExternalResultDetail;
  };

  beforeEach(() => {
    const resultByTeamNamePipeSpy = {
      transform: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ValidationService,
        { provide: ResultByTeamNamePipe, useValue: resultByTeamNamePipeSpy }
      ]
    });

    service = TestBed.inject(ValidationService);
    mockResultByTeamNamePipe = TestBed.inject(ResultByTeamNamePipe) as jest.Mocked<ResultByTeamNamePipe>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('inValidFirstHalfFullTime', () => {
    it('should return true when first half score is greater than full time score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.FullTime, '1', '0')
      ];

      // Act
      const result = service.inValidFirstHalfFullTime(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when first half score is not greater than full time score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '2', '1')
      ];

      // Act
      const result = service.inValidFirstHalfFullTime(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidFirstHalfMatch', () => {
    it('should return true when first half score is greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.inValidFirstHalfMatch(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when first half score is not greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.inValidFirstHalfMatch(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidFullTimeMatch', () => {
    it('should return true when full time score is greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.inValidFullTimeMatch(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when full time score is not greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.inValidFullTimeMatch(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidETMatch', () => {
    it('should return true when ET score is greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Et, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.inValidETMatch(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when ET score is not greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.inValidETMatch(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidPenMatch', () => {
    it('should return true when penalty score is greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.inValidPenMatch(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when penalty score is not greater than final match score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.inValidPenMatch(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidPen', () => {
    it('should return true when penalty is a draw', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '1', '1')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when penalty has invalid values (not 0 or 1)', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '2', '1')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when penalty has valid values (0 or 1)', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when penalty has no score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '', '')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidMatchSumScore', () => {
    it('should return true when sum of game results does not match final result', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Final, '3', '1') // Sum should be 2-0, not 3-1
      ];

      // Act
      const result = service.inValidMatchSumScore(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when sum of game results matches final result', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '0') // Sum is 2-0
      ];

      // Act
      const result = service.inValidMatchSumScore(resultDetails);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when final result has no score', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Final, '', '')
      ];

      // Act
      const result = service.inValidMatchSumScore(resultDetails);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no game results have scores', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FullTime, '', ''),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.inValidMatchSumScore(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('invalidFistHalf', () => {
    it('should return true when first half full time is invalid', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.FullTime, '1', '0')
      ];

      // Act
      const result = service.invalidFistHalf(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when first half match is invalid', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.invalidFistHalf(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when both validations pass', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '2', '1'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.invalidFistHalf(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('invalidMatchResult', () => {
    it('should return true when any match result validation fails', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const result = service.invalidMatchResult(resultDetails);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when all match result validations pass', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '1', '0'),
        createMockResultDetail(ResourceID.Et, '1', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0'),
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const result = service.invalidMatchResult(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('inValidResult', () => {
    it('should return true when any validation fails', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '2', '1'),
        createMockResultDetail(ResourceID.FullTime, '1', '0')
      ];

      // Act
      const result = service.inValidResult(resultDetails);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('allowCalcFinalResult', () => {
    it('should return true when final result is not checked', () => {
      // Arrange
      const firstHalf = createMockResultDetail(ResourceID.FirstHalf, '1', '0', false);
      const finalResult = createMockResultDetail(ResourceID.Final, '2', '1', false);

      // Act
      const result = service.allowCalcFinalResult(firstHalf, finalResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when first half is checked', () => {
      // Arrange
      const firstHalf = createMockResultDetail(ResourceID.FirstHalf, '1', '0', true);
      const finalResult = createMockResultDetail(ResourceID.Final, '2', '1', true);

      // Act
      const result = service.allowCalcFinalResult(firstHalf, finalResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when first half has No Ticket status', () => {
      // Arrange
      const firstHalf = { ...createMockResultDetail(ResourceID.FirstHalf, '1', '0', false), ticketStatus: 'No Ticket' };
      const finalResult = createMockResultDetail(ResourceID.Final, '2', '1', true);

      // Act
      const result = service.allowCalcFinalResult(firstHalf, finalResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when first half settlement status is not Running', () => {
      // Arrange
      const firstHalf = { ...createMockResultDetail(ResourceID.FirstHalf, '1', '0', false), settlementStatusId: SettlementStatusId.Calculated };
      const finalResult = createMockResultDetail(ResourceID.Final, '2', '1', true);

      // Act
      const result = service.allowCalcFinalResult(firstHalf, finalResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when final result is checked and first half conditions are not met', () => {
      // Arrange
      const firstHalf = { ...createMockResultDetail(ResourceID.FirstHalf, '1', '0', false), settlementStatusId: 0 };
      const finalResult = createMockResultDetail(ResourceID.Final, '2', '1', true);

      // Act
      const result = service.allowCalcFinalResult(firstHalf, finalResult);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isInsufficientSOPLite', () => {
    it('should return true when neither trader nor provider exists', () => {
      // Arrange
      const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
      const confirmedResultDetails: ResultDetail[] = [];
      const externalResult = { resultDetails: [] } as ExternalResult;

      // Act
      const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when trader exists', () => {
      // Arrange
      const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
      const confirmedResultDetails = [{ ...createMockResultDetail(ResourceID.Final, '1', '0'), resultStatusId: ResultStatusId.TraderConfirm }];
      const externalResult = { resultDetails: [] } as ExternalResult;

      // Act
      const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when provider exists', () => {
      // Arrange
      const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
      const confirmedResultDetails: ResultDetail[] = [];
      const externalResult = { resultDetails: [createMockExternalResultDetail(ResourceID.Final, '1', '0')] } as ExternalResult;

      // Act
      const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('should return true when first result is greater than second result', () => {
      // Arrange
      const result1 = createMockResultDetail(ResourceID.FirstHalf, '2', '1');
      const result2 = createMockResultDetail(ResourceID.Final, '1', '0');

      // Act
      const result = service.greaterThan(result1, result2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when first result is not greater than second result', () => {
      // Arrange
      const result1 = createMockResultDetail(ResourceID.FirstHalf, '1', '0');
      const result2 = createMockResultDetail(ResourceID.Final, '2', '1');

      // Act
      const result = service.greaterThan(result1, result2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when either result has no score', () => {
      // Arrange
      const result1 = createMockResultDetail(ResourceID.FirstHalf, '', '');
      const result2 = createMockResultDetail(ResourceID.Final, '1', '0');

      // Act
      const result = service.greaterThan(result1, result2);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('draw', () => {
    it('should return true when home and away values are equal', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '1', '1');

      // Act
      const resultValue = service.draw(result);

      // Assert
      expect(resultValue).toBe(true);
    });

    it('should return false when home and away values are not equal', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '1', '0');

      // Act
      const resultValue = service.draw(result);

      // Assert
      expect(resultValue).toBe(false);
    });

    it('should return false when result has no score', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '', '');

      // Act
      const resultValue = service.draw(result);

      // Assert
      expect(resultValue).toBe(false);
    });
  });

  describe('inValidResultDetailWithOriginal', () => {
    it('should return true when result differs from original', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '2', '1');
      const originalResultDetails = [
        { resourceId: ResourceID.Final, homeValue: '1', awayValue: '0' } as GeneralResultDetail
      ];

      // Act
      const resultValue = service.inValidResultDetailWithOriginal(result, originalResultDetails);

      // Assert
      expect(resultValue).toBe(true);
    });

    it('should return false when result matches original', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '1', '0');
      const originalResultDetails = [
        { resourceId: ResourceID.Final, homeValue: '1', awayValue: '0' } as GeneralResultDetail
      ];

      // Act
      const resultValue = service.inValidResultDetailWithOriginal(result, originalResultDetails);

      // Assert
      expect(resultValue).toBe(false);
    });

    it('should return false when either result has no score', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '', '');
      const originalResultDetails = [
        { resourceId: ResourceID.Final, homeValue: '1', awayValue: '0' } as GeneralResultDetail
      ];

      // Act
      const resultValue = service.inValidResultDetailWithOriginal(result, originalResultDetails);

      // Assert
      expect(resultValue).toBe(false);
    });
  });

  describe('inValidResultDetailWithProvider', () => {
    it('should delegate to inValidResultDetailWithOriginal', () => {
      // Arrange
      const result = createMockResultDetail(ResourceID.Final, '2', '1');
      const providerResultDetails = [
        createMockExternalResultDetail(ResourceID.Final, '1', '0')
      ];

      // Act
      const resultValue = service.inValidResultDetailWithProvider(result, providerResultDetails);

      // Assert
      expect(resultValue).toBe(true);
    });
  });
});
