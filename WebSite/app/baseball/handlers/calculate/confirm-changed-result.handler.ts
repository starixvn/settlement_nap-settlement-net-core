import { Language } from "../../../shared/language.native";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { inject } from "@angular/core";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { SportType } from "../../../shared/constants";
import { AioService } from "../../../shared/services";
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { Storage } from "../../services/storage.service";

export class ConfirmChangedResultHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: Storage) {
    if (storage.isReSettledTickets()) {
      this.nextHandler.handle(storage);
    } else {
      const getResultQuery = {
        matchId: storage.getMatchDetail().matchId,
        apikey: BaseballApiKeys.NormalMatch,
        sportType: SportType.baseBall,
      };

      const needConfirm = await this.aioService.verifyChangedSettledTickets(storage.getResultChecked(), getResultQuery);
      this.confirmSetReSettle(needConfirm, storage );
    }
  }

  private confirmSetReSettle(needConfirm: boolean, storage: Storage) {
    if (needConfirm) {
      this.notifyService.confirm(Language.recalculateNotification, () => {
        storage.setReSettledTickets(true);
      });
    } else {
      this.nextHandler.handle(storage);
    }
  }
}