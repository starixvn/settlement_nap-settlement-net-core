import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { AioService } from "../../../shared/services";
import { ResourceItem } from '../../../shared/models';
import * as _ from "lodash";

export class RefundHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  #aioService = inject(AioService);
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isSdtSettle()) {
      this.confirmRefundSdt(storage);
    } else if(storage.isMercy()) {
      console.log("Handle Mercy");
    }
    else {
      this.nextHandler.handle(storage);
    }
  }

  confirmRefundSdt(storage: IRefundStorage) {
    const match = storage.getMatch();
    const selectedResources = storage.getResultChecked();
    const hedgeMatch = storage.getApplyingHedgeMatch() ? match.hedgeMatchDetail : null;
    const resourceItems = selectedResources.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
    this.#aioService.changeConfirmResultSDTSetting(match.matchDetail.matchId, resourceItems, true, hedgeMatch, false);
  }
}