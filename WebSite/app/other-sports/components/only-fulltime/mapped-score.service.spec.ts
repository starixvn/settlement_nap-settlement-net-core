import { TestBed } from '@angular/core/testing';
import { MappedScoreService } from './mapped-score.service';
import { MappedScore } from '../../models';

describe('MappedScoreService', () => {
  let service: MappedScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MappedScoreService]
    });
    service = TestBed.inject(MappedScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMappedScore', () => {
    describe('Home team wins by KO (homeValue >= 1 && homeValue <= 5 && awayValue === 0)', () => {
      it('should map home KO in round 1', () => {
        const result = service.getMappedScore(1, 0);
        const expected: MappedScore = { home: 1, away: 0, round: '1' };
        expect(result).toEqual(expected);
      });

      it('should map home KO in round 3', () => {
        const result = service.getMappedScore(3, 0);
        const expected: MappedScore = { home: 1, away: 0, round: '3' };
        expect(result).toEqual(expected);
      });

      it('should map home KO in round 5', () => {
        const result = service.getMappedScore(5, 0);
        const expected: MappedScore = { home: 1, away: 0, round: '5' };
        expect(result).toEqual(expected);
      });
    });

    describe('Away team wins by KO (homeValue === 0 && awayValue >= 1 && awayValue <= 5)', () => {
      it('should map away KO in round 1', () => {
        const result = service.getMappedScore(0, 1);
        const expected: MappedScore = { home: 0, away: 1, round: '1' };
        expect(result).toEqual(expected);
      });

      it('should map away KO in round 4', () => {
        const result = service.getMappedScore(0, 4);
        const expected: MappedScore = { home: 0, away: 1, round: '4' };
        expect(result).toEqual(expected);
      });

      it('should map away KO in round 5', () => {
        const result = service.getMappedScore(0, 5);
        const expected: MappedScore = { home: 0, away: 1, round: '5' };
        expect(result).toEqual(expected);
      });
    });

    describe('Home team wins by decision (homeValue === 6 && awayValue === 0)', () => {
      it('should map home decision win', () => {
        const result = service.getMappedScore(6, 0);
        const expected: MappedScore = { home: 5, away: 0, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('Away team wins by decision (homeValue === 0 && awayValue === 6)', () => {
      it('should map away decision win', () => {
        const result = service.getMappedScore(0, 6);
        const expected: MappedScore = { home: 0, away: 5, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('Draw by decision (homeValue === 6 && awayValue === 6)', () => {
      it('should map decision draw', () => {
        const result = service.getMappedScore(6, 6);
        const expected: MappedScore = { home: 5, away: 5, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('Default case - no special mapping', () => {
      it('should return original values when no special case matches', () => {
        const result = service.getMappedScore(2, 3);
        const expected: MappedScore = { home: 2, away: 3, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle zero-zero score', () => {
        const result = service.getMappedScore(0, 0);
        const expected: MappedScore = { home: 0, away: 0, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle high scores', () => {
        const result = service.getMappedScore(10, 8);
        const expected: MappedScore = { home: 10, away: 8, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle negative scores', () => {
        const result = service.getMappedScore(-1, -2);
        const expected: MappedScore = { home: -1, away: -2, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('Edge cases', () => {
      it('should handle boundary case: homeValue = 0, awayValue = 0', () => {
        const result = service.getMappedScore(0, 0);
        const expected: MappedScore = { home: 0, away: 0, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle boundary case: homeValue = 1, awayValue = 1', () => {
        const result = service.getMappedScore(1, 1);
        const expected: MappedScore = { home: 1, away: 1, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle boundary case: homeValue = 5, awayValue = 5', () => {
        const result = service.getMappedScore(5, 5);
        const expected: MappedScore = { home: 5, away: 5, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle boundary case: homeValue = 7, awayValue = 0', () => {
        const result = service.getMappedScore(7, 0);
        const expected: MappedScore = { home: 7, away: 0, round: '' };
        expect(result).toEqual(expected);
      });

      it('should handle boundary case: homeValue = 0, awayValue = 7', () => {
        const result = service.getMappedScore(0, 7);
        const expected: MappedScore = { home: 0, away: 7, round: '' };
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Private methods', () => {
    describe('isHomeKnockout', () => {
      it('should return true for home KO cases', () => {
        expect(service['isHomeKnockout'](1, 0)).toBe(true);
        expect(service['isHomeKnockout'](3, 0)).toBe(true);
        expect(service['isHomeKnockout'](5, 0)).toBe(true);
      });

      it('should return false for non-home KO cases', () => {
        expect(service['isHomeKnockout'](0, 1)).toBe(false);
        expect(service['isHomeKnockout'](6, 0)).toBe(false);
        expect(service['isHomeKnockout'](1, 1)).toBe(false);
      });
    });

    describe('isAwayKnockout', () => {
      it('should return true for away KO cases', () => {
        expect(service['isAwayKnockout'](0, 1)).toBe(true);
        expect(service['isAwayKnockout'](0, 4)).toBe(true);
        expect(service['isAwayKnockout'](0, 5)).toBe(true);
      });

      it('should return false for non-away KO cases', () => {
        expect(service['isAwayKnockout'](1, 0)).toBe(false);
        expect(service['isAwayKnockout'](0, 6)).toBe(false);
        expect(service['isAwayKnockout'](1, 1)).toBe(false);
      });
    });

    describe('isHomeDecision', () => {
      it('should return true for home decision cases', () => {
        expect(service['isHomeDecision'](6, 0)).toBe(true);
      });

      it('should return false for non-home decision cases', () => {
        expect(service['isHomeDecision'](5, 0)).toBe(false);
        expect(service['isHomeDecision'](6, 1)).toBe(false);
        expect(service['isHomeDecision'](0, 6)).toBe(false);
      });
    });

    describe('isAwayDecision', () => {
      it('should return true for away decision cases', () => {
        expect(service['isAwayDecision'](0, 6)).toBe(true);
      });

      it('should return false for non-away decision cases', () => {
        expect(service['isAwayDecision'](0, 5)).toBe(false);
        expect(service['isAwayDecision'](1, 6)).toBe(false);
        expect(service['isAwayDecision'](6, 0)).toBe(false);
      });
    });

    describe('isDrawDecision', () => {
      it('should return true for draw decision cases', () => {
        expect(service['isDrawDecision'](6, 6)).toBe(true);
      });

      it('should return false for non-draw decision cases', () => {
        expect(service['isDrawDecision'](5, 5)).toBe(false);
        expect(service['isDrawDecision'](6, 0)).toBe(false);
        expect(service['isDrawDecision'](0, 6)).toBe(false);
      });
    });

    describe('createHomeKOScore', () => {
      it('should create correct home KO score', () => {
        const result = service['createHomeKOScore'](3);
        const expected: MappedScore = { home: 1, away: 0, round: '3' };
        expect(result).toEqual(expected);
      });
    });

    describe('createAwayKOScore', () => {
      it('should create correct away KO score', () => {
        const result = service['createAwayKOScore'](4);
        const expected: MappedScore = { home: 0, away: 1, round: '4' };
        expect(result).toEqual(expected);
      });
    });

    describe('createHomeDecisionScore', () => {
      it('should create correct home decision score', () => {
        const result = service['createHomeDecisionScore']();
        const expected: MappedScore = { home: 5, away: 0, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('createAwayDecisionScore', () => {
      it('should create correct away decision score', () => {
        const result = service['createAwayDecisionScore']();
        const expected: MappedScore = { home: 0, away: 5, round: '' };
        expect(result).toEqual(expected);
      });
    });

    describe('createDrawDecisionScore', () => {
      it('should create correct draw decision score', () => {
        const result = service['createDrawDecisionScore']();
        const expected: MappedScore = { home: 5, away: 5, round: '' };
        expect(result).toEqual(expected);
      });
    });


  });
});
