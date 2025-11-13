import { TestBed } from '@angular/core/testing';
import { PerformanceAutoFillFactory } from './performance-autoFill-factory';
import { PerformanceOnlyStrategy } from './performance-only.strategy';
import { PerformanceAndTotalScoreStrategy } from './performance-total-score.strategy';
import { PerformanceAndTeamWinStrategy } from './performance-team-win.strategy';
import { DefaultAutofillStrategy } from './performance-autofill.strategy.native';
import { AutofillResultContext } from './autofill.utils';
import { OddFlexModel, ResultDetail } from '../../../shared/models/sportsbook-sop';

describe('PerformanceAutoFillFactory', () => {
  let factory: PerformanceAutoFillFactory;
  let mockPerformanceOnlyStrategy: jest.Mocked<PerformanceOnlyStrategy>;
  let mockPerformanceAndTotalScoreStrategy: jest.Mocked<PerformanceAndTotalScoreStrategy>;
  let mockPerformanceAndTeamWinStrategy: jest.Mocked<PerformanceAndTeamWinStrategy>;
  let mockDefaultAutofillStrategy: jest.Mocked<DefaultAutofillStrategy>;

  beforeEach(() => {
    mockPerformanceOnlyStrategy = {
      getAutofillResult: jest.fn(),
    } as any;

    mockPerformanceAndTotalScoreStrategy = {
      getAutofillResult: jest.fn(),
    } as any;

    mockPerformanceAndTeamWinStrategy = {
      getAutofillResult: jest.fn(),
    } as any;

    mockDefaultAutofillStrategy = {
      getAutofillResult: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        PerformanceAutoFillFactory,
        { provide: PerformanceOnlyStrategy, useValue: mockPerformanceOnlyStrategy },
        { provide: PerformanceAndTotalScoreStrategy, useValue: mockPerformanceAndTotalScoreStrategy },
        { provide: PerformanceAndTeamWinStrategy, useValue: mockPerformanceAndTeamWinStrategy },
        { provide: DefaultAutofillStrategy, useValue: mockDefaultAutofillStrategy },
      ],
    });

    factory = TestBed.inject(PerformanceAutoFillFactory);
  });

  function createMockContext(results: Array<{ type: string; value: string }> = []): AutofillResultContext {
    return {
      relatedResults: [],
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
          statistics: [],
          results: results,
          relatedBettype: '',
        },
      } as OddFlexModel,
      changedResultDetail: {} as ResultDetail,
      finalResult: {} as ResultDetail,
    };
  }

  describe('getAutofillStrategy', () => {
    it('should return PerformanceOnlyStrategy when results array is empty', () => {
      const context = createMockContext([]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceOnlyStrategy);
    });

    it('should return PerformanceOnlyStrategy when results array length is 0', () => {
      const context = createMockContext([]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceOnlyStrategy);
      expect(mockPerformanceAndTotalScoreStrategy).not.toBe(strategy);
      expect(mockPerformanceAndTeamWinStrategy).not.toBe(strategy);
      expect(mockDefaultAutofillStrategy).not.toBe(strategy);
    });

    it('should return PerformanceAndTotalScoreStrategy when results contain type "over"', () => {
      const context = createMockContext([{ type: 'over', value: '100' }]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
    });

    it('should return PerformanceAndTotalScoreStrategy when results contain multiple types including "over"', () => {
      const context = createMockContext([
        { type: 'over', value: '100' },
        { type: 'winner', value: '100' },
      ]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
    });

    it('should return PerformanceAndTotalScoreStrategy when "over" is not the first result', () => {
      const context = createMockContext([
        { type: 'winner', value: '100' },
        { type: 'over', value: '100' },
      ]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
    });

    it('should return PerformanceAndTeamWinStrategy when results contain type "winner"', () => {
      const context = createMockContext([{ type: 'winner', value: '100' }]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTeamWinStrategy);
    });

    it('should return PerformanceAndTeamWinStrategy when results contain type "handicap"', () => {
      const context = createMockContext([{ type: 'handicap', value: '5' }]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTeamWinStrategy);
    });

    it('should return PerformanceAndTeamWinStrategy when results contain both "winner" and "handicap"', () => {
      const context = createMockContext([
        { type: 'winner', value: '100' },
        { type: 'handicap', value: '5' },
      ]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTeamWinStrategy);
    });

    it('should return PerformanceAndTeamWinStrategy when "winner" or "handicap" is not the first result', () => {
      const context = createMockContext([
        { type: 'unknown', value: '100' },
        { type: 'winner', value: '100' },
      ]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockPerformanceAndTeamWinStrategy);
    });

    it('should return DefaultAutofillStrategy when results exist but do not match any condition', () => {
      const context = createMockContext([{ type: 'unknown', value: '100' }]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockDefaultAutofillStrategy);
    });

    it('should return DefaultAutofillStrategy when results contain types other than "over", "winner", or "handicap"', () => {
      const context = createMockContext([
        { type: 'under', value: '100' },
        { type: 'draw', value: '0' },
      ]);
      const strategy = factory.getAutofillStrategy(context);

      expect(strategy).toBe(mockDefaultAutofillStrategy);
    });

    describe('priority order', () => {
      it('should prioritize "over" over "winner" when both are present', () => {
        const context = createMockContext([
          { type: 'over', value: '100' },
          { type: 'winner', value: '100' },
        ]);
        const strategy = factory.getAutofillStrategy(context);

        expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
        expect(strategy).not.toBe(mockPerformanceAndTeamWinStrategy);
      });

      it('should prioritize "over" over "handicap" when both are present', () => {
        const context = createMockContext([
          { type: 'over', value: '100' },
          { type: 'handicap', value: '5' },
        ]);
        const strategy = factory.getAutofillStrategy(context);

        expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
        expect(strategy).not.toBe(mockPerformanceAndTeamWinStrategy);
      });
    });

    describe('edge cases', () => {
      it('should handle context with empty oddFlex.info', () => {
        const context: AutofillResultContext = {
          relatedResults: [],
          oddFlex: {
            info: {
              playerId: 1,
              playerName: 'Player 1',
              teamId: 100,
              isHome: true,
              statistics: [],
              results: [],
              relatedBettype: '',
            },
          } as OddFlexModel,
          changedResultDetail: {} as ResultDetail,
          finalResult: {} as ResultDetail,
        };

        const strategy = factory.getAutofillStrategy(context);
        expect(strategy).toBe(mockPerformanceOnlyStrategy);
      });

      it('should handle multiple results with same type', () => {
        const context = createMockContext([
          { type: 'over', value: '100' },
          { type: 'over', value: '200' },
        ]);
        const strategy = factory.getAutofillStrategy(context);

        expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
      });

      it('should handle results with empty value strings', () => {
        const context = createMockContext([
          { type: 'over', value: '' },
        ]);
        const strategy = factory.getAutofillStrategy(context);

        expect(strategy).toBe(mockPerformanceAndTotalScoreStrategy);
      });
    });
  });
});
