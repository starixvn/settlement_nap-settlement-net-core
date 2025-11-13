import { TestBed } from '@angular/core/testing';
import { PerformanceOnlyStrategy } from './performance-only.strategy';
import { AutofillResultContext, RelatedResult } from './autofill.utils';
import { OddFlexModel } from '../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';

describe('PerformanceOnlyStrategy', () => {
  let strategy: PerformanceOnlyStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceOnlyStrategy],
    });
    strategy = TestBed.inject(PerformanceOnlyStrategy);
  });

  function createMockContext(
    relatedResults: RelatedResult[] = [],
    statistics: Array<{ type: string; value: string }> = []
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
          results: [],
          relatedBettype: '',
        },
      } as OddFlexModel,
      changedResultDetail: {} as any,
      finalResult: {} as any,
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
    describe('returning "Y" (Yes)', () => {
      it('should return "Y" when allValueAndRunning and isValidStatisticResults', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" when allCalculated and isValidStatisticResults', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" when allRefundWithDetermined and isValidStatisticResults', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with multiple relatedResults all calculated', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated),
          createRelatedResult('659', '8', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated),
        ];
        const context = createMockContext(relatedResults, [
          { type: 'points', value: '10' },
          { type: 'rebounds', value: '8' },
        ]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" when allValueAndRunning with RunningOne status', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningOne, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });
    });

    describe('returning "N" (No)', () => {
      it('should return "N" when allValueAndRunning and not allCalculated and !isValidStatisticResults', () => {
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when value does not meet condition (less than)', () => {
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10+' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when value does not meet condition (exact match fails)', () => {
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should not return "N" when allCalculated even if !isValidStatisticResults', () => {
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).not.toBe('N');
      });
    });

    // describe('returning "None"', () => {
    //   it('should return "None" when allRefundWithDetermined and !isValidStatisticResults', () => {
    //     const relatedResults = [
    //       createRelatedResult('653', '5', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
    //     ];
    //     const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

    //     const result = strategy.getAutofillResult(context);

    //     expect(result).toBe('None');
    //   });

    //   it('should return "None" with multiple relatedResults all RefundWithDetermined', () => {
    //     const relatedResults = [
    //       createRelatedResult('653', '5', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
    //       createRelatedResult('659', '3', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
    //     ];
    //     const context = createMockContext(relatedResults, [
    //       { type: 'points', value: '10' },
    //       { type: 'rebounds', value: '8' },
    //     ]);

    //     const result = strategy.getAutofillResult(context);

    //     expect(result).toBe('None');
    //   });
    // });

    describe('returning empty string', () => {
      it('should return empty string when conditions are not met', () => {
        const relatedResults = [
          createRelatedResult('653', '', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should return empty string when resultStatusId is AutoCompleted but not allValueAndRunning', () => {
        const relatedResults = [
          createRelatedResult('653', '', ResultStatusId.AutoCompleted, SettlementStatusId.Calculated),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should return empty string when resultStatusId is ManualCompleted', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.ManualCompleted, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });
    });

    describe('statistic validation', () => {
      it('should validate points statistic correctly', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate rebounds statistic correctly', () => {
        const relatedResults = [
          createRelatedResult('659', '8', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'rebounds', value: '8' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate assists statistic correctly', () => {
        const relatedResults = [
          createRelatedResult('656', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'assists', value: '5' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate multiple statistics - all pass', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
          createRelatedResult('659', '8', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [
          { type: 'points', value: '10' },
          { type: 'rebounds', value: '8' },
        ]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail validation when one statistic does not match', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
          createRelatedResult('659', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [
          { type: 'points', value: '10' },
          { type: 'rebounds', value: '8' },
        ]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should fail validation when relatedResult for statistic is not found', () => {
        const relatedResults = [
          createRelatedResult('999', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should validate with greater than or equal condition', () => {
        const relatedResults = [
          createRelatedResult('653', '15', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10+' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate with less than condition', () => {
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10-' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail validation when less than condition is not met', () => {
        const relatedResults = [
          createRelatedResult('653', '15', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10-' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });

    describe('edge cases', () => {
      it('should handle empty statistics array', () => {
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, []);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should handle homeValue as empty string', () => {
        const relatedResults = [
          createRelatedResult('653', '', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should handle homeValue as "0"', () => {
        const relatedResults = [
          createRelatedResult('653', '0', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '0' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should handle non-numeric homeValue in statistic validation', () => {
        const relatedResults = [
          createRelatedResult('653', 'abc', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(relatedResults, [{ type: 'points', value: '10' }]);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });
    });
  });
});
