import { PlayerScore, IPlayerScore } from './player-score.model';
import { ResultDetail, OddFlexModel } from '../../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../../shared/constants/settlement-status-id.native';
import { playerScoreType } from './player-score.type';

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

  describe('PlayerScoreBuilder', () => {
    describe('withResourceId', () => {
      it('should set resourceId and map to correct score type', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.withResourceId('6531');

        expect(result).toBe(builder); // Should return builder for chaining
        expect(builder.playerScore.resourceId).toBe('6531');
        expect(builder.playerScore.key).toBe('points');
      });

      it('should handle unknown resourceId', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        builder.withResourceId('9991');

        expect(builder.playerScore.resourceId).toBe('9991');
        expect(builder.playerScore.key).toBeUndefined();
      });

      it('should handle null resourceId', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        builder.withResourceId(null as any);

        expect(builder.playerScore.resourceId).toBeNull();
        expect(builder.playerScore.key).toBeUndefined();
      });
    });

    describe('withValue', () => {
      it('should set value correctly', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        builder.withValue('15');

        expect(builder.playerScore.value).toBe('15');
      });

      it('should handle empty string', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        builder.withValue('');

        expect(builder.playerScore.value).toBe('');
      });

      it('should handle null/undefined value', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        builder.withValue(null as any);

        expect(builder.playerScore.value).toBe('');
      });
    });

    describe('withStatusFlags', () => {
      it('should set all status flags correctly', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
        resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
        resultDetail.resultSettingData = {
          isHoldResult: true,
          isConfirmedRefund: true,
          isConfirmedRefundSdt: false,
          isConfirmedRefundMercy: false,
          iconHoldResult: ''
        };
        resultDetail.otherInfo = 'Test info';

        builder.withStatusFlags(resultDetail);

        expect(builder.playerScore.isConfirmed).toBe(true);
        expect(builder.playerScore.isHold).toBe(true);
        expect(builder.playerScore.isConfirmedRefund).toBe(true);
        expect(builder.playerScore.otherInfo).toBe('Test info');
      });

      it('should handle missing resultSettingData', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
        resultDetail.resultSettingData = undefined;

        builder.withStatusFlags(resultDetail);

        expect(builder.playerScore.isHold).toBe(false);
        expect(builder.playerScore.isConfirmedRefund).toBe(false);
      });

      it('should handle missing otherInfo', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const resultDetail = createMockResultDetail('6531', '10', 1, 'Player 1', 1);
        resultDetail.otherInfo = undefined;

        builder.withStatusFlags(resultDetail);

        expect(builder.playerScore.otherInfo).toBe('');
      });
    });

    describe('withPlayerInfo', () => {
      it('should set player info from oddFlex array', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const oddFlexInfos = [createMockOddFlex(1, 'Player 1', 1)];

        builder.withPlayerInfo(oddFlexInfos);

        expect(builder.playerScore.playerId).toBe(1);
        expect(builder.playerScore.playerName).toBe('Player 1');
        expect(builder.playerScore.teamId).toBe(1);
      });

      it('should handle empty oddFlex array', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();

        builder.withPlayerInfo([]);

        expect(builder.playerScore.playerId).toBe(0);
        expect(builder.playerScore.playerName).toBe('');
        expect(builder.playerScore.teamId).toBe(0);
      });

      it('should handle invalid playerId and teamId', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const oddFlexInfos = [createMockOddFlex('invalid', 'Player 1', 'invalid')];

        builder.withPlayerInfo(oddFlexInfos);

        expect(builder.playerScore.playerId).toBe(0);
        expect(builder.playerScore.playerName).toBe('Player 1');
        expect(builder.playerScore.teamId).toBe(0);
      });

      it('should handle missing playerName', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        const oddFlexInfos = [createMockOddFlex(1, null, 1)];

        builder.withPlayerInfo(oddFlexInfos);

        expect(builder.playerScore.playerId).toBe(1);
        expect(builder.playerScore.playerName).toBe('');
        expect(builder.playerScore.teamId).toBe(1);
      });
    });

    describe('build', () => {
      it('should return PlayerScore instance', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.build();

        expect(result).toBeInstanceOf(PlayerScore);
      });

      it('should return the same instance used in builder', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.build();

        expect(result).toBe(builder.playerScore);
      });
    });

    describe('getScoreTypeFromResourceId', () => {
      it('should map all valid resource IDs to correct score types', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const testCases = [
          { resourceId: '653', expectedType: 'points' },
          { resourceId: '662', expectedType: 'threePointFG' },
          { resourceId: '659', expectedType: 'rebounds' },
          { resourceId: '656', expectedType: 'assists' },
          { resourceId: '665', expectedType: 'blocks' },
          { resourceId: '667', expectedType: 'steals' },
        ];

        testCases.forEach(({ resourceId, expectedType }) => {
          const result = builder.getScoreTypeFromResourceId(resourceId);
          expect(result).toBe(expectedType);
        });
      });

      it('should return undefined for unknown resource ID', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.getScoreTypeFromResourceId('999');

        expect(result).toBeUndefined();
      });

      it('should handle null/undefined resource ID', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.getScoreTypeFromResourceId(null as any);

        expect(result).toBeUndefined();
      });

      it('should handle resource ID with more than 3 characters', () => {
        const builder = new (PlayerScore as any).PlayerScoreBuilder();
        
        const result = builder.getScoreTypeFromResourceId('653123');

        expect(result).toBe('points');
      });
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
