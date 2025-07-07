import { inject, Injectable } from "@angular/core";
import { CalculateAction } from "../../../../shared/constants/calculate-action.native";
import { ResourceIds } from "../../../constants/resourceIds.native";
import { RefundStorage } from "../../../storage/refund.storage";
import { MessageBoxService } from "../../../../shared/services";
import { EventStatus, ScoreSourceType, SettlementStatusId } from "../../../../shared/constants";
import { BetDaq, BetFair, MatchDetail } from "../../refund/model/match.model";

import * as _ from "lodash";
import { Language } from "../../../../shared/language.native";
import { ResultDetail } from "../../../models";
import { ExternalResultDetail } from "../../../../shared/models/sportsbook-sop";

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
    if (hasHT && hasFT) return CalculateAction.refund;
    if (hasHT) return CalculateAction.refundHalfTime;
    if (hasFT) return CalculateAction.refundFullTime;
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
    const resourceConfirmed = externalResults.find(r => r.sourceId == ScoreSourceType.confirmRefundSource);
    resultDetails.forEach(r => {
      if (r.settlementStatusId !== SettlementStatusId.Calculated && r.settlementStatusId !== SettlementStatusId.Abandoned1H) {
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
    const resourceConfirmed = externalResults.find(r => r.sourceId == ScoreSourceType.confirmRefundSource);
    const goalRecordConfirmed = resourceConfirmed?.resultDetails.find(r => r.resourceId == ResourceIds.goalRecord)

    if(goalRecordConfirmed && permission.isLeader) {
      matchDetail.goalRecord = goalRecordConfirmed.homeValue ?? "",
      matchDetail.applyGoalRecord = true;
    }

    const settleDetermined = resultDetails.some(r => r.resultSettingData.isConfirmedRefundSdt);
    matchDetail.isSettleDetermined = settleDetermined;
  }

  settleDetermineUpdate(settleDeterminableTickets: boolean) {
    const halfTime = this.#refundStorage.getHalfTimeResult() as ResultDetail;
    const fullTime = this.#refundStorage.getFullTimeResult() as ResultDetail;

    if (!settleDeterminableTickets) {
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
}