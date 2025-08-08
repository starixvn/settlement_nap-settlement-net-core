import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { inject } from "@angular/core";
import { RequestService } from "../../../components/sop-refund/services/request.service";
import { LogicService } from "../../../components/sop-refund/services/logic.service";

export class VerifyStatusHandler extends AbstractHandler {
  readonly #requestService = inject(RequestService);
  readonly #logicService = inject(LogicService);
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const actionName = this.#logicService.getActionName();

    const response = await this.#requestService.checkNewStatus(matchDetail.matchId, actionName, matchDetail.isSettleAbandonedMatchIBC);

    if (response.isSuccessful) {
      super.handle(storage);
    } else {
      storage.error(response.errMsg);
    }
  }
}