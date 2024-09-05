import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";
import { BaseHandler } from "../base.handler.native";
import { NotifyService } from "../../services/notify.service";
import { ResultCheckerService } from "../../../shared/services/result-checker.service";
import { Language } from "../../../shared/language.native";

export class ConfirmRefundHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);
  private resultsChecker = inject(ResultCheckerService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }
  
  handle(storage: Storage): void {
    if(this.resultsChecker.isResultsConfirmRefund(storage.getResultChecked())) {
      this.nextHandler.handle(storage);
      return;
    }
    this.notifyService.error(Language.confirmRefund.refundResultNotConfirmed);
  }

}