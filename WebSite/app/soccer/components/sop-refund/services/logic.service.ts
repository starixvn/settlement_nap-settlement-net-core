import { inject, Injectable } from "@angular/core";
import { CalculateAction } from "../../../../shared/constants/calculate-action.native";
import { ResourceIds } from "../../../constants/resourceIds.native";
import { RefundStorage } from "../../../storage/refund.storage";
import { MessageBoxService } from "../../../../shared/services";
import {  ScoreSourceType, SettlementStatusId } from "../../../../shared/constants";
import { BetDaq, BetFair, MatchDetail } from "../../sop-refund/models/match.model";

import * as _ from "lodash";
import { Language } from "../../../../shared/language.native";
import { ResultDetail } from "../../../models";
import { BetStatus, RefundType } from "../../../constants";

@Injectable({
  providedIn: 'root'
})
export class LogicService {

  #refundStorage = inject(RefundStorage);
  #messageBoxService = inject(MessageBoxService);

  getActionName(): string {
    const resultDetails = this.#refundStorage.getSelectedResource();
    const hasHT = resultDetails.some(x => x.resourceId === ResourceIds.halfTime);
    const hasFT = resultDetails.some(x => x.resourceId === ResourceIds.fullTime);
    if (hasHT && hasFT) {
      return CalculateAction.refund;
    }
    if (hasHT) {
      return CalculateAction.refundHalfTime;
    }
    if (hasFT) {
      return CalculateAction.refundFullTime;
    }
    return "";
  }

