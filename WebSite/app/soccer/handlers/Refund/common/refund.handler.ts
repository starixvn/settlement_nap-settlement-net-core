import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { RefundQuery } from "../../../components/sop-refund/models/query.model";
import { inject } from "@angular/core";
import { RequestService } from "../../../components/sop-refund/services/request.service";
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { CalculateAction } from "../../../../shared/constants";
import { includes } from "lodash";

export class RefundHandler extends AbstractHandler {
  #requestService = inject(RequestService);
  #logicService = inject(LogicService);

  async handle(storage: RefundBaseStorage): Promise<void> {
    const match= storage.getMatch();
    const actionName = this.#logicService.getActionName();
    const hedgeMatch = match.matchDetail.applyHedgeMatch ? match.hedgeMatchDetail : null;
    const isDeterminedHedgeMatch = storage.getIsDeterminedHedgeMatch();
    const query = new RefundQuery(match.matchDetail, hedgeMatch,
      actionName, match.betDaq, match.betFair, isDeterminedHedgeMatch);
    const result = await this.#requestService.refundMatch(query);
    if (result.isSuccessful) {
      await this.alertMessageToLetsTalkForFastMarket(match.matchDetail.matchId, actionName);
      this.#logicService.closePopup();
    } else {
      storage.error(result.errMsg);
    }
  }

  private async alertMessageToLetsTalkForFastMarket(matchId: number, actionName: string) {
    if(includes([CalculateAction.refundFullTime, CalculateAction.refund], actionName)) {
        await this.#requestService.alertMessageToLetstalkForFastMarket(matchId, actionName);
    }
}
}