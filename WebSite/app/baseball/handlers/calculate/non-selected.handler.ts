import { Store } from './../../services/store.service';
import { isEmpty } from "lodash";
import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class NonSelectedHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(store: Store) {
    if (isEmpty(store.getResultChecked())) {
      this.notifyService.error(Language.sop.inning.NonSelectedResult);
    } else {
      this.nextHandler.handle(store);
    }
}
}