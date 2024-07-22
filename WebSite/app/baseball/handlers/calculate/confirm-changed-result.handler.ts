import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { SportType } from "../../../shared/constants";
import { AioService } from "../../../shared/services";
import { CalculateStore } from "../../services/calculate/calculate.store";

export class ConfirmChangedResultHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle() {
    if (this.store.isReSettledTickets()) {
      this.nextHandler.handle();
    } else {
      const getResultQuery = {
        matchId: this.store.getMatchDetail().matchId,
        apikey: BaseballApiKeys.NormalMatch,
        sportType: SportType.baseBall,
      };

      const needConfirm = await this.aioService.verifyChangedSettledTickets(this.store.getResultChecked(), getResultQuery);
      this.confirmSetReSettle(needConfirm);
    }
  }

  private confirmSetReSettle(needConfirm: boolean) {
    if (needConfirm) {
      this.notifyService.confirm(Language.recalculateNotification, () => {
        this.store.setReSettledTickets(true);
      });
    } else {
      this.nextHandler.handle();
    }
  }
}