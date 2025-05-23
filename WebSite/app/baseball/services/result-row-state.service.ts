import { inject, Injectable } from "@angular/core";
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResourceIds, ResultStatus, TicketStatusText } from "../../shared/constants";
import { isEmpty, isEqual } from "lodash";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import { CalculateStorage } from "./calculate/calculate.storage";


@Injectable()

export class ResultRowStateService {
  storage = inject(CalculateStorage);
  verificationService = inject(VerificationBaseService);
  intervalBackgroundPipe = inject(IntervalBackgroundPipe);


  isConfirmed(resultDetail: ResultDetail) {
    if (isEqual(resultDetail.resourceId, ResourceIds.extraInning)) {
      return this.storage.isLeader() && this.storage.isConfirmed(this.storage.fulltimeResult.resultSettingData);
    } else {
      return this.storage.isLeader() && this.storage.isConfirmed(resultDetail.resultSettingData);
    }
  }

  isFinalScoreDisabled(set: ResultDetail, outsideSource = false) {
    return this.storage.isLeader() || outsideSource ? isEqual(set.resourceId, ResourceIds.fullTime)
      ? !this.storage.isScoreDirect() : this.storage.isScoreDirect() : true;
  }


  finalScoreClass(resultDetail: ResultDetail) {
    const className = this.verificationService.isFullTimeMismatched(
      this.storage.getResultDetails().filter(x => x.resourceId !== ResourceIds.totalHits), 
      this.storage.isScoreDirect(),
      ResourceIds.fullTime, 
      !this.storage.isMatchSeries())
        ? 'col-mismatched ' : '';

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }


  invalidScore(resultDetail: ResultDetail, isHome = true) {
    if (isEqual(resultDetail.resourceId, ResourceIds.extraInning) && (isEmpty(resultDetail.homeValue) === isEmpty(resultDetail.awayValue))) {
      return false;
    }

    const disabled = resultDetail.resourceId === ResourceIds.fullTime ? !this.storage.isScoreDirect() : this.storage.isScoreDirect();

    return this.storage.getIsClickOnCalculate() && !disabled && resultDetail.checked && isEmpty(isHome ? resultDetail.homeValue : resultDetail.awayValue);
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
    return isEqual(result.resourceId, ResourceIds.extraInning) ? !this.storage.isScoreDirect() : this.storage.isScoreDirect();
  }
}