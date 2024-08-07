import { inject } from "@angular/core";
import { SettleQuery } from "../../../shared/models/sportsbook-sop";
import { AioService } from "../../../shared/services";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { Storage } from "../../services/storage.service";
import { CalculateAction, ResourceIds } from "../../../shared/constants";

export class CalculateHandler implements BaseHandler {
  #nextHandler: BaseHandler;
  #aioService = inject(AioService);
  #notifyService = inject(NotifyService);;
  setNextHandler(handler: BaseHandler) {
    this.#nextHandler = handler;
  }

  async handle(storage: Storage): Promise<void> {
    const query = this.createRequestQuery(storage);
    const result = await this.#aioService.push(query);
    if (result.isSuccessful) {
      this.calculateHedgeMatch(query, storage);
    } else {
      this.#notifyService.error(result.errMsg);
    }
  }

  private calculateHedgeMatch(query: SettleQuery, storage: Storage) {
    const hedgeMatchId = storage.getApplyingHedgeMatch() ? storage.getMatch().hedgeMatchDetail.matchId
      : 0;

    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      query.isHedgeMatch = true;
      this.#aioService.push(query).then(() => {
        this.#notifyService.closePopup();
      });
    } else {
      this.#notifyService.closePopup();
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
    query.determinedType = this.generateDeterminedType(storage);
    return query;
  }

  private generateDeterminedType(storage: Storage) {
    if (storage.getActionSubmit() !== CalculateAction.calculate) {
      return 0;
    }
    const roundBitStartAt = 2;
    const bitArray = new Array<number>(12).fill(0);
    const resultWithoutFinal = storage.getResultChecked()
      .filter(resultDetail => resultDetail.resourceId !== ResourceIds.extraInning
        && resultDetail.resourceId !== ResourceIds.fullTime);

    resultWithoutFinal.forEach(resultDetail => {
      let bitPosition = Number(resultDetail.resourceId.slice(-2)) + roundBitStartAt;
      bitArray[bitPosition] = 1;
    });

    const reversedBitArray = bitArray.toReversed();
    return parseInt(reversedBitArray.join(''), 2);
  }
}