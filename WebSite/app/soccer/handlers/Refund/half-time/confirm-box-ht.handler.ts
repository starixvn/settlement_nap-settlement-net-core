import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { inject } from "@angular/core";
import { LogicService } from "../../../components/sop-refund/services/logic.service";

export class ConfirmBoxHTHandler extends AbstractHandler {
  #logicService = inject(LogicService);
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    matchDetail.isSettleAbandonedMatchIBC = false;
    storage.setConfirmMessage(Language.soccer.refundHalfTime);
    this.#logicService.showConfirmMessage(() => {
      super.handle(storage);
    });
  }
}