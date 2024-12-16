import { isEmpty, isEqual, includes } from "lodash";
import { Language } from "../../../shared/language.native";
import { ResourceIds } from "../../../shared/constants";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { SettlementStatusId } from '../../../shared/constants';
import { ICalculateStorage } from "../../services/calculate/calculate.storage";

export class MercyValidateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: ICalculateStorage) {
    const resultDetails = storage.getInningsExcludeExtraAndTotalHits();
    const mercyIndex = resultDetails.findIndex(item=> !isEmpty(item.otherInfo) && isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
    if (mercyIndex === -1) {
      this.nextHandler.handle(storage);
      return;
    }
    
    const resultDetailAfter = resultDetails.slice(mercyIndex + 1);
    const resultSelectedOrCalculated = resultDetailAfter.some(item =>item.checked || item.settlementStatusId === SettlementStatusId.Calculated);
    if (storage.isLeader() && resultSelectedOrCalculated) {
      this.notifyService.confirm(Language.mercy.invalidIntervalsConfirm, () => this.nextHandler.handle(storage));
      return;
    } 

    if (resultSelectedOrCalculated) {
      this.notifyService.error(Language.mercy.invalidIntervals);
    } else {
      this.nextHandler.handle(storage);
    }
  }

}