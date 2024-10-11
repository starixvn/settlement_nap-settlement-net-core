import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { inject } from "@angular/core";
import { IntervalCalculationService } from "../../../shared/services";
import { ResourceIds } from "../../../shared/constants";
import { ICalculateStorage } from "../../services/calculate/calculate.storage";

export class ConfirmIntervalConsistency implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly intervalCalculationService = inject(IntervalCalculationService);
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: ICalculateStorage) {
    if (
      this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(
        storage.getResultDetails().filter((x) => x.resourceId !== ResourceIds.totalHits),
        ResourceIds.fullTime,
        ResourceIds.extraInning
      )
    ) {
      this.notifyService.confirm(
        Language.intervalsAndMatch.matchNotSelected,
        () => {
          storage.setReSettledTickets(true);
          storage.selectFinalResult();
          storage.selectResult(ResourceIds.extraInning);
        },
        true,
        () => this.nextHandler.handle(storage)
      );
    } else {
      this.nextHandler.handle(storage);
    }
  }
}
