import { Storage } from './../../services/storage.service';
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { Language } from "../../../shared/language.native";

export class VerifyScoreSourceHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private verify = inject(VerificationBaseService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: Storage) {
    const selectedResult = storage.getResultChecked();
    if (!this.verify.allMapHaveScreenshotSource(selectedResult)) {
      this.notifyService.error(Language.sop.notScreenshot);
      return;
    }

    if (this.verify.isExistMismatchedScoreScreenshot(selectedResult)) {
      this.notifyService.error(Language.sop.mismatchedScreenshot);
      return;
    }

    if (this.verify.allMapHaveScoreSources(selectedResult)) {
      this.nextHandler.handle(storage);
    } else {
      if (storage.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.insufficientSources, () => this.nextHandler.handle(storage));
      } else {
        this.notifyService.error(Language.eSports.nonLeader.insufficientSources);
      }
    }

  }
}