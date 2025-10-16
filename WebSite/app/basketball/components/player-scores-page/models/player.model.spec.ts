import { Player } from './player.model';
import { IPlayerScore } from './player-score.model';

describe('Player', () => {
  describe('Interface Structure', () => {
    it('should have correct interface properties', () => {
      const player: Player = {
        playerId: 1,
        playerName: 'Test Player',
        teamId: 1,
        checked: false,
        scores: []
      };

      expect(player.playerId).toBe(1);
      expect(player.playerName).toBe('Test Player');
      expect(player.teamId).toBe(1);
      expect(player.checked).toBe(false);
      expect(player.scores).toEqual([]);
    });

    it('should accept IPlayerScore array for scores', () => {
      const mockScores: IPlayerScore[] = [
        {
          playerId: 1,
          playerName: 'Test Player',
          teamId: 1,
          key: 'points',
          resourceId: '653',
          value: '10',
          otherInfo: '',
          checked: false,
          isConfirmed: false,
          isHold: false,
          isCalculated: false,
          isRefunded: false,
          isConfirmedRefund: false,
          isEmpty: false
        }
      ];

      const player: Player = {
        playerId: 1,
        playerName: 'Test Player',
        teamId: 1,
        checked: true,
        scores: mockScores
      };

      expect(player.scores).toEqual(mockScores);
      expect(player.scores.length).toBe(1);
      expect(player.scores[0].key).toBe('points');
    });

    it('should handle empty scores array', () => {
      const player: Player = {
        playerId: 1,
        playerName: 'Test Player',
        teamId: 1,
        checked: false,
        scores: []
      };

      expect(player.scores).toEqual([]);
      expect(player.scores.length).toBe(0);
    });

    it('should handle multiple scores', () => {
      const mockScores: IPlayerScore[] = [
        {
          playerId: 1,
          playerName: 'Test Player',
          teamId: 1,
          key: 'points',
          resourceId: '653',
          value: '10',
          otherInfo: '',
          checked: false,
          isConfirmed: false,
          isHold: false,
          isCalculated: false,
          isRefunded: false,
          isConfirmedRefund: false,
          isEmpty: false
        },
        {
          playerId: 1,
          playerName: 'Test Player',
          teamId: 1,
          key: 'assists',
          resourceId: '656',
          value: '5',
          otherInfo: '',
          checked: true,
          isConfirmed: false,
          isHold: false,
          isCalculated: false,
          isRefunded: false,
          isConfirmedRefund: false,
          isEmpty: false
        }
      ];

      const player: Player = {
        playerId: 1,
        playerName: 'Test Player',
        teamId: 1,
        checked: false,
        scores: mockScores
      };

      expect(player.scores.length).toBe(2);
      expect(player.scores[0].key).toBe('points');
      expect(player.scores[1].key).toBe('assists');
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for all properties', () => {
      const player: Player = {
        playerId: 123,
        playerName: 'LeBron James',
        teamId: 456,
        checked: true,
        scores: []
      };

      expect(typeof player.playerId).toBe('number');
      expect(typeof player.playerName).toBe('string');
      expect(typeof player.teamId).toBe('number');
      expect(typeof player.checked).toBe('boolean');
      expect(Array.isArray(player.scores)).toBe(true);
    });

    it('should handle zero values correctly', () => {
      const player: Player = {
        playerId: 0,
        playerName: '',
        teamId: 0,
        checked: false,
        scores: []
      };

      expect(player.playerId).toBe(0);
      expect(player.playerName).toBe('');
      expect(player.teamId).toBe(0);
      expect(player.checked).toBe(false);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should represent a basketball player with multiple scores', () => {
      const basketballPlayer: Player = {
        playerId: 1,
        playerName: 'LeBron James',
        teamId: 1,
        checked: false,
        scores: [
          {
            playerId: 1,
            playerName: 'LeBron James',
            teamId: 1,
            key: 'points',
            resourceId: '653',
            value: '25',
            otherInfo: '',
            checked: false,
            isConfirmed: false,
            isHold: false,
            isCalculated: false,
            isRefunded: false,
            isConfirmedRefund: false,
            isEmpty: false
          },
          {
            playerId: 1,
            playerName: 'LeBron James',
            teamId: 1,
            key: 'assists',
            resourceId: '656',
            value: '8',
            otherInfo: '',
            checked: false,
            isConfirmed: false,
            isHold: false,
            isCalculated: false,
            isRefunded: false,
            isConfirmedRefund: false,
            isEmpty: false
          },
          {
            playerId: 1,
            playerName: 'LeBron James',
            teamId: 1,
            key: 'rebounds',
            resourceId: '659',
            value: '7',
            otherInfo: '',
            checked: false,
            isConfirmed: false,
            isHold: false,
            isCalculated: false,
            isRefunded: false,
            isConfirmedRefund: false,
            isEmpty: false
          }
        ]
      };

      expect(basketballPlayer.playerName).toBe('LeBron James');
      expect(basketballPlayer.scores.length).toBe(3);
      expect(basketballPlayer.scores.find(s => s.key === 'points')?.value).toBe('25');
      expect(basketballPlayer.scores.find(s => s.key === 'assists')?.value).toBe('8');
      expect(basketballPlayer.scores.find(s => s.key === 'rebounds')?.value).toBe('7');
    });

    it('should handle player with no scores', () => {
      const playerWithoutScores: Player = {
        playerId: 2,
        playerName: 'Anthony Davis',
        teamId: 1,
        checked: false,
        scores: []
      };

      expect(playerWithoutScores.playerName).toBe('Anthony Davis');
      expect(playerWithoutScores.scores.length).toBe(0);
    });

    it('should handle player with mixed score statuses', () => {
      const playerWithMixedScores: Player = {
        playerId: 3,
        playerName: 'Stephen Curry',
        teamId: 2,
        checked: true,
        scores: [
          {
            playerId: 3,
            playerName: 'Stephen Curry',
            teamId: 2,
            key: 'points',
            resourceId: '653',
            value: '30',
            otherInfo: '',
            checked: true,
            isConfirmed: true,
            isHold: false,
            isCalculated: true,
            isRefunded: false,
            isConfirmedRefund: false,
            isEmpty: false
          },
          {
            playerId: 3,
            playerName: 'Stephen Curry',
            teamId: 2,
            key: 'threePointFG',
            resourceId: '662',
            value: '6',
            otherInfo: '',
            checked: false,
            isConfirmed: false,
            isHold: true,
            isCalculated: false,
            isRefunded: false,
            isConfirmedRefund: false,
            isEmpty: false
          }
        ]
      };

      expect(playerWithMixedScores.checked).toBe(true);
      expect(playerWithMixedScores.scores[0].checked).toBe(true);
      expect(playerWithMixedScores.scores[0].isConfirmed).toBe(true);
      expect(playerWithMixedScores.scores[1].checked).toBe(false);
      expect(playerWithMixedScores.scores[1].isHold).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long player names', () => {
      const longName = 'A'.repeat(100);
      const player: Player = {
        playerId: 1,
        playerName: longName,
        teamId: 1,
        checked: false,
        scores: []
      };

      expect(player.playerName).toBe(longName);
      expect(player.playerName.length).toBe(100);
    });

    it('should handle negative playerId and teamId', () => {
      const player: Player = {
        playerId: -1,
        playerName: 'Test Player',
        teamId: -1,
        checked: false,
        scores: []
      };

      expect(player.playerId).toBe(-1);
      expect(player.teamId).toBe(-1);
    });

    it('should handle very large numbers', () => {
      const player: Player = {
        playerId: Number.MAX_SAFE_INTEGER,
        playerName: 'Test Player',
        teamId: Number.MAX_SAFE_INTEGER,
        checked: false,
        scores: []
      };

      expect(player.playerId).toBe(Number.MAX_SAFE_INTEGER);
      expect(player.teamId).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
