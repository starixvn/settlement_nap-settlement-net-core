import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { Language } from "../../../shared/language.native";

export class VerifyScoreSourceHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private verify = inject(VerificationBaseService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle() {
    if (!this.verify.allMapHaveScreenshotSource(this.store.getResultDetails())) {
      this.notifyService.error(Language.sop.notScreenshot);
      return;
    }

    if (this.verify.isExistMismatchedScoreScreenshot(this.store.getResultDetails())) {
      this.notifyService.error(Language.sop.mismatchedScreenshot);
      return;
    }

    if (this.verify.allMapHaveScoreSources(this.store.getResultDetails())) {
      this.nextHandler.handle();
    } else {
      if (this.store.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.insufficientSources, () => this.nextHandler.handle());
      } else {
        this.notifyService.error(Language.eSports.nonLeader.insufficientSources);
      }
    }

  }
}