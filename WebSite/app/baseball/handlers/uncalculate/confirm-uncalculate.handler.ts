import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";


export class ConfirmUnCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle() {
    this.notifyService.confirm(Language.UncalculationConfirmMessage, () => {
      this.store.getResultChecked().forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
      this.nextHandler.handle();
    });
  }
}