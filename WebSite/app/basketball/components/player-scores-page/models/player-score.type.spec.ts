import { playerScoreType } from './player-score.type';

describe('playerScoreType', () => {
  describe('Type Definition', () => {
    it('should include all required score types', () => {
      const validTypes: playerScoreType[] = [
        'points',
        'threePointFG',
        'rebounds',
        'assists',
        'blocks',
        'steals'
      ];

      validTypes.forEach(type => {
        expect(type).toBeDefined();
        expect(typeof type).toBe('string');
      });
    });

    it('should have exactly 6 score types', () => {
      const allTypes: playerScoreType[] = [
        'points',
        'threePointFG',
        'rebounds',
        'assists',
        'blocks',
        'steals'
      ];

      expect(allTypes.length).toBe(6);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid score types', () => {
      const testCases: { type: playerScoreType; expected: string }[] = [
        { type: 'points', expected: 'points' },
        { type: 'threePointFG', expected: 'threePointFG' },
        { type: 'rebounds', expected: 'rebounds' },
        { type: 'assists', expected: 'assists' },
        { type: 'blocks', expected: 'blocks' },
        { type: 'steals', expected: 'steals' }
      ];

      testCases.forEach(({ type, expected }) => {
        expect(type).toBe(expected);
        expect(typeof type).toBe('string');
      });
    });

    it('should be usable in function parameters', () => {
      function testScoreType(scoreType: playerScoreType): string {
        return scoreType;
      }

      expect(testScoreType('points')).toBe('points');
      expect(testScoreType('assists')).toBe('assists');
      expect(testScoreType('blocks')).toBe('blocks');
    });

    it('should be usable in object properties', () => {
      interface TestInterface {
        scoreType: playerScoreType;
      }

      const testObj: TestInterface = {
        scoreType: 'points'
      };

      expect(testObj.scoreType).toBe('points');
    });
  });

  describe('Usage in Arrays', () => {
    it('should work with arrays of playerScoreType', () => {
      const scoreTypes: playerScoreType[] = [
        'points',
        'assists',
        'rebounds'
      ];

      expect(scoreTypes.length).toBe(3);
      expect(scoreTypes[0]).toBe('points');
      expect(scoreTypes[1]).toBe('assists');
      expect(scoreTypes[2]).toBe('rebounds');
    });

    it('should work with all 6 types in array', () => {
      const allScoreTypes: playerScoreType[] = [
        'points',
        'threePointFG',
        'rebounds',
        'assists',
        'blocks',
        'steals'
      ];

      expect(allScoreTypes.length).toBe(6);
      expect(allScoreTypes).toContain('points');
      expect(allScoreTypes).toContain('threePointFG');
      expect(allScoreTypes).toContain('rebounds');
      expect(allScoreTypes).toContain('assists');
      expect(allScoreTypes).toContain('blocks');
      expect(allScoreTypes).toContain('steals');
    });
  });

  describe('Usage in Switch Statements', () => {
    it('should work in switch statements', () => {
      function getScoreDescription(scoreType: playerScoreType): string {
        switch (scoreType) {
          case 'points':
            return 'Total points scored';
          case 'threePointFG':
            return 'Three-point field goals made';
          case 'rebounds':
            return 'Total rebounds';
          case 'assists':
            return 'Total assists';
          case 'blocks':
            return 'Total blocks';
          case 'steals':
            return 'Total steals';
          default:
            return 'Unknown score type';
        }
      }

      expect(getScoreDescription('points')).toBe('Total points scored');
      expect(getScoreDescription('assists')).toBe('Total assists');
      expect(getScoreDescription('blocks')).toBe('Total blocks');
    });
  });

  describe('Usage in Record Types', () => {
    it('should work with Record type', () => {
      const scoreTypeMapping: Record<playerScoreType, string> = {
        points: 'PTS',
        threePointFG: '3PM',
        rebounds: 'REB',
        assists: 'AST',
        blocks: 'BLK',
        steals: 'STL'
      };

      expect(scoreTypeMapping.points).toBe('PTS');
      expect(scoreTypeMapping.assists).toBe('AST');
      expect(scoreTypeMapping.blocks).toBe('BLK');
    });

    it('should work with partial Record type', () => {
      const partialMapping: Partial<Record<playerScoreType, number>> = {
        points: 25,
        assists: 8,
        rebounds: 7
      };

      expect(partialMapping.points).toBe(25);
      expect(partialMapping.assists).toBe(8);
      expect(partialMapping.rebounds).toBe(7);
      expect(partialMapping.blocks).toBeUndefined();
    });
  });

  describe('Usage in Union Types', () => {
    it('should work with union types', () => {
      type BasketballStat = playerScoreType | 'fouls' | 'turnovers';

      const stat: BasketballStat = 'points';
      expect(stat).toBe('points');

      const otherStat: BasketballStat = 'fouls';
      expect(otherStat).toBe('fouls');
    });
  });

  describe('Type Guards', () => {
    it('should work with type guards', () => {
      function isPlayerScoreType(value: string): value is playerScoreType {
        const validTypes: playerScoreType[] = [
          'points',
          'threePointFG',
          'rebounds',
          'assists',
          'blocks',
          'steals'
        ];
        return validTypes.includes(value as playerScoreType);
      }

      expect(isPlayerScoreType('points')).toBe(true);
      expect(isPlayerScoreType('assists')).toBe(true);
      expect(isPlayerScoreType('invalid')).toBe(false);
      expect(isPlayerScoreType('fouls')).toBe(false);
    });
  });

  describe('Real-world Usage', () => {
    it('should represent basketball statistics correctly', () => {
      const basketballStats: { [K in playerScoreType]: number } = {
        points: 25,
        threePointFG: 3,
        rebounds: 7,
        assists: 8,
        blocks: 2,
        steals: 1
      };

      expect(basketballStats.points).toBe(25);
      expect(basketballStats.threePointFG).toBe(3);
      expect(basketballStats.rebounds).toBe(7);
      expect(basketballStats.assists).toBe(8);
      expect(basketballStats.blocks).toBe(2);
      expect(basketballStats.steals).toBe(1);
    });

    it('should work with filtering operations', () => {
      const allScoreTypes: playerScoreType[] = [
        'points',
        'threePointFG',
        'rebounds',
        'assists',
        'blocks',
        'steals'
      ];

      const offensiveStats = allScoreTypes.filter(type => 
        ['points', 'threePointFG', 'assists'].includes(type)
      );

      expect(offensiveStats).toEqual(['points', 'threePointFG', 'assists']);
    });

    it('should work with mapping operations', () => {
      const scoreTypes: playerScoreType[] = ['points', 'assists', 'rebounds'];

      const descriptions = scoreTypes.map(type => {
        switch (type) {
          case 'points': return 'Points scored';
          case 'assists': return 'Assists made';
          case 'rebounds': return 'Rebounds grabbed';
          default: return 'Other stat';
        }
      });

      expect(descriptions).toEqual([
        'Points scored',
        'Assists made',
        'Rebounds grabbed'
      ]);
    });
  });
});
