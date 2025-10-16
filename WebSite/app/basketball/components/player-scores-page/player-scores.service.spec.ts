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
    it('should map match data to player scores correctly', () => {
      // Arrange
      const mockMatch = createMockMatch();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2); // 2 players
      expect(result[0].playerId).toBe(1);
      expect(result[0].playerName).toBe('Player 1');
      expect(result[0].teamId).toBe(100);
      expect(result[0].checked).toBe(false);
      expect(result[0].scores.length).toBe(6); // All score types
    });

    it('should handle empty result details', () => {
      // Arrange
      const mockMatch = createMockMatchWithEmptyResults();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result).toEqual([]);
    });

    it('should group multiple scores for same player', () => {
      // Arrange
      const mockMatch = createMockMatchWithMultipleScoresForSamePlayer();
      
      // Act
      const result = service.mapMatchToPlayerScores(mockMatch);
      
      // Assert
      expect(result.length).toBe(1); // Only one player
      expect(result[0].scores.filter(score => score !== null).length).toBe(3); // 3 actual scores
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