import { inject } from "@angular/core";
import { SettleQuery } from "../../../shared/models/sportsbook-sop";
import { AioService } from "../../../shared/services";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { CalculateStore } from "../../services/calculate/calculate.store";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";

export class CalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);
  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle(): Promise<void> {
    const query = this.createRequestQuery(this.store);
    const result = await this.aioService.push(query);
    if (result.isSuccessful) {
      this.calculateHedgeMatch(query);
    } else {
      this.notifyService.error(result.errMsg);
    }
  }

  private calculateHedgeMatch(query: SettleQuery) {
    const hedgeMatchId = this.store.isApplyHedgeMatch() ? this.store.match().hedgeMatchDetail.matchId
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

  private createRequestQuery(store: CalculateStore) {
    const query = new SettleQuery(
      store.getMatchDetail(),
      store.getResultChecked(),
      store.actionSubmit,
      store.isReSettledTickets(),
      "",
      BaseballApiKeys.Settle,
      store.isLeader()
    );
    query.isDirectly = store.isScoreDirect();
    return query;
  }
}