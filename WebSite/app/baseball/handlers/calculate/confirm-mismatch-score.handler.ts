import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { Store } from "../../services/store.service";

export class ConfirmMismatchScoreHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private verify = inject(VerificationBaseService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(store: Store) {
    if (this.verify.isExistMismatchScore(store.getResultChecked())) {
      if (store.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.mismatchedScore, () => this.nextHandler.handle(store));
      } else {
        this.notifyService.error(Language.eSports.nonLeader.mismatchedScore);
      }
    } else {
      this.nextHandler.handle(store);
    }
  }
}