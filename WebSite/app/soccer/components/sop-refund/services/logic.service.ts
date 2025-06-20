import { inject, Injectable } from "@angular/core";
import { CalculateAction } from "../../../../shared/constants/calculate-action.native";
import { ResourceIds } from "../../../constants/resourceIds.native";
import { RefundStorage } from "../../../storage/refund.storage";
import { MessageBoxService } from "../../../../shared/services";
import { EventStatus, SettlementStatusId } from "../../../../shared/constants";
import { MatchDetail } from "../../refund/model/match.model";

import * as _ from "lodash";

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

  resetScore() {
    const halfTimeResult = this.#refundStorage.getHalfTimeResult();
    const fullTimeResult = this.#refundStorage.getFullTimeResult();

    if (halfTimeResult.settlementStatusId !== SettlementStatusId.Calculated && halfTimeResult.settlementStatusId !== SettlementStatusId.Abandoned1H) {
      halfTimeResult.homeValue = "";
      halfTimeResult.awayValue = "";
    }

    if (fullTimeResult.settlementStatusId !== SettlementStatusId.Calculated && fullTimeResult.settlementStatusId !== SettlementStatusId.Abandoned2H) {
      fullTimeResult.homeValue = "";
      fullTimeResult.awayValue = "";
    }
  }
}