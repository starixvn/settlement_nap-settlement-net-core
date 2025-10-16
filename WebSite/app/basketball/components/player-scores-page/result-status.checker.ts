import { SettlementStatusId } from "../../../shared/constants";
import { ResultStatusId } from "../../../shared/constants/result-status-id.native";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";


export class PlayerScoreStatusChecker {
  static isConfirmed(resultDetail: ResultDetail): boolean {
    return resultDetail.resultStatusId === ResultStatusId.TraderConfirm;
  }

  static isHold(resultDetail: ResultDetail): boolean {
    return resultDetail.resultSettingData?.isHoldResult || false;
  }

  static isCalculated(resultDetail: ResultDetail): boolean {
    return (
      resultDetail.resultStatusId === ResultStatusId.AutoCompleted ||
      this.isManualCalculated(resultDetail)
    );
  }

  static isRefunded(resultDetail: ResultDetail): boolean {
    return (
      resultDetail.resultStatusId === ResultStatusId.ManualCompleted &&
      this.isRefundSettlement(resultDetail)
    );
  }

  static isConfirmedRefund(resultDetail: ResultDetail): boolean {
    return resultDetail.resultSettingData?.isConfirmedRefund || false;
  }

  // Helper methods
  private static isManualCalculated(resultDetail: ResultDetail): boolean {
    return (
      resultDetail.resultStatusId === ResultStatusId.ManualCompleted &&
      resultDetail.settlementStatusId === SettlementStatusId.Calculated
    );
  }

  private static isRefundSettlement(resultDetail: ResultDetail): boolean {
    return (
      resultDetail.settlementStatusId === SettlementStatusId.Refund ||
      resultDetail.settlementStatusId === SettlementStatusId.RefundSettleDetermined
    );
  }
}
