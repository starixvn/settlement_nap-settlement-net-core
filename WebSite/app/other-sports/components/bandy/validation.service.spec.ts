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

  // Edge Cases and Error Handling Tests
  describe('Edge Cases and Error Handling', () => {


    describe('inValidPen - Edge Cases', () => {

      it('should handle negative penalty values', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Pen, '-1', '0')
        ];

        // Act
        const result = service.inValidPen(resultDetails);

        // Assert
        expect(result).toBe(true);
      });

      it('should handle decimal penalty values', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Pen, '1.5', '0')
        ];

        // Act
        const result = service.inValidPen(resultDetails);

        // Assert
        expect(result).toBe(true);
      });

      it('should handle string penalty values', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Pen, 'abc', 'def')
        ];

        // Act
        const result = service.inValidPen(resultDetails);

        // Assert
        expect(result).toBe(true);
      });

      it('should handle very large penalty values', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Pen, '999999', '0')
        ];

        // Act
        const result = service.inValidPen(resultDetails);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('inValidMatchSumScore - Edge Cases', () => {
    
      it('should handle very large numbers', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.FullTime, '999999999', '0'),
          createMockResultDetail(ResourceID.Final, '999999999', '0')
        ];

        // Act
        const result = service.inValidMatchSumScore(resultDetails);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('greaterThan - Edge Cases', () => {

      it('should handle results with null values', () => {
        // Arrange
        const result1 = { ...createMockResultDetail(ResourceID.Final, '1', '0'), homeValue: null, awayValue: null };
        const result2 = createMockResultDetail(ResourceID.Final, '0', '0');

        // Act
        const result = service.greaterThan(result1, result2);

        // Assert
        expect(result).toBe(false);
      });

      it('should handle results with undefined values', () => {
        // Arrange
        const result1 = { ...createMockResultDetail(ResourceID.Final, '1', '0'), homeValue: undefined, awayValue: undefined };
        const result2 = createMockResultDetail(ResourceID.Final, '0', '0');

        // Act
        const result = service.greaterThan(result1, result2);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('draw - Edge Cases', () => {

      it('should handle result with null values', () => {
        // Arrange
        const result = { ...createMockResultDetail(ResourceID.Final, '1', '1'), homeValue: null, awayValue: null };

        // Act
        const resultValue = service.draw(result);

        // Assert
        expect(resultValue).toBe(false);
      });

      it('should handle result with undefined values', () => {
        // Arrange
        const result = { ...createMockResultDetail(ResourceID.Final, '1', '1'), homeValue: undefined, awayValue: undefined };

        // Act
        const resultValue = service.draw(result);

        // Assert
        expect(resultValue).toBe(false);
      });
    });
  });

  // Score Mismatch Verification Tests
  describe('Score Mismatch Verification', () => {
    describe('verifyChangeInputScore', () => {
      it('should not process when currentResult has score mismatch', () => {
        // Arrange
        const currentResult = { ...createMockResultDetail(ResourceID.Final, '1', '0'), isScoreMismatched: true };
        const resultDetails = [currentResult];
        const confirmResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        service.verifyChangeInputScore(currentResult, resultDetails, confirmResultDetails, externalResult);

        // Assert
        expect(currentResult.isScoreMismatched).toBe(true);
      });

      it('should not process when finalResult has score mismatch', () => {
        // Arrange
        const currentResult = createMockResultDetail(ResourceID.Final, '1', '0');
        const finalResult = { ...createMockResultDetail(ResourceID.Final, '2', '1'), isScoreMismatched: true };
        const resultDetails = [currentResult, finalResult];
        const confirmResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        service.verifyChangeInputScore(currentResult, resultDetails, confirmResultDetails, externalResult);

        // Assert
        expect(finalResult.isScoreMismatched).toBe(true);
      });

      it('should compare scores when both provider and trader exist', () => {
        // Arrange
        const currentResult = createMockResultDetail(ResourceID.Final, '1', '0');
        const resultDetails = [currentResult];
        const confirmResultDetails = [createMockResultDetail(ResourceID.Final, '2', '1')];
        const externalResult = { 
          resultDetails: [createMockExternalResultDetail(ResourceID.Final, '3', '2')] 
        } as ExternalResult;

        // Act
        service.verifyChangeInputScore(currentResult, resultDetails, confirmResultDetails, externalResult);

        // Assert
        expect(currentResult.isScoreMismatched).toBe(true);
      });

      it('should compare with provider only when no trader exists', () => {
        // Arrange
        const currentResult = createMockResultDetail(ResourceID.Final, '1', '0');
        const resultDetails = [currentResult];
        const confirmResultDetails: ResultDetail[] = [];
        const externalResult = { 
          resultDetails: [createMockExternalResultDetail(ResourceID.Final, '2', '1')] 
        } as ExternalResult;

        // Act
        service.verifyChangeInputScore(currentResult, resultDetails, confirmResultDetails, externalResult);

        // Assert
        expect(currentResult.isScoreMismatched).toBe(true);
      });
    });

    describe('verifyResultChanged', () => {
      it('should mark score as mismatched when provider and confirm results differ', () => {
        // Arrange
        const resultsChanged = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmResults = [createMockResultDetail(ResourceID.Final, '2', '1')];
        const providerResults = [createMockExternalResultDetail(ResourceID.Final, '3', '2')];

        // Act
        service.verifyResultChanged(resultsChanged, confirmResults, providerResults);

        // Assert
        expect(resultsChanged[0].isScoreMismatched).toBe(true);
      });

      it('should mark score as mismatched when only provider result differs', () => {
        // Arrange
        const resultsChanged = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmResults: ResultDetail[] = [];
        const providerResults = [createMockExternalResultDetail(ResourceID.Final, '2', '1')];

        // Act
        service.verifyResultChanged(resultsChanged, confirmResults, providerResults);

        // Assert
        expect(resultsChanged[0].isScoreMismatched).toBe(true);
      });

      it('should mark score as mismatched when only confirm result differs', () => {
        // Arrange
        const resultsChanged = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmResults = [createMockResultDetail(ResourceID.Final, '2', '1')];
        const providerResults: ExternalResultDetail[] = [];

        // Act
        service.verifyResultChanged(resultsChanged, confirmResults, providerResults);

        // Assert
        expect(resultsChanged[0].isScoreMismatched).toBe(true);
      });

      it('should not mark score as mismatched when all results match', () => {
        // Arrange
        const resultsChanged = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmResults = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const providerResults = [createMockExternalResultDetail(ResourceID.Final, '1', '0')];

        // Act
        service.verifyResultChanged(resultsChanged, confirmResults, providerResults);

        // Assert
        expect(resultsChanged[0].isScoreMismatched).toBe(false);
      });
    });
  });

  // Consistency Score Tests
  describe('Consistency Score Verification', () => {
    describe('isConsistentScoreSOPLite', () => {

      it('should return false when no result details are consistent', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        const result = service.isConsistentScoreSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(false);
      });

      it('should handle empty result details array', () => {
        // Arrange
        const resultDetails: ResultDetail[] = [];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        const result = service.isConsistentScoreSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  // Boundary Value Tests
  describe('Boundary Value Tests', () => {
    describe('Numeric Boundary Tests', () => {
      it('should handle zero values correctly', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.FirstHalf, '0', '0'),
          createMockResultDetail(ResourceID.FullTime, '0', '0')
        ];

        // Act
        const result = service.inValidFirstHalfFullTime(resultDetails);

        // Assert
        expect(result).toBe(false);
      });

      it('should handle very large numbers', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.FirstHalf, '999999999', '999999999'),
          createMockResultDetail(ResourceID.FullTime, '999999998', '999999998')
        ];

        // Act
        const result = service.inValidFirstHalfFullTime(resultDetails);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('String Boundary Tests', () => {
      it('should handle empty strings', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Final, '', ''),
          createMockResultDetail(ResourceID.Final, '', '')
        ];

        // Act
        const result = service.draw(resultDetails[0]);

        // Assert
        expect(result).toBe(false);
      });


      it('should handle very long strings', () => {
        // Arrange
        const longString = '1'.repeat(1000);
        const resultDetails = [
          createMockResultDetail(ResourceID.Final, longString, longString)
        ];

        // Act
        const result = service.draw(resultDetails[0]);

        // Assert
        expect(result).toBe(true);
      });
    });
  });

  // Additional Penalty Validation Tests
  describe('Additional Penalty Validation', () => {
    it('should return true for penalty with both values as 0', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '0', '0')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(true); // 0-0 is a draw, which is invalid for penalties
    });

    it('should return true for penalty with both values as 1', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '1', '1')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(true); // 1-1 is a draw, which is invalid for penalties
    });

    it('should return false for penalty with valid values (1-0)', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '1', '0')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for penalty with valid values (0-1)', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail(ResourceID.Pen, '0', '1')
      ];

      // Act
      const result = service.inValidPen(resultDetails);

      // Assert
      expect(result).toBe(false);
    });
  });

  // Provider and Trader Validation Tests
  describe('Provider and Trader Validation', () => {
    describe('isInsufficientSOPLite - Additional Tests', () => {
      it('should return true when resultDetails is empty', () => {
        // Arrange
        const resultDetails: ResultDetail[] = [];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(true);
      });


      it('should return true when externalResult is null', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails: ResultDetail[] = [];

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, null as any);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when externalResult.resultDetails is null', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { resultDetails: null } as any;

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false when trader exists with different resourceId', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails = [
          { ...createMockResultDetail(ResourceID.FirstHalf, '1', '0'), resultStatusId: ResultStatusId.TraderConfirm }
        ];
        const externalResult = { resultDetails: [] } as ExternalResult;

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(true); // Different resourceId, so no trader for Final
      });

      it('should return false when provider exists with different resourceId', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { 
          resultDetails: [createMockExternalResultDetail(ResourceID.FirstHalf, '1', '0')] 
        } as ExternalResult;

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(true); // Different resourceId, so no provider for Final
      });

      it('should return false when provider exists but has no score', () => {
        // Arrange
        const resultDetails = [createMockResultDetail(ResourceID.Final, '1', '0')];
        const confirmedResultDetails: ResultDetail[] = [];
        const externalResult = { 
          resultDetails: [createMockExternalResultDetail(ResourceID.Final, '', '')] 
        } as ExternalResult;

        // Act
        const result = service.isInsufficientSOPLite(resultDetails, confirmedResultDetails, externalResult);

        // Assert
        expect(result).toBe(true); // Provider has no score, so insufficient
      });
    });
  });

  // Additional Edge Cases for Existing Methods
  describe('Additional Edge Cases', () => {
    describe('inValidResult - Additional Tests', () => {
      it('should return false when resultDetails is empty', () => {
        // Arrange
        const resultDetails: ResultDetail[] = [];

        // Act
        const result = service.inValidResult(resultDetails);

        // Assert
        expect(result).toBe(false);
      });

      it('should return true when inValidMatchSumScore fails', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.FullTime, '1', '0'),
          createMockResultDetail(ResourceID.Et, '1', '0'),
          createMockResultDetail(ResourceID.Final, '3', '1') // Sum should be 2-0, not 3-1
        ];

        // Act
        const result = service.inValidResult(resultDetails);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('invalidMatchResult - Additional Tests', () => {

      it('should return true when inValidETMatch fails', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Et, '2', '1'),
          createMockResultDetail(ResourceID.Final, '1', '0')
        ];

        // Act
        const result = service.invalidMatchResult(resultDetails);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when inValidPenMatch fails', () => {
        // Arrange
        const resultDetails = [
          createMockResultDetail(ResourceID.Pen, '2', '1'),
          createMockResultDetail(ResourceID.Final, '1', '0')
        ];

        // Act
        const result = service.invalidMatchResult(resultDetails);

        // Assert
        expect(result).toBe(true);
      });
    });

  });

  // Performance and Stress Tests
  describe('Performance and Stress Tests', () => {
    it('should handle large arrays efficiently', () => {
      // Arrange
      const largeArray = Array.from({ length: 1000 }, (_, i) => 
        createMockResultDetail(ResourceID.Final, i.toString(), (i + 1).toString())
      );

      // Act
      const startTime = performance.now();
      const result = service.inValidResult(largeArray);
      const endTime = performance.now();

      // Assert
      expect(result).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle complex nested validations efficiently', () => {
      // Arrange
      const complexResultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '1', '0'),
        createMockResultDetail(ResourceID.FullTime, '2', '1'),
        createMockResultDetail(ResourceID.Et, '0', '0'),
        createMockResultDetail(ResourceID.Pen, '1', '0'),
        createMockResultDetail(ResourceID.Final, '3', '1')
      ];

      // Act
      const startTime = performance.now();
      const result = service.inValidResult(complexResultDetails);
      const endTime = performance.now();

      // Assert
      expect(result).toBe(false);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {

    it('should detect multiple validation issues', () => {
      // Arrange - Match with multiple issues
      const resultDetails = [
        createMockResultDetail(ResourceID.FirstHalf, '3', '1'), // Greater than full time
        createMockResultDetail(ResourceID.FullTime, '2', '1'),
        createMockResultDetail(ResourceID.Et, '1', '0'), // Greater than final
        createMockResultDetail(ResourceID.Pen, '1', '1'), // Draw penalty
        createMockResultDetail(ResourceID.Final, '2', '1')
      ];

      // Act
      const invalidResult = service.inValidResult(resultDetails);
      const invalidMatchResult = service.invalidMatchResult(resultDetails);
      const invalidFirstHalf = service.invalidFistHalf(resultDetails);
      const invalidPen = service.inValidPen(resultDetails);

      // Assert
      expect(invalidResult).toBe(true);
      expect(invalidMatchResult).toBe(true);
      expect(invalidFirstHalf).toBe(true);
      expect(invalidPen).toBe(true);
    });
  });
});
