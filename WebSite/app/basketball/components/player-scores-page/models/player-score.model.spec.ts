import { PlayerScore, IPlayerScore } from './player-score.model';
import { ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { OddFlexModel } from '../../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../../shared/constants';

describe('PlayerScore', () => {
  let playerScore: PlayerScore;
  let mockResultDetail: ResultDetail;
  let mockOddFlex: OddFlexModel;

  beforeEach(() => {
    playerScore = new PlayerScore();
    
    mockOddFlex = {
      resourceId: 'test-resource',
      betType: 1,
      betChoice: 'test-choice',
      oddsInfo: 'test-odds',
      info: {
        playerId: 123,
        playerName: 'Test Player',
        teamId: 456,
        isHome: true,
        statistics: [],
        results: []
      }
    } as OddFlexModel;

    mockResultDetail = {
      resourceId: '653123',
      homeValue: '25',
      otherInfo: 'Test info',
      resultSettingData: {
        isHoldResult: false,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false
      },
      resultStatusId: ResultStatusId.TraderConfirm,
      settlementStatusId: SettlementStatusId.Calculated,
      externalScores: [],
      oddFlex: [mockOddFlex]
    } as ResultDetail;
  });

  describe('PlayerScore class', () => {
    it('should implement IPlayerScore interface', () => {
      expect(playerScore).toBeDefined();
      expect(playerScore.teamId).toBeUndefined();
      expect(playerScore.playerId).toBeUndefined();
      expect(playerScore.playerName).toBeUndefined();
      expect(playerScore.key).toBeUndefined();
      expect(playerScore.resourceId).toBeUndefined();
      expect(playerScore.value).toBeUndefined();
      expect(playerScore.otherInfo).toBeUndefined();
      expect(playerScore.checked).toBe(false);
      expect(playerScore.isConfirmed).toBe(false);
      expect(playerScore.isHold).toBe(false);
      expect(playerScore.isCalculated).toBe(false);
      expect(playerScore.isRefunded).toBe(false);
      expect(playerScore.isConfirmedRefund).toBe(false);
      expect(playerScore.isEmpty).toBe(false);
    });

    it('should have correct default values', () => {
      const newPlayerScore = new PlayerScore();
      
      expect(newPlayerScore.checked).toBe(false);
      expect(newPlayerScore.isConfirmed).toBe(false);
      expect(newPlayerScore.isHold).toBe(false);
      expect(newPlayerScore.isCalculated).toBe(false);
      expect(newPlayerScore.isRefunded).toBe(false);
      expect(newPlayerScore.isConfirmedRefund).toBe(false);
      expect(newPlayerScore.isEmpty).toBe(false);
    });
  });

  describe('fromResultDetail', () => {
    it('should create PlayerScore from ResultDetail with basic data', () => {
      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.resourceId).toBe('653123');
      expect(result.value).toBe('25');
      expect(result.otherInfo).toBe('Test info');
      expect(result.playerId).toBe(123);
      expect(result.playerName).toBe('Test Player');
      expect(result.teamId).toBe(456);
      expect(result.key).toBe('points');
    });

    it('should handle empty oddFlex array', () => {
      mockResultDetail.oddFlex = [];
      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.playerId).toBe(0);
      expect(result.playerName).toBe('');
      expect(result.teamId).toBe(0);
    });

    it('should use external score when isConfirmedRefundSdt is true', () => {
      mockResultDetail.resultSettingData.isConfirmedRefundSdt = true;
      mockResultDetail.externalScores = [{
        homeValue: '30',
        awayValue: '20'
      }] as any;

      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.value).toBe('30');
    });

    it('should use homeValue when isConfirmedRefundSdt is false', () => {
      mockResultDetail.resultSettingData.isConfirmedRefundSdt = false;
      mockResultDetail.externalScores = [{
        homeValue: '30',
        awayValue: '20'
      }] as any;

      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.value).toBe('25');
    });

    it('should handle null/undefined homeValue', () => {
      mockResultDetail.homeValue = null as any;
      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.value).toBe('');
    });

    it('should handle undefined otherInfo', () => {
      mockResultDetail.otherInfo = undefined;
      const result = PlayerScore.fromResultDetail(mockResultDetail);

      expect(result.otherInfo).toBe('');
    });
  });

  describe('toResultDetail', () => {
    it('should convert PlayerScore to ResultDetail', () => {
      playerScore.resourceId = '653123';
      playerScore.value = '25';

      const result = PlayerScore.toResultDetail(playerScore);

      expect(result).toBeInstanceOf(ResultDetail);
      expect(result.resourceId).toBe('653123');
      expect(result.homeValue).toBe('25');
    });

    it('should handle empty values', () => {
      playerScore.resourceId = '';
      playerScore.value = '';

      const result = PlayerScore.toResultDetail(playerScore);

      expect(result.resourceId).toBe('');
      expect(result.homeValue).toBe('');
    });
  });

  describe('PlayerScoreBuilder', () => {
    describe('withResourceId', () => {
      it('should set resourceId and determine score type for points', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '653123'
        });

        expect(result.resourceId).toBe('653123');
        expect(result.key).toBe('points');
      });

      it('should determine score type for threePointFG', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '662456'
        });

        expect(result.key).toBe('threePointFG');
      });

      it('should determine score type for rebounds', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '659789'
        });

        expect(result.key).toBe('rebounds');
      });

      it('should determine score type for assists', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '656012'
        });

        expect(result.key).toBe('assists');
      });

      it('should determine score type for blocks', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '665345'
        });

        expect(result.key).toBe('blocks');
      });

      it('should determine score type for steals', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '667678'
        });

        expect(result.key).toBe('steals');
      });

      it('should handle unknown resourceId prefix', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: '999123'
        });

        expect(result.resourceId).toBe('999123');
        expect(result.key).toBeUndefined();
      });

      it('should handle null/undefined resourceId', () => {
        const result = PlayerScore.fromResultDetail({
          ...mockResultDetail,
          resourceId: null as any
        });

        expect(result.resourceId).toBeNull();
        expect(result.key).toBeUndefined();
      });
    });

    describe('withStatusFlags', () => {

      it('should handle refund status', () => {
        mockResultDetail.resultStatusId = ResultStatusId.ManualCompleted;
        mockResultDetail.settlementStatusId = SettlementStatusId.Refund;

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.isRefunded).toBe(true);
      });

      it('should handle confirmed refund status', () => {
        mockResultDetail.resultSettingData.isConfirmedRefund = true;

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.isConfirmedRefund).toBe(true);
      });

      it('should handle confirmed refund SDT status', () => {
        mockResultDetail.resultSettingData.isConfirmedRefundSdt = true;

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.isConfirmedRefund).toBe(true);
      });
    });

    describe('withPlayerInfo', () => {
      it('should extract player info from oddFlex', () => {
        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.playerId).toBe(123);
        expect(result.playerName).toBe('Test Player');
        expect(result.teamId).toBe(456);
      });

      it('should handle invalid playerId', () => {
        mockOddFlex.info.playerId = NaN;
        mockResultDetail.oddFlex = [mockOddFlex];

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.playerId).toBe(0);
      });

      it('should handle invalid teamId', () => {
        mockOddFlex.info.teamId = NaN;
        mockResultDetail.oddFlex = [mockOddFlex];

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.teamId).toBe(0);
      });

      it('should handle null/undefined player info', () => {
        mockOddFlex.info.playerName = null as any;
        mockResultDetail.oddFlex = [mockOddFlex];

        const result = PlayerScore.fromResultDetail(mockResultDetail);

        expect(result.playerName).toBe('');
      });
    });
  });
});
