import { TestBed } from '@angular/core/testing';
import { PlayerScoresService } from './player-scores.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { Player, PlayerScore, playerScoreType } from './models';
import { Match } from '../../models';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';

describe('PlayerScoresService', () => {
  let service: PlayerScoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerScoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapMatchToPlayerScores', () => {

    it('should handle empty result details', () => {
      // Arrange
      const mockMatch = createMockMatchWithEmptyResults();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should handle external results correctly', () => {
      // Arrange
      const mockMatch = createMockMatchWithExternalResults();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].scores.filter(score => score !== null).length).toBe(1);
    });

    it('should create full score array with all score types', () => {
      // Arrange
      const mockMatch = createMockMatchWithAllScoreTypes();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result[0].scores.length).toBe(6);
      expect(result[0].scores.filter(score => score !== null).length).toBe(6);
    });

    it('should handle null externalResults', () => {
      // Arrange
      const mockMatch = createMockMatchWithNullExternalResults();
      
      // Act & Assert - This should throw an error or handle gracefully
      expect(() => service.mapMatchToPlayerScores(mockMatch)).toThrow();
    });

    it('should handle undefined externalResults', () => {
      // Arrange
      const mockMatch = {
        matchDetail: {} as any,
        resultDetails: [
          createMockResultDetail('6531', '10', 1, 'Player 1', 100)
        ],
        externalResults: undefined as any
      } as Match;
      
      // Act & Assert - This should throw an error or handle gracefully
      expect(() => service.mapMatchToPlayerScores(mockMatch)).toThrow();
    });

    it('should handle empty externalResults array', () => {
      // Arrange
      const mockMatch = {
        matchDetail: {} as any,
        resultDetails: [
          createMockResultDetail('6531', '10', 1, 'Player 1', 100)
        ],
        externalResults: []
      } as Match;
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should filter external results by resourceId', () => {
      // Arrange
      const mockMatch = {
        matchDetail: {} as any,
        resultDetails: [
          createMockResultDetail('6531', '10', 1, 'Player 1', 100)
        ],
        externalResults: [
          {
            resultDetails: [
              createMockResultDetail('6531', '15', 1, 'Player 1', 100), // Matching resourceId
              createMockResultDetail('6532', '20', 2, 'Player 2', 200)  // Non-matching resourceId
            ]
          }
        ]
      } as any;
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should handle external results with no matching resourceId', () => {
      // Arrange
      const mockMatch = {
        matchDetail: {} as any,
        resultDetails: [
          createMockResultDetail('6531', '10', 1, 'Player 1', 100)
        ],
        externalResults: [
          {
            resultDetails: [
              createMockResultDetail('9999', '20', 1, 'Player 1', 100) // Different resourceId
            ]
          }
        ]
      } as any;
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('should handle multiple external result sources', () => {
      // Arrange
      const mockMatch = {
        matchDetail: {} as any,
        resultDetails: [
          createMockResultDetail('6531', '10', 1, 'Player 1', 100)
        ],
        externalResults: [
          {
            resultDetails: [
              createMockResultDetail('6531', '15', 1, 'Player 1', 100)
            ]
          },
          {
            resultDetails: [
              createMockResultDetail('6531', '20', 1, 'Player 1', 100)
            ]
          }
        ]
      } as any;
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('updatePlayers', () => {
    it('should update player scores when playerId matches', () => {
      // Arrange
      const players = createMockPlayers();
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const updatedPlayer = result.find(p => p.playerId === playerId);
      expect(updatedPlayer?.scores.every(score => score?.checked === true || score === null)).toBe(true);
    });

    it('should not update other players', () => {
      // Arrange
      const players = createMockPlayers();
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const otherPlayer = result.find(p => p.playerId === 2);
      expect(otherPlayer?.scores.every(score => score?.checked === false || score === null)).toBe(true);
    });

    it('should handle non-existent playerId', () => {
      // Arrange
      const players = createMockPlayers();
      const playerId = 999;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      expect(result).toEqual(players); // No changes
    });

    it('should set checked to false when unchecked', () => {
      // Arrange
      const players = createMockPlayersWithCheckedScores();
      const playerId = 1;
      const checked = false;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const updatedPlayer = result.find(p => p.playerId === playerId);
      expect(updatedPlayer?.scores.every(score => score?.checked === false || score === null)).toBe(true);
    });

    it('should handle empty players array', () => {
      // Arrange
      const players: Player[] = [];
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should preserve player properties other than scores', () => {
      // Arrange
      const players = createMockPlayers();
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const updatedPlayer = result.find(p => p.playerId === playerId);
      expect(updatedPlayer?.playerName).toBe('Player 1');
      expect(updatedPlayer?.teamId).toBe(100);
      expect(updatedPlayer?.checked).toBe(false); // Player level checked should not change
    });

    it('should handle players with all null scores', () => {
      // Arrange
      const players = createMockPlayersWithAllNullScores();
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const updatedPlayer = result.find(p => p.playerId === playerId);
      expect(updatedPlayer?.scores.every(score => score === null)).toBe(true);
    });

    it('should not mutate original players array', () => {
      // Arrange
      const players = createMockPlayers();
      const playersCopy = JSON.parse(JSON.stringify(players));
      const playerId = 1;
      const checked = true;
      
      // Act
      service.updatePlayers(players, playerId, checked);
      
      // Assert
      expect(players).toEqual(playersCopy);
    });

    it('should handle multiple players with mixed checked states', () => {
      // Arrange
      const players = createMockPlayersWithMixedCheckedScores();
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      const updatedPlayer = result.find(p => p.playerId === playerId);
      expect(updatedPlayer?.scores.filter(score => score !== null).every(score => score.checked)).toBe(true);
      const otherPlayer = result.find(p => p.playerId === 2);
      expect(otherPlayer?.scores.find(score => score?.checked === true)).toBeDefined(); // Original checked state preserved
    });

    it('should handle player with single score', () => {
      // Arrange
      const players: Player[] = [{
        playerId: 1,
        playerName: 'Player 1',
        teamId: 100,
        checked: false,
        scores: [
          createMockPlayerScore('points', 1),
          null,
          null,
          null,
          null,
          null
        ]
      }];
      const playerId = 1;
      const checked = true;
      
      // Act
      const result = service.updatePlayers(players, playerId, checked);
      
      // Assert
      expect(result[0].scores[0]?.checked).toBe(true);
    });
  });

  describe('getCheckedScoresForPlayer', () => {
    it('should return checked scores for specific player', () => {
      // Arrange
      const players = createMockPlayersWithCheckedScores();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result.length).toBe(2); // 2 checked scores
      expect(result.every(score => score.checked)).toBe(true);
      expect(result.every(score => score.playerId === 1)).toBe(true);
    });

    it('should return empty array when no checked scores', () => {
      // Arrange
      const players = createMockPlayers();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for non-existent player', () => {
      // Arrange
      const players = createMockPlayers();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 999);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should filter out null scores', () => {
      // Arrange
      const players = createMockPlayersWithNullScores();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result.every(score => score !== null)).toBe(true);
    });

    it('should return empty array for empty players array', () => {
      // Arrange
      const players: Player[] = [];
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should return only checked scores from multiple players', () => {
      // Arrange
      const players = createMockPlayersWithMixedCheckedScores();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result.length).toBe(1); // Only 1 checked score for player 1
      expect(result[0].playerId).toBe(1);
      expect(result[0].checked).toBe(true);
    });

    it('should handle players with all null scores', () => {
      // Arrange
      const players = createMockPlayersWithAllNullScores();
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should return only scores for specified player when multiple players exist', () => {
      // Arrange
      const players = [
        {
          playerId: 1,
          playerName: 'Player 1',
          teamId: 100,
          checked: false,
          scores: [
            { ...createMockPlayerScore('points', 1), checked: true },
            { ...createMockPlayerScore('assists', 1), checked: true },
            null,
            null,
            null,
            null
          ]
        },
        {
          playerId: 2,
          playerName: 'Player 2',
          teamId: 200,
          checked: false,
          scores: [
            { ...createMockPlayerScore('points', 2), checked: true },
            null,
            null,
            null,
            null,
            null
          ]
        }
      ];
      
      // Act
      const result = service.getCheckedScoresForPlayer(players, 1);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result.every(score => score.playerId === 1)).toBe(true);
      expect(result.every(score => score.checked)).toBe(true);
    });
  });

  describe('getCheckedScoresForAllPlayers', () => {
    it('should return all checked scores from all players', () => {
      // Arrange
      const players = createMockPlayersWithMixedCheckedScores();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result.length).toBe(2); // 2 checked scores total
      expect(result.every(score => score.checked)).toBe(true);
    });

    it('should return empty array when no checked scores', () => {
      // Arrange
      const players = createMockPlayers();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for empty players array', () => {
      // Arrange
      const players: Player[] = [];
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should filter out null scores', () => {
      // Arrange
      const players = createMockPlayersWithNullScores();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result.length).toBe(1);
      expect(result.every(score => score !== null && score.checked)).toBe(true);
    });

    it('should handle players with all null scores', () => {
      // Arrange
      const players = createMockPlayersWithAllNullScores();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should return checked scores from multiple players', () => {
      // Arrange
      const players = [
        {
          playerId: 1,
          playerName: 'Player 1',
          teamId: 100,
          checked: false,
          scores: [
            { ...createMockPlayerScore('points', 1), checked: true },
            { ...createMockPlayerScore('assists', 1), checked: false },
            null,
            null,
            null,
            null
          ]
        },
        {
          playerId: 2,
          playerName: 'Player 2',
          teamId: 200,
          checked: false,
          scores: [
            { ...createMockPlayerScore('points', 2), checked: true },
            { ...createMockPlayerScore('assists', 2), checked: true },
            null,
            null,
            null,
            null
          ]
        }
      ];
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result.length).toBe(3); // 1 from player 1, 2 from player 2
      expect(result.filter(score => score.playerId === 1).length).toBe(1);
      expect(result.filter(score => score.playerId === 2).length).toBe(2);
      expect(result.every(score => score.checked)).toBe(true);
    });

    it('should handle players with some checked and some unchecked scores', () => {
      // Arrange
      const players = createMockPlayersWithCheckedScores();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result.every(score => score.checked)).toBe(true);
    });

    it('should return empty array when all scores are unchecked', () => {
      // Arrange
      const players = createMockPlayers();
      
      // Act
      const result = service.getCheckedScoresForAllPlayers(players);
      
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('groupPlayerScoresByPlayer', () => {
    it('should group scores by playerId', () => {
      // Arrange
      const playerScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('assists', 1),
        createMockPlayerScore('points', 2)
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result.length).toBe(2); // 2 players
      expect(result[0].playerId).toBe(1);
      expect(result[0].scores.length).toBe(6); // Full score array
      expect(result[1].playerId).toBe(2);
    });

    it('should handle empty playerScores array', () => {
      // Arrange
      const playerScores: PlayerScore[] = [];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should create full score array with nulls for missing score types', () => {
      // Arrange
      const playerScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('assists', 1)
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result[0].scores.length).toBe(6);
      expect(result[0].scores.filter(score => score !== null).length).toBe(2);
      expect(result[0].scores.filter(score => score === null).length).toBe(4);
    });

    it('should preserve player information from first score', () => {
      // Arrange
      const playerScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('assists', 1)
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result[0].playerName).toBe('Player 1');
      expect(result[0].teamId).toBe(100);
      expect(result[0].checked).toBe(false);
    });

    it('should handle multiple players with different teamIds', () => {
      // Arrange
      const playerScores = [
        { ...createMockPlayerScore('points', 1), teamId: 100 },
        { ...createMockPlayerScore('points', 2), teamId: 200 }
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result[0].teamId).toBe(100);
      expect(result[1].teamId).toBe(200);
    });

    it('should handle player with all score types', () => {
      // Arrange
      const playerScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('threePointFG', 1),
        createMockPlayerScore('assists', 1),
        createMockPlayerScore('blocks', 1),
        createMockPlayerScore('rebounds', 1),
        createMockPlayerScore('steals', 1)
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result[0].scores.length).toBe(6);
      expect(result[0].scores.every(score => score !== null)).toBe(true);
    });

    it('should handle player with single score type', () => {
      // Arrange
      const playerScores = [
        createMockPlayerScore('points', 1)
      ];
      
      // Act
      const result = (service as any).groupPlayerScoresByPlayer(playerScores);
      
      // Assert
      expect(result[0].scores.length).toBe(6);
      expect(result[0].scores.filter(score => score !== null).length).toBe(1);
      expect(result[0].scores[0]?.key).toBe('points');
    });
  });

  describe('mapResultDetailsToPlayerScores', () => {
    it('should map result details to player scores', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail('6531', '10', 1, 'Player 1', 100),
        createMockResultDetail('6561', '5', 1, 'Player 1', 100)
      ];
      
      // Act
      const result = (service as any).mapResultDetailsToPlayerScores(resultDetails);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result[0].playerId).toBe(1);
      expect(result[0].playerName).toBe('Player 1');
      expect(result[0].key).toBe('points');
      expect(result[1].key).toBe('assists');
    });

    it('should handle empty resultDetails array', () => {
      // Arrange
      const resultDetails: ResultDetail[] = [];
      
      // Act
      const result = (service as any).mapResultDetailsToPlayerScores(resultDetails);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should handle resultDetails with multiple entries for same player', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail('6531', '10', 1, 'Player 1', 100),
        createMockResultDetail('6561', '5', 1, 'Player 1', 100),
        createMockResultDetail('6591', '8', 1, 'Player 1', 100)
      ];
      
      // Act
      const result = (service as any).mapResultDetailsToPlayerScores(resultDetails);
      
      // Assert
      expect(result.length).toBe(3);
      expect(result.every(score => score.playerId === 1)).toBe(true);
    });

    it('should handle resultDetails with different players', () => {
      // Arrange
      const resultDetails = [
        createMockResultDetail('6531', '10', 1, 'Player 1', 100),
        createMockResultDetail('6532', '15', 2, 'Player 2', 200)
      ];
      
      // Act
      const result = (service as any).mapResultDetailsToPlayerScores(resultDetails);
      
      // Assert
      expect(result.length).toBe(2);
      expect(result[0].playerId).toBe(1);
      expect(result[1].playerId).toBe(2);
    });
  });

  describe('createFullScoreArray', () => {
    it('should create full score array with all score types', () => {
      // Arrange
      const existingScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('assists', 1)
      ];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result.length).toBe(6);
      expect(result[0]).not.toBeNull(); // points
      expect(result[1]).toBeNull(); // threePointFG
      expect(result[2]).not.toBeNull(); // assists
      expect(result[3]).toBeNull(); // blocks
      expect(result[4]).toBeNull(); // rebounds
      expect(result[5]).toBeNull(); // steals
    });

    it('should handle empty existingScores array', () => {
      // Arrange
      const existingScores: PlayerScore[] = [];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result.length).toBe(6);
      expect(result.every(score => score === null)).toBe(true);
    });

    it('should maintain correct order of score types', () => {
      // Arrange
      const existingScores = [
        createMockPlayerScore('steals', 1),
        createMockPlayerScore('points', 1),
        createMockPlayerScore('rebounds', 1)
      ];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result[0]?.key).toBe('points');
      expect(result[1]).toBeNull(); // threePointFG
      expect(result[2]).toBeNull(); // assists
      expect(result[3]).toBeNull(); // blocks
      expect(result[4]?.key).toBe('rebounds');
      expect(result[5]?.key).toBe('steals');
    });

    it('should handle all score types present', () => {
      // Arrange
      const existingScores = [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('threePointFG', 1),
        createMockPlayerScore('assists', 1),
        createMockPlayerScore('blocks', 1),
        createMockPlayerScore('rebounds', 1),
        createMockPlayerScore('steals', 1)
      ];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result.length).toBe(6);
      expect(result.every(score => score !== null)).toBe(true);
      expect(result[0]?.key).toBe('points');
      expect(result[1]?.key).toBe('threePointFG');
      expect(result[2]?.key).toBe('assists');
      expect(result[3]?.key).toBe('blocks');
      expect(result[4]?.key).toBe('rebounds');
      expect(result[5]?.key).toBe('steals');
    });

    it('should handle duplicate score types (should use first occurrence)', () => {
      // Arrange
      const existingScores = [
        createMockPlayerScore('points', 1),
        { ...createMockPlayerScore('points', 1), value: '20' } // Duplicate with different value
      ];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result.length).toBe(6);
      const pointsIndex = result.findIndex(score => score?.key === 'points');
      expect(pointsIndex).toBe(0);
      expect(result[pointsIndex]?.value).toBe('10'); // First occurrence
    });

    it('should handle single score type', () => {
      // Arrange
      const existingScores = [
        createMockPlayerScore('points', 1)
      ];
      
      // Act
      const result = (service as any).createFullScoreArray(existingScores);
      
      // Assert
      expect(result.length).toBe(6);
      expect(result[0]?.key).toBe('points');
      expect(result.slice(1).every(score => score === null)).toBe(true);
    });
  });
});

