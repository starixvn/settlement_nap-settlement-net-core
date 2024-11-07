import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { Storage } from "../../services/storage.service";
import { CalculateAction, ResultStatusId } from "../../../shared/constants";
import { find } from "lodash";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";


export class ConfirmUnCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private readonly notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: Storage) {
    const message = storage.getActionSubmit() === CalculateAction.earlyUnCalculate ? this.getEarlyConfirmMessage(storage) : Language.UncalculationConfirmMessage
    this.notifyService.confirm(message, () => {
      storage.getResultChecked().forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
      this.nextHandler.handle(storage);
    });
  }

  private getEarlyConfirmMessage(storage: Storage) {
    const isRunningResultStatus = find(storage.getResultChecked(),
      (x: ResultDetail) =>x.resultStatusId === ResultStatusId.RunningZero
              || x.resultStatusId === ResultStatusId.RunningOne
              || x.resultStatusId === ResultStatusId.RunningThree || x.resultStatusId === null);

  return isRunningResultStatus
      ? Language.UnCalculationConfirmMessageEarly2
      : Language.UnCalculationConfirmMessageEarly1;
  }
}