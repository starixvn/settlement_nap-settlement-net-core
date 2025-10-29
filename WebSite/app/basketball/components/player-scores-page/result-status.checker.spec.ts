import { PlayerScoreStatusChecker } from './result-status.checker';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';

describe('PlayerScoreStatusChecker', () => {
  describe('isConfirmed', () => {
    it('should return true when resultStatusId is TraderConfirm', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;

      const result = PlayerScoreStatusChecker.isConfirmed(resultDetail);

      expect(result).toBe(true);
    });

    it('should handle undefined resultStatusId', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = undefined as any;

      const result = PlayerScoreStatusChecker.isConfirmed(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('isHold', () => {
    it('should return true when isHoldResult is true', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = {
        isHoldResult: true,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      const result = PlayerScoreStatusChecker.isHold(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when isHoldResult is false', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = {
        isHoldResult: false,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      const result = PlayerScoreStatusChecker.isHold(resultDetail);

      expect(result).toBe(false);
    });

    it('should return false when resultSettingData is undefined', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = undefined;

      const result = PlayerScoreStatusChecker.isHold(resultDetail);

      expect(result).toBe(false);
    });

    it('should return false when resultSettingData is null', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = null as any;

      const result = PlayerScoreStatusChecker.isHold(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('isCalculated', () => {
    it('should return true when resultStatusId is AutoCompleted', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.AutoCompleted;

      const result = PlayerScoreStatusChecker.isCalculated(resultDetail);

      expect(result).toBe(true);
    });

    it('should return true when resultStatusId is ManualCompleted and settlementStatusId is Calculated', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Calculated;

      const result = PlayerScoreStatusChecker.isCalculated(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when resultStatusId is ManualCompleted but settlementStatusId is not Calculated', () => {
      const testCases = [
        SettlementStatusId.Running,
        SettlementStatusId.Refund,
        SettlementStatusId.RefundHalfTime,
        SettlementStatusId.RefundFullTime,
        SettlementStatusId.RefundSettleDetermined,
        SettlementStatusId.Abandoned1H,
        SettlementStatusId.Abandoned2H
      ];

      testCases.forEach(settlementStatusId => {
        const resultDetail = createMockResultDetail();
        resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
        resultDetail.settlementStatusId = settlementStatusId;

        const result = PlayerScoreStatusChecker.isCalculated(resultDetail);

        expect(result).toBe(false);
      });
    });

    it('should return false for other resultStatusIds', () => {
      const testCases = [
        ResultStatusId.RunningZero,
        ResultStatusId.RunningOne,
        ResultStatusId.RunningThree,
        ResultStatusId.TraderConfirm,
        ResultStatusId.Refund,
        ResultStatusId.RefundWithDetermined
      ];

      testCases.forEach(statusId => {
        const resultDetail = createMockResultDetail();
        resultDetail.resultStatusId = statusId;

        const result = PlayerScoreStatusChecker.isCalculated(resultDetail);

        expect(result).toBe(false);
      });
    });

    it('should handle undefined settlementStatusId', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = undefined as any;

      const result = PlayerScoreStatusChecker.isCalculated(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('isRefunded', () => {
    it('should return true when resultStatusId is ManualCompleted and settlementStatusId is Refund', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Refund;

      const result = PlayerScoreStatusChecker.isRefunded(resultDetail);

      expect(result).toBe(true);
    });

    it('should return true when resultStatusId is ManualCompleted and settlementStatusId is RefundSettleDetermined', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.RefundSettleDetermined;

      const result = PlayerScoreStatusChecker.isRefunded(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when resultStatusId is not ManualCompleted', () => {
      const testCases = [
        ResultStatusId.RunningZero,
        ResultStatusId.RunningOne,
        ResultStatusId.RunningThree,
        ResultStatusId.AutoCompleted,
        ResultStatusId.TraderConfirm,
        ResultStatusId.Refund,
        ResultStatusId.RefundWithDetermined
      ];

      testCases.forEach(statusId => {
        const resultDetail = createMockResultDetail();
        resultDetail.resultStatusId = statusId;
        resultDetail.settlementStatusId = SettlementStatusId.Refund;

        const result = PlayerScoreStatusChecker.isRefunded(resultDetail);

        expect(result).toBe(false);
      });
    });

    it('should return false when resultStatusId is ManualCompleted but settlementStatusId is not refund type', () => {
      const testCases = [
        SettlementStatusId.Running,
        SettlementStatusId.RefundHalfTime,
        SettlementStatusId.RefundFullTime,
        SettlementStatusId.Calculated,
        SettlementStatusId.Abandoned1H,
        SettlementStatusId.Abandoned2H
      ];

      testCases.forEach(settlementStatusId => {
        const resultDetail = createMockResultDetail();
        resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
        resultDetail.settlementStatusId = settlementStatusId;

        const result = PlayerScoreStatusChecker.isRefunded(resultDetail);

        expect(result).toBe(false);
      });
    });

    it('should handle undefined settlementStatusId', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = undefined as any;

      const result = PlayerScoreStatusChecker.isRefunded(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('isConfirmedRefund', () => {
    it('should return true when isConfirmedRefund is true', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = {
        isHoldResult: false,
        isConfirmedRefund: true,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      const result = PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);

      expect(result).toBe(true);
    });

    it('should return false when isConfirmedRefund is false', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = {
        isHoldResult: false,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      const result = PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);

      expect(result).toBe(false);
    });

    it('should return false when resultSettingData is undefined', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = undefined;

      const result = PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);

      expect(result).toBe(false);
    });

    it('should return false when resultSettingData is null', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultSettingData = null as any;

      const result = PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);

      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle a fully confirmed result', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
      resultDetail.resultSettingData = {
        isHoldResult: false,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(true);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });

    it('should handle a calculated result', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.AutoCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Calculated;

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(true);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });

    it('should handle a held result', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.RunningZero;
      resultDetail.resultSettingData = {
        isHoldResult: true,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(true);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });

    it('should handle a refunded result', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
      resultDetail.settlementStatusId = SettlementStatusId.Refund;
      resultDetail.resultSettingData = {
        isHoldResult: false,
        isConfirmedRefund: true,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(true);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(true);
    });

    it('should handle a running result', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.RunningZero;
      resultDetail.settlementStatusId = SettlementStatusId.Running;

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle resultDetail with all undefined properties', () => {
      const resultDetail = new ResultDetail();
      resultDetail.resultStatusId = undefined as any;
      resultDetail.settlementStatusId = undefined as any;
      resultDetail.resultSettingData = undefined;

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });

    it('should handle resultDetail with null properties', () => {
      const resultDetail = new ResultDetail();
      resultDetail.resultStatusId = null as any;
      resultDetail.settlementStatusId = null as any;
      resultDetail.resultSettingData = null as any;

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isHold(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isConfirmedRefund(resultDetail)).toBe(false);
    });

    it('should handle invalid enum values', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = 999 as any;
      resultDetail.settlementStatusId = 999 as any;

      expect(PlayerScoreStatusChecker.isConfirmed(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isCalculated(resultDetail)).toBe(false);
      expect(PlayerScoreStatusChecker.isRefunded(resultDetail)).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple status checks efficiently', () => {
      const resultDetail = createMockResultDetail();
      resultDetail.resultStatusId = ResultStatusId.TraderConfirm;
      resultDetail.resultSettingData = {
        isHoldResult: true,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
      };

      const startTime = performance.now();
      
      // Run multiple checks
      for (let i = 0; i < 1000; i++) {
        PlayerScoreStatusChecker.isConfirmed(resultDetail);
        PlayerScoreStatusChecker.isHold(resultDetail);
        PlayerScoreStatusChecker.isCalculated(resultDetail);
        PlayerScoreStatusChecker.isRefunded(resultDetail);
        PlayerScoreStatusChecker.isConfirmedRefund(resultDetail);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 iterations)
      expect(executionTime).toBeLessThan(100);
    });
  });
});

// Helper function
function createMockResultDetail(): ResultDetail {
  const resultDetail = new ResultDetail();
  resultDetail.resourceId = '6531';
  resultDetail.homeValue = '10';
  resultDetail.resultStatusId = ResultStatusId.RunningZero;
  resultDetail.settlementStatusId = SettlementStatusId.Running;
  resultDetail.resultSettingData = {
    isHoldResult: false,
    isConfirmedRefund: false,
    isConfirmedRefundSdt: false,
    isConfirmedRefundMercy: false,
    iconHoldResult: ''
  };
  resultDetail.oddFlex = [];
  return resultDetail;
}
