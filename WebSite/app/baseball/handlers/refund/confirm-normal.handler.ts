import * as _ from "lodash";
import { IRefundStorage } from './../../services/refund/refund.storage';
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { AioService } from "../../../shared/services";

export class ConfirmNormalHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    const match = storage.getMatch();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const selectedResources = storage.getResultChecked();
    const resourceIds = _.join(selectedResources.map(item => item.resourceId), ',');
    const resultConfirmed = _.find(selectedResources, item => item.resultSettingData.isConfirmedRefund);

    if (_.isNil(resultConfirmed) && storage.isMercy() && storage.isSdtSettle()) {
      this.#aioService.changeConfirmResultSetting(
          Language.confirmRefund.confirmRefund,
          match.matchDetail.matchId, 
          resourceIds, 
          true,
          hedgeMatch,
          null,
          selectedResources);
  } else {
      this.nextHandler.handle(storage);
    }
  }
}