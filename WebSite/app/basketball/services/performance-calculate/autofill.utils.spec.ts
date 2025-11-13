import {
  compareWithCondition,
  validateCalcFinalResult,
  statisticToResourceId,
} from './autofill.utils';
import { OddFlexModel, ResultDetail } from '../../../shared/models/sportsbook-sop';

describe('autofill.utils', () => {
  describe('compareWithCondition', () => {
    describe('exact match (no operator)', () => {
      it('should return true when value equals threshold', () => {
        expect(compareWithCondition(5, '5')).toBe(true);
        expect(compareWithCondition(10, '10')).toBe(true);
        expect(compareWithCondition(0, '0')).toBe(true);
      });

      it('should return false when value does not equal threshold', () => {
        expect(compareWithCondition(5, '4')).toBe(false);
        expect(compareWithCondition(5, '6')).toBe(false);
        expect(compareWithCondition(10, '11')).toBe(false);
      });
    });

    describe('greater than or equal (operator +)', () => {
      it('should return true when value is greater than threshold', () => {
        expect(compareWithCondition(6, '5+')).toBe(true);
        expect(compareWithCondition(10, '5+')).toBe(true);
        expect(compareWithCondition(100, '50+')).toBe(true);
      });

      it('should return true when value equals threshold', () => {
        expect(compareWithCondition(5, '5+')).toBe(true);
        expect(compareWithCondition(10, '10+')).toBe(true);
      });

      it('should return false when value is less than threshold', () => {
        expect(compareWithCondition(4, '5+')).toBe(false);
        expect(compareWithCondition(9, '10+')).toBe(false);
      });
    });

    describe('less than (operator -)', () => {
      it('should return true when value is less than threshold', () => {
        expect(compareWithCondition(4, '5-')).toBe(true);
        expect(compareWithCondition(9, '10-')).toBe(true);
        expect(compareWithCondition(0, '5-')).toBe(true);
      });

      it('should return false when value equals threshold', () => {
        expect(compareWithCondition(5, '5-')).toBe(false);
        expect(compareWithCondition(10, '10-')).toBe(false);
      });

      it('should return false when value is greater than threshold', () => {
        expect(compareWithCondition(6, '5-')).toBe(false);
        expect(compareWithCondition(11, '10-')).toBe(false);
      });
    });

    describe('invalid conditions', () => {
      it('should return false for invalid format', () => {
        expect(compareWithCondition(5, '')).toBe(false);
        expect(compareWithCondition(5, 'abc')).toBe(false);
        expect(compareWithCondition(5, '5++')).toBe(false);
        expect(compareWithCondition(5, '5--')).toBe(false);
        expect(compareWithCondition(5, '+5')).toBe(false);
        expect(compareWithCondition(5, '-5')).toBe(false);
        expect(compareWithCondition(5, '5*')).toBe(false);
        expect(compareWithCondition(5, '5/')).toBe(false);
      });

      it('should return false for non-numeric threshold', () => {
        expect(compareWithCondition(5, 'abc+')).toBe(false);
        expect(compareWithCondition(5, 'xyz-')).toBe(false);
      });
    });
  });

  describe('validateCalcFinalResult', () => {
    let mockOddFlex: OddFlexModel;
    let mockFinalResult: ResultDetail;

    beforeEach(() => {
      mockFinalResult = {
        homeValue: '10',
        awayValue: '8',
      } as ResultDetail;

      mockOddFlex = {
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
          results: [],
          relatedBettype: '',
        },
      } as OddFlexModel;
    });

    describe('winner validator', () => {
      it('should return true when home team wins and isHome is true', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.teamId = 100;
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';
        mockOddFlex.info.results = [{ type: 'winner', value: '100' }];

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when home team loses and isHome is true', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.teamId = 100;
        mockFinalResult.homeValue = '8';
        mockFinalResult.awayValue = '10';
        mockOddFlex.info.results = [{ type: 'winner', value: '100' }];

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should return true when away team wins and isHome is false', () => {
        mockOddFlex.info.isHome = false;
        mockOddFlex.info.teamId = 200;
        mockFinalResult.homeValue = '8';
        mockFinalResult.awayValue = '10';
        mockOddFlex.info.results = [{ type: 'winner', value: '200' }];

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when away team loses and isHome is false', () => {
        mockOddFlex.info.isHome = false;
        mockOddFlex.info.teamId = 200;
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';
        mockOddFlex.info.results = [{ type: 'winner', value: '200' }];

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should return false when scores are equal', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.teamId = 100;
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '10';
        mockOddFlex.info.results = [{ type: 'winner', value: '100' }];

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });
    });

    describe('over validator', () => {
      it('should return true when total score is greater than threshold', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '15' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when total score equals threshold', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '18' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should return false when total score is less than threshold', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '20' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });
    });

    describe('handicap validator', () => {
      it('should return true when home team wins with handicap (isHome=true)', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.results = [{ type: 'handicap', value: '2' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '7'; // 10 - 2 = 8 >= 7

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when home team loses with handicap (isHome=true)', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.results = [{ type: 'handicap', value: '2' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '9'; // 10 - 2 = 8 < 9

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should return true when away team wins with handicap (isHome=false)', () => {
        mockOddFlex.info.isHome = false;
        mockOddFlex.info.results = [{ type: 'handicap', value: '2' }];
        mockFinalResult.homeValue = '7';
        mockFinalResult.awayValue = '10'; // 10 - 2 = 8 >= 7

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when away team loses with handicap (isHome=false)', () => {
        mockOddFlex.info.isHome = false;
        mockOddFlex.info.results = [{ type: 'handicap', value: '2' }];
        mockFinalResult.homeValue = '9';
        mockFinalResult.awayValue = '10'; // 10 - 2 = 8 < 9

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should return true when scores are equal after handicap', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.results = [{ type: 'handicap', value: '2' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8'; // 10 - 2 = 8 >= 8

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });
    });

    describe('multiple validators', () => {
      it('should return true when all validators pass', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.teamId = 100;
        mockOddFlex.info.results = [
          { type: 'winner', value: '100' },
          { type: 'over', value: '15' },
        ];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });

      it('should return false when any validator fails', () => {
        mockOddFlex.info.isHome = true;
        mockOddFlex.info.teamId = 100;
        mockOddFlex.info.results = [
          { type: 'winner', value: '100' },
          { type: 'over', value: '20' }, // This will fail
        ];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });
    });

    describe('unknown validator type', () => {
      it('should return false for unknown validator type', () => {
        mockOddFlex.info.results = [{ type: 'unknown', value: '10' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle zero values', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '0' }];
        mockFinalResult.homeValue = '0';
        mockFinalResult.awayValue = '0';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should handle string values that cannot be parsed as numbers', () => {
        mockOddFlex.info.results = [{ type: 'over', value: 'abc' }];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should handle empty or invalid homeValue and awayValue', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '10' }];
        mockFinalResult.homeValue = '';
        mockFinalResult.awayValue = '';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should handle non-numeric homeValue and awayValue', () => {
        mockOddFlex.info.results = [{ type: 'over', value: '10' }];
        mockFinalResult.homeValue = 'abc';
        mockFinalResult.awayValue = 'def';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(false);
      });

      it('should handle empty results array', () => {
        mockOddFlex.info.results = [];
        mockFinalResult.homeValue = '10';
        mockFinalResult.awayValue = '8';

        expect(validateCalcFinalResult(mockOddFlex, mockFinalResult)).toBe(true);
      });
    });
  });

  describe('statisticToResourceId', () => {
    it('should contain all expected statistic mappings', () => {
      expect(statisticToResourceId.points).toBe('653');
      expect(statisticToResourceId.rebounds).toBe('659');
      expect(statisticToResourceId.assists).toBe('656');
      expect(statisticToResourceId.steals).toBe('667');
      expect(statisticToResourceId.blocks).toBe('665');
      expect(statisticToResourceId.three_points).toBe('662');
    });

    it('should have all values as strings', () => {
      Object.values(statisticToResourceId).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });
});
