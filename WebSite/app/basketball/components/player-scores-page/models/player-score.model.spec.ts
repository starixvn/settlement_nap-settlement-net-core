import { PlayerScore, IPlayerScore } from './player-score.model';
import { ResultDetail, OddFlexModel } from '../../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../../shared/constants';


describe('PlayerScore', () => {
  describe('Constructor', () => {
    it('should create PlayerScore with default values', () => {
      const playerScore = new PlayerScore();

      expect(playerScore.checked).toBe(false);
      expect(playerScore.isConfirmed).toBe(false);
      expect(playerScore.isHold).toBe(false);
      expect(playerScore.isCalculated).toBe(false);
      expect(playerScore.isRefunded).toBe(false);
      expect(playerScore.isConfirmedRefund).toBe(false);
      expect(playerScore.isEmpty).toBe(false);
    });
  });

  describe('fromResultDetail', () => {
    it('should create PlayerScore from ResultDetail with all properties', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.otherInfo = 'Test info';

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.resourceId).toBe('6531');
      expect(playerScore.value).toBe('10');
      expect(playerScore.playerId).toBe(1);
      expect(playerScore.playerName).toBe('Player 1');
      expect(playerScore.teamId).toBe(1);
      expect(playerScore.key).toBe('points');
      expect(playerScore.otherInfo).toBe('Test info');
    });

    it('should map resourceId to correct score type', () => {
      const testCases = [
        { resourceId: '6531', expectedType: 'points' },
        { resourceId: '6621', expectedType: 'threePointFG' },
        { resourceId: '6591', expectedType: 'rebounds' },
        { resourceId: '6561', expectedType: 'assists' },
        { resourceId: '6651', expectedType: 'blocks' },
        { resourceId: '6671', expectedType: 'steals' },
      ];

      testCases.forEach(({ resourceId, expectedType }) => {
        const resultDetail = createMockResultDetail(resourceId, '10', 1, 'Player 1', 1);
        const playerScore = PlayerScore.fromResultDetail(resultDetail);
        expect(playerScore.key).toBe(expectedType);
      });
    });

    it('should handle empty value correctly', () => {
      const resultDetail = createMockResultDetail('6531', '', 1, 'Player 1', 1);

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.value).toBe('');
    });

    it('should handle null/undefined value', () => {
      const resultDetail = createMockResultDetail('6531', null as any, 1, 'Player 1', 1);

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.value).toBe('');
    });

    it('should handle empty oddFlex array', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.oddFlex = [];

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.playerId).toBe(0);
      expect(playerScore.playerName).toBe('');
      expect(playerScore.teamId).toBe(0);
    });

    it('should handle missing otherInfo', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.otherInfo = undefined;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.otherInfo).toBe('');
    });

    it('should set status flags correctly', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
        resultDetail.resultSettingData = {
          isHoldResult: true,
          isConfirmedRefund: false,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        };

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isConfirmed).toBe(true);
      expect(playerScore.isHold).toBe(true);
      expect(playerScore.isConfirmedRefund).toBe(false);
    });
  });

  describe('toResultDetail', () => {
    it('should convert PlayerScore to ResultDetail', () => {
      const playerScore = new PlayerScore();
      playerScore.resourceId = '6531';
      playerScore.value = '10';

      const resultDetail = PlayerScore.toResultDetail(playerScore);

      expect(resultDetail.resourceId).toBe('6531');
      expect(resultDetail.homeValue).toBe('10');
    });

    it('should handle empty value', () => {
      const playerScore = new PlayerScore();
      playerScore.resourceId = '6531';
      playerScore.value = '';

      const resultDetail = PlayerScore.toResultDetail(playerScore);

      expect(resultDetail.resourceId).toBe('6531');
      expect(resultDetail.homeValue).toBe('');
    });
  });

  describe('Builder Pattern Integration', () => {
    it('should support method chaining', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      
      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore).toBeInstanceOf(PlayerScore);
      expect(playerScore.resourceId).toBe('6531');
      expect(playerScore.value).toBe('10');
      expect(playerScore.playerId).toBe(1);
    });

    it('should create complete PlayerScore with all methods', () => {
      const resultDetail = createMockResultDetail('6621', '5', 2, 'Player 2', 2);
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
        resultDetail.resultSettingData = {
          isHoldResult: true,
          isConfirmedRefund: false,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        };
      resultDetail.otherInfo = 'Test info';

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.resourceId).toBe('6621');
      expect(playerScore.value).toBe('5');
      expect(playerScore.key).toBe('threePointFG');
      expect(playerScore.playerId).toBe(2);
      expect(playerScore.playerName).toBe('Player 2');
      expect(playerScore.teamId).toBe(2);
      expect(playerScore.isConfirmed).toBe(true);
      expect(playerScore.isHold).toBe(true);
      expect(playerScore.isConfirmedRefund).toBe(false);
      expect(playerScore.otherInfo).toBe('Test info');
    });
  });

  // Additional unit tests for PlayerScoreBuilder

