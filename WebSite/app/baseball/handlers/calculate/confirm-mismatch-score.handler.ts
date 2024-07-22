import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";

export class ConfirmMismatchScoreHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private verify = inject(VerificationBaseService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle() {
    if (this.verify.isExistMismatchScore(this.store.getResultDetails())) {
      if (this.store.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.mismatchedScore, () => this.nextHandler.handle());
      } else {
        this.notifyService.error(Language.eSports.nonLeader.mismatchedScore);
      }
    } else {
      this.nextHandler.handle();
    }
  }
}