// Helper functions
function createMockMatch(): Match {
  return {
    matchDetail: {
      matchId: 123,
      homeName: 'Team A',
      awayName: 'Team B',
      homeId: 100,
      awayId: 200
    } as any,
    resultDetails: [
      createMockResultDetail('6531', '10', 1, 'Player 1', 100),
      createMockResultDetail('6561', '5', 1, 'Player 1', 100),
      createMockResultDetail('6532', '15', 2, 'Player 2', 200),
      createMockResultDetail('6562', '8', 2, 'Player 2', 200)
    ]
  } as Match;
}

function createMockMatchWithEmptyResults(): Match {
  return {
    matchDetail: {} as any,
    resultDetails: []
  } as Match;
}

function createMockMatchWithMultipleScoresForSamePlayer(): Match {
  return {
    matchDetail: {} as any,
    resultDetails: [
      createMockResultDetail('6531', '10', 1, 'Player 1', 100),
      createMockResultDetail('6561', '5', 1, 'Player 1', 100),
      createMockResultDetail('6591', '8', 1, 'Player 1', 100)
    ]
  } as Match;
}

function createMockPlayers(): Player[] {
  return [
    {
      playerId: 1,
      playerName: 'Player 1',
      teamId: 100,
      checked: false,
      scores: [
        createMockPlayerScore('points', 1),
        createMockPlayerScore('assists', 1),
        null,
        null,
        null,
        null
      ]
    },
    {
      playerId: 2,
      playerName: 'Player 2',
      teamId: 200,
      checked: false,
      scores: [
        createMockPlayerScore('points', 2),
        null,
        null,
        null,
        null,
        null
      ]
    }
  ];
}

