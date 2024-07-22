import { inject, Injectable } from "@angular/core";
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResourceIds, ResultStatus, TicketStatusText } from "../../shared/constants";
import { isEmpty, isEqual } from "lodash";
import { CalculateStore } from "./calculate/calculate.store";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";


@Injectable()

export class ResultRowStateService {
  store = inject(CalculateStore);
  verificationService = inject(VerificationBaseService);
  intervalBackgroundPipe = inject(IntervalBackgroundPipe);


  isConfirmed(resultDetail: ResultDetail) {
    if (isEqual(resultDetail.resourceId, ResourceIds.fullTime)) {
      return this.store.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    } else {
      return this.store.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }
  }

  isFinalScoreDisabled(set: ResultDetail, outsideSource = false) {
    return this.store.isLeader || outsideSource ? isEqual(set.resourceId, ResourceIds.fullTime)
      ? !this.store.isScoreDirect() : this.store.isScoreDirect() : true;
  }


  finalScoreClass(resultDetail: ResultDetail) {
    const className = this.verificationService.isFullTimeMismatched(this.store.getResultDetails(), this.store.isScoreDirect(),
      ResourceIds.fullTime, true)
      ? 'col-mismatched ' : '';

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }


  invalidScore(resultDetail: ResultDetail, isHome = true) {
    if (isEqual(resultDetail.resourceId, ResourceIds.extraInning)) {
      return false;
    }

    let disabled = resultDetail.resourceId === ResourceIds.fullTime ? !this.store.isScoreDirect() : this.store.isScoreDirect();

    return this.store.isClickOnCalculate && !disabled && resultDetail.checked && isEmpty(isHome ? resultDetail.homeValue : resultDetail.awayValue);
  }

  canSettleResult(result: ResultDetail) {
    const isRunning = isEqual(result.ticketStatus, TicketStatusText.running)
      || isEqual(result.resultStatus, ResultStatus.noResult) 
      || isEqual(result.resultStatus, ResultStatus.running);

    return isRunning 
        && !result.isScoreMismatched 
        && this.verificationService.isValidTraderConfirmScore(result);
  }

  isCheckBoxDisabled(result: ResultDetail) {
    return isEqual(result.resourceId, ResourceIds.extraInning) ? !this.store.isScoreDirect() : this.store.isScoreDirect();
  }
}