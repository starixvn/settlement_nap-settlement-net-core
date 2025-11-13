import { TestBed } from '@angular/core/testing';
import { PerformanceAndTotalScoreStrategy } from './performance-total-score.strategy';
import { AutofillResultContext, RelatedResult } from './autofill.utils';
import { OddFlexModel, ResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';

describe('PerformanceAndTotalScoreStrategy', () => {
  let strategy: PerformanceAndTotalScoreStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceAndTotalScoreStrategy],
    });
    strategy = TestBed.inject(PerformanceAndTotalScoreStrategy);
  });

  function createMockContext(
    finalResult: Partial<ResultDetail>,
    relatedResults: RelatedResult[] = [],
    statistics: Array<{ type: string; value: string }> = [],
    results: Array<{ type: string; value: string }> = []
  ): AutofillResultContext {
    return {
      relatedResults,
      oddFlex: {
        resourceId: 'R001',
        betType: 1,
        betChoice: '',
        oddsInfo: '',
        info: {
          playerId: 1,
          playerName: 'Player 1',
          teamId: 100,
          isHome: true,
          statistics,
          results,
          relatedBettype: '',
        },
      } as OddFlexModel,
      changedResultDetail: {} as any,
      finalResult: finalResult as ResultDetail,
    };
  }

  function createRelatedResult(
    betType: string,
    homeValue: string,
    resultStatusId: number,
    settlementStatusId: number
  ): RelatedResult {
    return {
      resourceId: 'R001',
      betType,
      homeValue,
      resultStatusId,
      settlementStatusId,
    };
  }

  describe('getAutofillResult', () => {
    describe('returning "None" for refund', () => {
      it('should return "None" when finalResult resultStatusId is Refund', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const context = createMockContext(finalResult);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });

      it('should return "None" when finalResult is Refund regardless of settlementStatusId', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Calculated,
        };
        const context = createMockContext(finalResult);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });

      it('should return "None" when finalResult is Refund even with valid statistics', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });
    });

    describe('returning "Y" (Yes) for calculated status', () => {
      it('should return "Y" when finalResult is Calculated and both validations pass', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }] // Total: 18 > 15
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with multiple statistics and over condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
          createRelatedResult('659', '8', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [
            { type: 'points', value: '10' },
            { type: 'rebounds', value: '8' },
          ],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" when total score exactly equals threshold (over condition)', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '17' }] // Total: 18 > 17
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with greater than or equal statistic condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '15', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10+' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });
    });

    describe('returning "N" (No) for calculated status', () => {
      it('should return "N" when finalResult is Calculated but isValidCalcFinalResult fails', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '20' }] // Total: 18 <= 20, fails
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when finalResult is Calculated but isValidStatisticResult fails', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running), // Doesn't meet condition
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when both validations fail', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '20' }] // Both fail
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when total score equals threshold (over condition requires >)', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '18' }] // Total: 18 is not > 18
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when total score is less than threshold', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '19' }] // Total: 18 <= 19
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });

    describe('returning empty string', () => {
      it('should return empty string when finalResult is not Calculated', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.RunningZero,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should return empty string when finalResult settlementStatusId is not Calculated', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Running,
        };
        const context = createMockContext(finalResult);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });
    });

    describe('statistic validation', () => {
      it('should validate points statistic correctly', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate rebounds statistic correctly', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('659', '8', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'rebounds', value: '8' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate assists statistic correctly', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('656', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'assists', value: '5' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail validation when statistic does not match', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should fail validation when relatedResult for statistic is not found', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('999', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should validate with greater than or equal condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '15', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10+' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate with less than condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10-' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail validation when less than condition is not met', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '15', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10-' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });

    describe('validateCalcFinalResult integration - over condition', () => {
      it('should validate over condition correctly when total score is greater', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }] // 18 > 15
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail over condition when total score equals threshold', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '18' }] // 18 is not > 18
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should fail over condition when total score is less than threshold', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8', // Total: 18
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '20' }] // 18 <= 20
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should handle zero values in over condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '0',
          awayValue: '0', // Total: 0
        };
        const relatedResults = [
          createRelatedResult('653', '0', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '0' }],
          [{ type: 'over', value: '0' }] // 0 is not > 0
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });

    describe('edge cases', () => {
      it('should handle empty statistics array', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults: RelatedResult[] = [];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y'); // Empty statistics array passes validation
      });

      it('should handle empty relatedResults array', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const context = createMockContext(
          finalResult,
          [],
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N'); // Statistic validation fails because relatedResult not found
      });

      it('should handle non-numeric homeValue in statistic validation', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', 'abc', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '15' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should handle empty results array in oddFlex', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [] // Empty results
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y'); // validateCalcFinalResult returns true for empty results
      });

      it('should handle empty homeValue and awayValue in finalResult', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '',
          awayValue: '', // Total: 0
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '0' }] // 0 is not > 0
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should handle non-numeric homeValue and awayValue in finalResult', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: 'abc',
          awayValue: 'def', // Total: 0 (NaN converted to 0)
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'over', value: '0' }] // 0 is not > 0
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });
  });
});
