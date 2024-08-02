import { inject } from "@angular/core";
import { SettleQuery } from "../../../shared/models/sportsbook-sop";
import { AioService } from "../../../shared/services";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { CalculateStorage } from "../../services/calculate/calculate.storage";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { Storage } from "../../services/storage.service";

export class CalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private notifyService = inject(NotifyService);
  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(storage: Storage): Promise<void> {
    const query = this.createRequestQuery(storage);
    const result = await this.aioService.push(query);
    if (result.isSuccessful) {
      this.calculateHedgeMatch(query, storage);
    } else {
      this.notifyService.error(result.errMsg);
    }
  }

  private calculateHedgeMatch(query: SettleQuery, storage: Storage) {
    const hedgeMatchId = storage.getApplyingHedgeMatch() ? storage.getMatch().hedgeMatchDetail.matchId
      : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      query.isHedgeMatch = true;
      this.aioService.push(query).then(() => {
        this.notifyService.closePopup();
      });
    } else {
      this.notifyService.closePopup();
    }
  }

  private createRequestQuery(storage: Storage) {
    const query = new SettleQuery(
      storage.getMatchDetail(),
      storage.getResultChecked(),
      storage.getActionSubmit(),
      storage.isReSettledTickets(),
      "",
      BaseballApiKeys.Settle,
      storage.isLeader()
    );
    query.isDirectly = storage.isScoreDirect();
    return query;
  }
}