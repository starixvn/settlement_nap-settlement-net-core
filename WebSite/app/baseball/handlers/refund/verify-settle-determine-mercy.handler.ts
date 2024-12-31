import { IRefundStorage } from './../../services/refund/refund.storage';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";

export class VerifySettleDetermineAndMercyHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: IRefundStorage) {
    if (storage.isMercy() && storage.isSdtSettle()) {
      this.notifyService.error(Language.sop.inning.SdtAndMercySelected);
    } else {
      this.nextHandler.handle(storage);
    }
  }
}