function createMockPlayersWithCheckedScores(): Player[] {
  return [
    {
      playerId: 1,
      playerName: 'Player 1',
      teamId: 100,
      checked: false,
      scores: [
        { ...createMockPlayerScore('points', 1), checked: true },
        { ...createMockPlayerScore('assists', 1), checked: true },
        null,
        null,
        null,
        null
      ]
    }
  ];
}

function createMockPlayersWithNullScores(): Player[] {
  return [
    {
      playerId: 1,
      playerName: 'Player 1',
      teamId: 100,
      checked: false,
      scores: [
        { ...createMockPlayerScore('points', 1), checked: true },
        null,
        null,
        null,
        null,
        null
      ]
    }
  ];
}

function createMockPlayerScore(key: playerScoreType, playerId: number): PlayerScore {
  return {
    playerId,
    playerName: `Player ${playerId}`,
    teamId: playerId * 100,
    key,
    resourceId: `65${key === 'points' ? '3' : key === 'assists' ? '6' : '9'}${playerId}`,
    value: '10',
    otherInfo: '',
    checked: false,
    isConfirmed: false,
    isHold: false,
    isCalculated: false,
    isRefunded: false,
    isConfirmedRefund: false,
    isEmpty: false
  };
}

function createMockResultDetail(resourceId: string, value: string, playerId: number, playerName: string, teamId: number): ResultDetail {
  const resultDetail = new ResultDetail();
  resultDetail.resourceId = resourceId;
  resultDetail.homeValue = value;
  resultDetail.resultStatusId = ResultStatusId.RunningZero;
  resultDetail.settlementStatusId = SettlementStatusId.Running;
  resultDetail.oddFlex = [{
    resourceId: resourceId,
    betType: 0,
    betChoice: '',
    oddsInfo: '',
    info: {
      playerId: playerId,
      playerName: playerName,
      teamId: teamId,
      isHome: true,
      statistics: [],
      results: []
    }
  }];
  resultDetail.resultSettingData = {
    isHoldResult: false,
    isConfirmedRefund: false,
    isConfirmedRefundSdt: false,
    isConfirmedRefundMercy: false,
    iconHoldResult: ''
  };
  return resultDetail;
}

