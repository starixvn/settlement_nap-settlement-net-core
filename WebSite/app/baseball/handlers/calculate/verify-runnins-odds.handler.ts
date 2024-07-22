import { isNil } from "lodash";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { AioService } from "../../../shared/services";
import { inject } from "@angular/core";
import { CalculateAction } from "../../../shared/constants";

export class VerifyRunningOddsHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle() {
    const selectedResourceIds = this.store.getResultChecked().map(item => item.resourceId);
    const errorMessage = await this.aioService.checkingNoRunningOdds(this.store.getMatchDetail().matchId,
            selectedResourceIds, CalculateAction.calculate);
    if (!isNil(errorMessage)) {
      this.notifyService.error(errorMessage);
    } else {
      this.nextHandler.handle();
    }
}
}