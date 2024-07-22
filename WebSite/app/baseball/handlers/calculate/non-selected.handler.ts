import { isEmpty } from "lodash";
import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class NonSelectedHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle() {
    if (isEmpty(this.store.getResultChecked())) {
      this.notifyService.error(Language.sop.inning.NonSelectedResult);
    } else {
      this.nextHandler.handle();
    }
}
}