  showConfirmMessage(func: () => void) {
    this.#messageBoxService.confirm(this.#refundStorage.getConfirmMessage(), () => {
      func();
    })
  }

  closePopup() {
    this.#messageBoxService.closePopup();
  }

  closePopupNotChanged() {
    this.#messageBoxService.closePopupNotChanged();
  }

  resetScore() {
    const { resultDetails, externalResults, permission } = this.#refundStorage.getMatch();
    const resourceConfirmed = externalResults.find(r => r.sourceId === ScoreSourceType.confirmRefundSource);
    resultDetails.forEach(r => {
      if (r.settlementStatusId !== SettlementStatusId.Calculated
        && r.settlementStatusId !== SettlementStatusId.Abandoned1H
        && r.settlementStatusId !== SettlementStatusId.Abandoned2H) {
        r.homeValue = "";
        r.awayValue = "";
      }

      if (r.resultSettingData.isConfirmedRefundSdt && permission.isLeader) {
        const correspondingResult = resourceConfirmed?.resultDetails.find(e => e.resourceId === r.resourceId);
        r.homeValue = correspondingResult.homeValue ?? "";
        r.awayValue = correspondingResult.awayValue ?? "";
      }
    });

  }

  autoSelect() {
    const { resultDetails, permission, matchDetail } = this.#refundStorage.getMatch();

    if (permission.isLeader) {
      resultDetails.forEach(r => {
        const isMarkedRefundAll = matchDetail.isMarkedRefundAll && (r.settlementStatusId === SettlementStatusId.Running || r.settlementStatusId === SettlementStatusId.Calculated);
        if (isMarkedRefundAll || r.resultSettingData.isConfirmedRefundSdt || r.resultSettingData.isConfirmedRefund) {
          r.checked = true;
        }
      });

    }
  }

  autoSelectGoalRecordAndSettleDetermined() {
    const { externalResults, permission, matchDetail, resultDetails } = this.#refundStorage.getMatch();
    const resourceConfirmed = externalResults.find(r => r.sourceId === ScoreSourceType.confirmRefundSource);
    const goalRecordConfirmed = resourceConfirmed?.resultDetails.find(r => r.resourceId === ResourceIds.goalRecord)

    if (goalRecordConfirmed && permission.isLeader) {
      matchDetail.goalRecord = goalRecordConfirmed.homeValue ?? "",
        matchDetail.applyGoalRecord = true;
    }

    const settleDetermined = resultDetails.some(r => r.resultSettingData.isConfirmedRefundSdt);
    matchDetail.isSettleDetermined = settleDetermined;
  }

  SaveOriginalScore() {
    const halfTime = this.#refundStorage.getHalfTimeResult();
    const fullTime = this.#refundStorage.getFullTimeResult();
    if (halfTime.settlementStatusId === SettlementStatusId.Abandoned1H) {
      halfTime.originalHomeValue = Number(halfTime.homeValue);
      halfTime.originalAwayValue = Number(halfTime.awayValue);
    }

    if (fullTime.settlementStatusId === SettlementStatusId.Abandoned2H) {
      fullTime.originalHomeValue = Number(fullTime.homeValue);
      fullTime.originalAwayValue = Number(fullTime.awayValue);
    }
  }



  settleDetermineUpdate() {
    const halfTime = this.#refundStorage.getHalfTimeResult() as ResultDetail;
    const fullTime = this.#refundStorage.getFullTimeResult() as ResultDetail;
    const { matchDetail } = this.#refundStorage.getMatch();

    if (!matchDetail.isSettleDetermined) {
      fullTime.isEnabled = false;
      halfTime.isEnabled = false;
      return;
    }

    if (halfTime.checked && fullTime.checked) {
      fullTime.isEnabled = false;
      halfTime.isEnabled = true;
    } else {
      fullTime.isEnabled = fullTime.checked;
      halfTime.isEnabled = false;
    }
  }

  createContentSpecificBetTypes(betDaq: BetDaq, betFair: BetFair) {
    if (betDaq.settleDeterminedBetDaq && betFair.settleDeterminedBetFair) {
      return `${Language.specificBetType.betDaq} and ${Language.specificBetType.betFair}`;
    } else if (betDaq.settleDeterminedBetDaq) {
      return Language.specificBetType.betDaq;
    } else if (betFair.settleDeterminedBetFair) {
      return Language.specificBetType.betFair;
    } else {
      return "";
    }
  }

  getMarkRemainTicket(betTicket: string) {
    return Language.specificBetType.MarkRemainTicket.replace("{0}", betTicket);
  }

  setDisableRefund(matchDetail: MatchDetail): boolean[] {
    const halfTimeStatusId = this.#refundStorage.getHalfTimeResult().settlementStatusId;
    const fullTimeStatusId = this.#refundStorage.getFullTimeResult().settlementStatusId;
    const betStatus = (matchDetail.betStatus ?? "").toLowerCase();

    if (this.isRefundFulltime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
      return [true, false, true];
    } else if (this.isRefundAll(betStatus, halfTimeStatusId, fullTimeStatusId)) {
      return [true, true, false];
    } else if (this.isRefundHalfTime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
      return [false, false, true];
    } else if (this.isRefundHalfTimeAndFullTimeCalculated(betStatus, halfTimeStatusId, fullTimeStatusId)) {
      return [false, true, true];
    } else if (this.isRefundHalftimeFullTime(betStatus, halfTimeStatusId, fullTimeStatusId)) {
      return [false, false, true];
    } else if (matchDetail.isCalculated) {
      return [true, true, true];
    } else {
      return [false, false, false];
    }
  }

  private isRefundFulltime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
    return _.isEqual(halfTimeStatusId, SettlementStatusId.Calculated) &&
      ((_.includes(betStatus, BetStatus.abandoned2H) && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H))
        || (_.includes(betStatus, BetStatus.refundFT) && _.isEqual(fullTimeStatusId, SettlementStatusId.RefundFullTime)));
  }

  private isRefundAll(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
    return (_.includes(betStatus, `${BetStatus.refunded};`) && _.isEqual(halfTimeStatusId, SettlementStatusId.Refund)
      && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund))
      || (_.includes(betStatus, BetStatus.abandoned1H)
        && _.isEqual(halfTimeStatusId, SettlementStatusId.Abandoned1H)
        && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned1H));
  }

  private isRefundHalfTime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
    return _.includes(betStatus, BetStatus.refundHT)
      && _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
      && _.isEqual(fullTimeStatusId, SettlementStatusId.Running);
  }

  private isRefundHalfTimeAndFullTimeCalculated(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
    return _.includes(betStatus, BetStatus.refundHT)
      && _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
      && _.isEqual(fullTimeStatusId, SettlementStatusId.Calculated);
  }

  private isRefundHalftimeFullTime(betStatus: string, halfTimeStatusId: number, fullTimeStatusId: number) {
    return _.includes(betStatus, `${BetStatus.refunded};`) &&
      ((_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime) && _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H))
        || (_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime) && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund)));
  }


  setDisableSubRefundFT(halfTimeStatusId: number, fullTimeStatusId: number) {
    if (this.isRefundAllPos(halfTimeStatusId, fullTimeStatusId)) {
      return RefundType.sdt
    } else if (this.isRefundAllSus(halfTimeStatusId, fullTimeStatusId)) {
      return RefundType.normal;
    } else {
      return "";
    }
  }

  private isRefundAllPos(halfTimeStatusId: number, fullTimeStatusId: number) {
    return (_.isEqual(halfTimeStatusId, SettlementStatusId.Calculated)
      && _.isEqual(fullTimeStatusId, SettlementStatusId.RefundFullTime))
      || (_.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime)
        && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund));
  }

  private isRefundAllSus(halfTimeStatusId: number, fullTimeStatusId: number) {
    return _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned2H) &&
      (_.isEqual(halfTimeStatusId, SettlementStatusId.Calculated)
        || _.isEqual(halfTimeStatusId, SettlementStatusId.RefundHalfTime));
  }

  setDisableSubRefundAll(halfTimeStatusId: number, fullTimeStatusId: number) {
    if (_.isEqual(halfTimeStatusId, SettlementStatusId.Refund) && _.isEqual(fullTimeStatusId, SettlementStatusId.Refund)) {
      return RefundType.sdt;
    } else if (_.isEqual(halfTimeStatusId, SettlementStatusId.Abandoned1H) &&
      _.isEqual(fullTimeStatusId, SettlementStatusId.Abandoned1H)) {
      return RefundType.normal;
    } else {
      return "";
    }
  }
}