function createMockMatchWithExternalResults(): Match {
  return {
    matchDetail: {} as any,
    resultDetails: [
      createMockResultDetail('6531', '10', 1, 'Player 1', 100)
    ],
    externalResults: [
      {
        resultDetails: [
          createMockResultDetail('6531', '15', 1, 'Player 1', 100)
        ]
      }
      ]
  } as any;
}

function createMockMatchWithNullExternalResults(): Match {
  return {
    matchDetail: {} as any,
    resultDetails: [
      createMockResultDetail('6531', '10', 1, 'Player 1', 100)
    ],
    externalResults: null as any
  } as any;
}

function createMockMatchWithAllScoreTypes(): Match {
  return {
    matchDetail: {} as any,
    resultDetails: [
      createMockResultDetail('6531', '10', 1, 'Player 1', 100), // points
      createMockResultDetail('6621', '3', 1, 'Player 1', 100),  // threePointFG
      createMockResultDetail('6561', '5', 1, 'Player 1', 100), // assists
      createMockResultDetail('6651', '2', 1, 'Player 1', 100),  // blocks
      createMockResultDetail('6591', '8', 1, 'Player 1', 100), // rebounds
      createMockResultDetail('6671', '1', 1, 'Player 1', 100)  // steals
    ],
    externalResults: []
  } as any;
}

function createMockPlayersWithMixedCheckedScores(): Player[] {
  return [
    {
      playerId: 1,
      playerName: 'Player 1',
      teamId: 100,
      checked: false,
      scores: [
        { ...createMockPlayerScore('points', 1), checked: true },
        createMockPlayerScore('assists', 1),
        null,
        null,
        null,
        null
      ]
    },
    {
      playerId: 2,
      playerName: 'Player 2',
      teamId: 200,
      checked: false,
      scores: [
        { ...createMockPlayerScore('points', 2), checked: true },
        null,
        null,
        null,
        null,
        null
      ]
    }
  ];
}

function createMockPlayersWithAllNullScores(): Player[] {
  return [
    {
      playerId: 1,
      playerName: 'Player 1',
      teamId: 100,
      checked: false,
      scores: [null, null, null, null, null, null]
    }
  ];
}