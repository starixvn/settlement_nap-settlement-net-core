import { Store } from './../../services/store.service';
import { CalculateStore } from "../../services/calculate/calculate.store";
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

  async handle(store: Store) {
    const selectedResult = store.getResultChecked();
    if (!this.verify.allMapHaveScreenshotSource(selectedResult)) {
      this.notifyService.error(Language.sop.notScreenshot);
      return;
    }

    if (this.verify.isExistMismatchedScoreScreenshot(selectedResult)) {
      this.notifyService.error(Language.sop.mismatchedScreenshot);
      return;
    }

    if (this.verify.allMapHaveScoreSources(selectedResult)) {
      this.nextHandler.handle(store);
    } else {
      if (store.isLeader()) {
        this.notifyService.confirm(Language.eSports.leader.insufficientSources, () => this.nextHandler.handle(store));
      } else {
        this.notifyService.error(Language.eSports.nonLeader.insufficientSources);
      }
    }

  }
}