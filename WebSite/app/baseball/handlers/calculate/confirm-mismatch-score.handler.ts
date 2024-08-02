import { Language } from "../../../shared/language.native";
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";

export class ConfirmMismatchScoreHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private verify = inject(VerificationBaseService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    if (this.verify.isExistMismatchScore(storage.getResultChecked())) {
      if (storage.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.mismatchedScore, () => this.nextHandler.handle(storage));
      } else {
        this.notifyService.error(Language.eSports.nonLeader.mismatchedScore);
      }
    } else {
      this.nextHandler.handle(storage);
    }
  }
}