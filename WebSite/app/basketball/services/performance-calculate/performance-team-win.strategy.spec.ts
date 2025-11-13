import { TestBed } from '@angular/core/testing';
import { PerformanceAndTeamWinStrategy } from './performance-team-win.strategy';
import { AutofillResultContext, RelatedResult } from './autofill.utils';
import { OddFlexModel, ResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';

describe('PerformanceAndTeamWinStrategy', () => {
  let strategy: PerformanceAndTeamWinStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceAndTeamWinStrategy],
    });
    strategy = TestBed.inject(PerformanceAndTeamWinStrategy);
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
    describe('returning "None" for refund scenarios', () => {
      it('should return "None" when finalResult is Refund and hasRefundWithDeterminedRelatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
        ];
        const context = createMockContext(finalResult, relatedResults);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });

      it('should return "None" when finalResult is Refund and hasRefundRelatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.Refund, SettlementStatusId.Running),
        ];
        const context = createMockContext(finalResult, relatedResults);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });

      it('should return "None" when finalResult is Refund and has both Refund and RefundWithDetermined relatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.Refund, SettlementStatusId.Running),
          createRelatedResult('659', '8', ResultStatusId.RefundWithDetermined, SettlementStatusId.Running),
        ];
        const context = createMockContext(finalResult, relatedResults);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('None');
      });

      it('should not return "None" when finalResult is Refund but no refund relatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(finalResult, relatedResults);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should return "None" when finalResult is Calculated but hasRefundRelatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '8',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.Refund, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with multiple statistics and winner condition', () => {
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with handicap condition', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '7',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'handicap', value: '2' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should return "Y" with both winner and handicap conditions', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '7',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [
            { type: 'winner', value: '100' },
            { type: 'handicap', value: '2' },
          ]
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
          homeValue: '8',
          awayValue: '10', // Home team loses
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'winner', value: '100' }] // Expects home team to win
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when both validations fail', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '8',
          awayValue: '10',
        };
        const relatedResults = [
          createRelatedResult('653', '5', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should return "N" when handicap condition fails', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '9', // 10 - 2 = 8 < 9, fails
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'handicap', value: '2' }]
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
        const context = createMockContext(finalResult, relatedResults);

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('');
      });

      it('should return empty string when finalResult is Refund but no refund relatedResults', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.Refund,
          settlementStatusId: SettlementStatusId.Running,
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(finalResult, relatedResults);

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
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });
    });

    describe('validateCalcFinalResult integration', () => {
      it('should validate winner condition for home team', () => {
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should validate winner condition for away team', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '8',
          awayValue: '10',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'winner', value: '200' }] // Away team
        );
        // Set isHome to false for away team
        context.oddFlex.info.isHome = false;
        context.oddFlex.info.teamId = 200;

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
      });

      it('should fail winner condition when team loses', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '8',
          awayValue: '10',
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'winner', value: '100' }] // Home team should win but loses
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('N');
      });

      it('should validate handicap condition correctly', () => {
        const finalResult: Partial<ResultDetail> = {
          resultStatusId: ResultStatusId.AutoCompleted,
          settlementStatusId: SettlementStatusId.Calculated,
          homeValue: '10',
          awayValue: '7', // 10 - 2 = 8 >= 7
        };
        const relatedResults = [
          createRelatedResult('653', '10', ResultStatusId.RunningZero, SettlementStatusId.Running),
        ];
        const context = createMockContext(
          finalResult,
          relatedResults,
          [{ type: 'points', value: '10' }],
          [{ type: 'handicap', value: '2' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
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
          [{ type: 'winner', value: '100' }]
        );

        const result = strategy.getAutofillResult(context);

        expect(result).toBe('Y');
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
          [{ type: 'winner', value: '100' }]
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
          [{ type: 'winner', value: '100' }]
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
    });
  });
});
