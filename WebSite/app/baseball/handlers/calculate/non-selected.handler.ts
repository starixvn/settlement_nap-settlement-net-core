import { Storage } from './../../services/storage.service';
import { isEmpty } from "lodash";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";

export class NonSelectedHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    if (isEmpty(storage.getResultChecked())) {
      this.notifyService.error(Language.sop.inning.NonSelectedResult);
    } else {
      this.nextHandler.handle(storage);
    }
}
}