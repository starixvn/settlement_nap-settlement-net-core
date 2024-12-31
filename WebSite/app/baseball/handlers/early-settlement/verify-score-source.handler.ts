import { Storage } from './../../services/storage.service';
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { VerificationResultsService } from '../../services/verify-results.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { InputType } from '../../constants/input-type.constant';

export class VerifyScoreSourceHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly verify = inject(VerificationResultsService);
  private readonly notifyService = inject(NotifyService);

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

    if (this.allResultsHaveSource(selectedResult)) {
      this.nextHandler.handle(storage);
    } else if (storage.isLeader()) {
      this.notifyService.confirm(Language.eSports.leader.insufficientSources, () => this.nextHandler.handle(storage));
    } else {
      this.notifyService.error(Language.eSports.nonLeader.insufficientSources);
    }
  }

  private allResultsHaveSource(selectedResults: ResultDetail[]): boolean {
    return selectedResults.every(result => this.verify.isExistScoreSources(result, [InputType.coupleScore].includes(result.inputType)));
  }
}