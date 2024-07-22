import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResourceIds } from "../constants/resource-id.constant";
import { ResultRowStateService } from "../services/result-row-state.service";

export class ResultState {
  isFinalScoreDisabled: boolean;
  isOutSideSourceDisabled: boolean;
  isConfirmed: boolean;
  finalScoreClass: string;
  invalidHomeScore: boolean;
  invalidAwayScore: boolean;
  isFullTimeRow: boolean;
  isExtraInningRow: boolean;
  isInningRow: boolean;
  canSettleResult: boolean;
  isCheckBoxDisabled: boolean;

  constructor(service: ResultRowStateService, resultDetail: ResultDetail){
    this.isFinalScoreDisabled = service.isFinalScoreDisabled(resultDetail);
    this.isOutSideSourceDisabled = service.isFinalScoreDisabled(resultDetail, true);
    this.isConfirmed = service.isConfirmed(resultDetail);
    this.finalScoreClass = service.finalScoreClass(resultDetail);
    this.invalidHomeScore = service.invalidScore(resultDetail);
    this.invalidAwayScore = service.invalidScore(resultDetail, false);
    this.isFullTimeRow = resultDetail.resourceId === ResourceIds.fullTime;
    this.isExtraInningRow = resultDetail.resourceId === ResourceIds.extraInning;
    this.isInningRow = !this.isFullTimeRow && !this.isExtraInningRow;
    this.canSettleResult = service.canSettleResult(resultDetail);
    this.isCheckBoxDisabled = service.isCheckBoxDisabled(resultDetail);
  }
} 