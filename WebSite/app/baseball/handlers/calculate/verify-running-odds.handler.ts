import { isNil } from "lodash";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { AioService } from "../../../shared/services";
import { inject } from "@angular/core";
import { CalculateAction } from "../../../shared/constants";
import { Store } from "../../services/store.service";

export class VerifyRunningOddsHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(store: Store) {
    const selectedResourceIds = store.getResultChecked().map(item => item.resourceId);
    const errorMessage = await this.aioService.checkingNoRunningOdds(store.getMatchDetail().matchId,
            selectedResourceIds, CalculateAction.calculate);
    if (!isNil(errorMessage)) {
      this.notifyService.error(errorMessage);
    } else {
      this.nextHandler.handle(store);
    }
}
}