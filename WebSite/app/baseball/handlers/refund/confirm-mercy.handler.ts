import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";

export class ConfirmMercyHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isMercy()) {
      this.notifyService.confirm(Language.confirmRefund.mercyConfirm, () => this.nextHandler.handle(storage));
    } else {
      this.nextHandler.handle(storage);
    }
  }

  // private confirmMercy(storage: Storage) {
  //   const hedgeMatchId = storage.getApplyingHedgeMatch() ? storage.getMatch().hedgeMatchDetail.matchId
  //     : 0;

  //   if (hedgeMatchId > 0) {
  //     query.matchId = hedgeMatchId;
  //     query.isHedgeMatch = true;
  //     this.#aioService.push(query).then(() => {
  //       this.#notifyService.closePopup();
  //     });
  //   } else {
  //     this.#notifyService.closePopup();
  //   }
  // }
}