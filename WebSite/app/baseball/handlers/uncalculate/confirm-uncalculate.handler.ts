import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { Store } from "../../services/store.service";
import { CalculateAction, ResultStatusId } from "../../../shared/constants";
import { find } from "lodash";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";


export class ConfirmUnCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(store: Store) {
    const message = store.getActionSubmit() == CalculateAction.earlyUnCalculate ? this.getEarlyConfirmMessage(store) : Language.UncalculationConfirmMessage
    this.notifyService.confirm(message, () => {
      store.getResultChecked().forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
      this.nextHandler.handle(store);
    });
  }

  private getEarlyConfirmMessage(store: Store) {
    const isRunningResultStatus = find(store.getResultChecked(),
      (x: ResultDetail) =>x.resultStatusId === ResultStatusId.RunningZero
              || x.resultStatusId === ResultStatusId.RunningOne
              || x.resultStatusId === ResultStatusId.RunningThree || x.resultStatusId === null);

  return isRunningResultStatus
      ? Language.UnCalculationConfirmMessageEarly2
      : Language.UnCalculationConfirmMessageEarly1;
  }
}