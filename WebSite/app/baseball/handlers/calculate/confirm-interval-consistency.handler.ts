import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { Storage } from "../../services/storage.service";
import { IntervalCalculationService } from "../../../shared/services";
import { ResourceIds } from "../../../shared/constants";

export class ConfirmIntervalConsistency implements BaseHandler {
  private nextHandler: BaseHandler;
  private intervalCalculationService = inject(IntervalCalculationService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: Storage) {
    if (
      this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(
        storage.getResultDetails(),
        ResourceIds.fullTime,
        ResourceIds.extraInning
      )
    ) {
      this.notifyService.confirm(
        Language.intervalsAndMatch.matchNotSelected,
        () => {
          storage.setReSettledTickets(true);
          storage.selectFinalResult();
          this.nextHandler.handle(storage);
        },
        true,
        () => this.nextHandler.handle(storage)
      );
    } else {
      this.nextHandler.handle(storage);
    }
  }
}
