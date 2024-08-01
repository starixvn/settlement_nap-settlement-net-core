import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { SportType } from "../../../shared/constants";
import { AioService } from "../../../shared/services";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { Store } from "../../services/store.service";

export class ConfirmChangedResultHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(store: Store) {
    if (store.isReSettledTickets()) {
      this.nextHandler.handle(store);
    } else {
      const getResultQuery = {
        matchId: store.getMatchDetail().matchId,
        apikey: BaseballApiKeys.NormalMatch,
        sportType: SportType.baseBall,
      };

      const needConfirm = await this.aioService.verifyChangedSettledTickets(store.getResultChecked(), getResultQuery);
      this.confirmSetReSettle(needConfirm, store );
    }
  }

  private confirmSetReSettle(needConfirm: boolean, store: Store) {
    if (needConfirm) {
      this.notifyService.confirm(Language.recalculateNotification, () => {
        store.setReSettledTickets(true);
      });
    } else {
      this.nextHandler.handle(store);
    }
  }
}