describe('PlayerScoreBuilder - Additional Tests', () => {
  describe('withResourceId', () => {
    it('should handle unknown resourceId and return undefined score type', () => {
      const resultDetail = createMockResultDetail('999', '10', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.resourceId).toBe('999');
      expect(playerScore.key).toBeUndefined();
    });

    it('should handle null resourceId', () => {
      const resultDetail = createMockResultDetail(null as any, '10', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.resourceId).toBeNull();
      expect(playerScore.key).toBeUndefined();
    });

    it('should handle empty resourceId', () => {
      const resultDetail = createMockResultDetail('', '10', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.resourceId).toBe('');
      expect(playerScore.key).toBeUndefined();
    });

    it('should handle resourceId with only 2 characters', () => {
      const resultDetail = createMockResultDetail('65', '10', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.resourceId).toBe('65');
      expect(playerScore.key).toBeUndefined();
    });
  });

  describe('withValue', () => {
    it('should handle undefined value', () => {
      const resultDetail = createMockResultDetail('6531', undefined as any, 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.value).toBe('');
    });

    it('should handle zero value', () => {
      const resultDetail = createMockResultDetail('6531', '0', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.value).toBe('0');
    });

    it('should handle negative value', () => {
      const resultDetail = createMockResultDetail('6531', '-5', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.value).toBe('-5');
    });

    it('should handle decimal value', () => {
      const resultDetail = createMockResultDetail('6531', '10.5', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.value).toBe('10.5');
    });

    it('should handle whitespace value', () => {
      const resultDetail = createMockResultDetail('6531', '   ', 1, 'Player 1', 1);
      const playerScore = PlayerScore.fromResultDetail(resultDetail);
      
      expect(playerScore.value).toBe('   ');
    });
  });

  describe('withStatusFlags', () => {
    it('should handle resultDetail with null resultSettingData', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultSettingData = null;
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isConfirmed).toBe(true);
      expect(playerScore.isHold).toBe(false);
      expect(playerScore.isConfirmedRefund).toBe(false);
    });

    it('should handle resultDetail with undefined resultSettingData', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultSettingData = undefined;
      resultDetail.resultStatusId = ResultStatusId.AutoCompleted;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isConfirmed).toBe(false);
      expect(playerScore.isCalculated).toBe(true);
      expect(playerScore.isHold).toBe(false);
      expect(playerScore.isConfirmedRefund).toBe(false);
    });

    it('should handle all status flags as true', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
      resultDetail.resultSettingData = {
        isHoldResult: true,
        isConfirmedRefund: true,
        isConfirmedRefundSdt: true,
        isConfirmedRefundMercy: true,
        iconHoldResult: 'hold-icon'
      };

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isConfirmed).toBe(true);
      expect(playerScore.isHold).toBe(true);
      expect(playerScore.isConfirmedRefund).toBe(true);
    });

    it('should handle refunded status', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Refund;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isRefunded).toBe(true);
    });
  });

  describe('withPlayerInfo', () => {
    it('should handle oddFlex with string playerId and teamId', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.oddFlex = [{
        resourceId: '',
        betType: 0,
        betChoice: '',
        oddsInfo: '',
        info: {
          playerId: 123,
          playerName: 'Test Player',
          teamId: 456,
          isHome: true,
          statistics: [],
          results: []
        }
      }];

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.playerId).toBe(123);
      expect(playerScore.playerName).toBe('Test Player');
      expect(playerScore.teamId).toBe(456);
    });

    it('should handle oddFlex with non-numeric playerId and teamId', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.oddFlex = [{
        resourceId: '',
        betType: 0,
        betChoice: '',
        oddsInfo: '',
        info: {
          playerId: 0,
          playerName: 'Test Player',
          teamId: 0,
          isHome: true,
          statistics: [],
          results: []
        }
      }];

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.playerId).toBe(0);
      expect(playerScore.playerName).toBe('Test Player');
      expect(playerScore.teamId).toBe(0);
    });

    it('should handle multiple oddFlex items and use the first one', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.oddFlex = [
        createMockOddFlex(1, 'First Player', 1),
        createMockOddFlex(2, 'Second Player', 2)
      ];

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.playerId).toBe(1);
      expect(playerScore.playerName).toBe('First Player');
      expect(playerScore.teamId).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {

    it('should maintain builder pattern immutability', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      
      const playerScore1 = PlayerScore.fromResultDetail(resultDetail);
      const playerScore2 = PlayerScore.fromResultDetail(resultDetail);

      // Each call should create a new instance
      expect(playerScore1).not.toBe(playerScore2);
      expect(playerScore1.resourceId).toBe(playerScore2.resourceId);
    });
  });

  describe('Resource ID Mapping Coverage', () => {
    it('should map all valid resource IDs correctly', () => {
      const testCases = [
        { resourceId: '6531', expectedType: 'points' },
        { resourceId: '6532', expectedType: 'points' },
        { resourceId: '65399', expectedType: 'points' },
        { resourceId: '6621', expectedType: 'threePointFG' },
        { resourceId: '6622', expectedType: 'threePointFG' },
        { resourceId: '6591', expectedType: 'rebounds' },
        { resourceId: '6592', expectedType: 'rebounds' },
        { resourceId: '6561', expectedType: 'assists' },
        { resourceId: '6562', expectedType: 'assists' },
        { resourceId: '6651', expectedType: 'blocks' },
        { resourceId: '6652', expectedType: 'blocks' },
        { resourceId: '6671', expectedType: 'steals' },
        { resourceId: '6672', expectedType: 'steals' }
      ];

      testCases.forEach(({ resourceId, expectedType }) => {
        const resultDetail = createMockResultDetail(resourceId, '10', 1, 'Player 1', 1);
        const playerScore = PlayerScore.fromResultDetail(resultDetail);
        expect(playerScore.key).toBe(expectedType);
      });
    });
  });

  describe('Status Checker Integration', () => {
    it('should correctly identify calculated status with AutoCompleted', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.AutoCompleted;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isCalculated).toBe(true);
    });

    it('should correctly identify calculated status with manual completion', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Calculated;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isCalculated).toBe(true);
    });

    it('should correctly identify refunded status with RefundSettleDetermined', () => {
      const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.RefundSettleDetermined;

      const playerScore = PlayerScore.fromResultDetail(resultDetail);

      expect(playerScore.isRefunded).toBe(true);
    });
  });
});
});

// Helper functions
function createMockResultDetail(
  resourceId: string,
  homeValue: string,
  playerId: number,
  playerName: string,
  teamId: number
): ResultDetail {
  const resultDetail = new ResultDetail();
  resultDetail.resourceId = resourceId;
  resultDetail.homeValue = homeValue;
  resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
  resultDetail.oddFlex = [createMockOddFlex(playerId, playerName, teamId)];
  return resultDetail;
}

function createMockOddFlex(playerId: any, playerName: any, teamId: any): OddFlexModel {
  const oddFlex: OddFlexModel = {
    resourceId: '',
    betType: 0,
    betChoice: '',
    oddsInfo: '',
    info: {
      playerId: playerId?.toString(),
      playerName: playerName,
      teamId: teamId?.toString(),
      isHome: true,
      statistics: [],
      results: []
    }
  };
  return oddFlex;
}
