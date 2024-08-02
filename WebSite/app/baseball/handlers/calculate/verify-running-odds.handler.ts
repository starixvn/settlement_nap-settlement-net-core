import { isNil } from "lodash";
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { AioService } from "../../../shared/services";
import { inject } from "@angular/core";
import { CalculateAction } from "../../../shared/constants";
import { Storage } from "../../services/storage.service";

export class VerifyRunningOddsHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: Storage) {
    const selectedResourceIds = storage.getResultChecked().map(item => item.resourceId);
    const errorMessage = await this.aioService.checkingNoRunningOdds(storage.getMatchDetail().matchId,
            selectedResourceIds, CalculateAction.calculate);
    if (!isNil(errorMessage)) {
      this.notifyService.error(errorMessage);
    } else {
      this.nextHandler.handle(storage);
    }
}
}