import { AbstractHandler } from "../abstract.handler.native";
import { Storage } from "../../storage/storage.service.native";
import { ClosePopupService } from "../../../shared/services";
import { inject } from "@angular/core";
import { RequestService } from "../../components/calc/services/request.service";
import { includes, isEmpty, isEqual } from "lodash";
import { CalculateAction } from "../../../shared/constants";
import { SettleQuery } from "../../components/calc/models/query.model";
import { MatchDetail } from "../../components/calc/models/match.model";
import { ResultDetail } from "../../models";
import { ResourceIds } from "../../constants";


export class CalculateHandler extends AbstractHandler {
  readonly #closePopupService = inject(ClosePopupService);
  readonly #requestService = inject(RequestService);

  public async handle(storage: Storage): Promise<void> {
    const actionName = storage.getCalculateAction();
    const { matchDetail, hedgeMatchDetail, childMatches, resultDetails } = storage.getMatch();
    const selectedChildMatchIds = childMatches.filter(x => x.checked).map(x => x.matchId).join(',');
    const childMatchIds = isEmpty(childMatches) || isEqual(actionName, CalculateAction.calculateHalfTime)
      ? null : (isEmpty(selectedChildMatchIds) ? '0' : selectedChildMatchIds);
    const hedgeMatchId = storage.isApplyHedgeMatch() ? hedgeMatchDetail.matchId : 0;
    this.parseScoreToMatchDetail(matchDetail, resultDetails);
    const query = new SettleQuery(matchDetail, hedgeMatchId, actionName, storage.getIsResettleTicket(), childMatchIds);
    const result = await this.#requestService.calculate(query);
    if (result.isSuccessful) {
      await this.alertMessageToLetsTalkForFastMarket(matchDetail.matchId, actionName);
      this.#closePopupService.closePopup();
    } else {
      storage.error(result.errMsg);
    }
  }

  private async alertMessageToLetsTalkForFastMarket(matchId: number, actionName: string) {
    if (includes([CalculateAction.calculateFullTime, CalculateAction.calculate], actionName)) {
      await this.#requestService.alertMessageToLetstalkForFastMarket(matchId, actionName);
    }
  }

  private parseScoreToMatchDetail(matchDetail: MatchDetail, resultDetails: ResultDetail[]) {
    const selectedResult = resultDetails.filter(r => r.checked);
    selectedResult.forEach(result => {
      if (result.resourceId === ResourceIds.fullTime) {
        matchDetail.finalAwayScore = result.awayValue;
        matchDetail.finalHomeScore = result.homeValue;
      }

      if (result.resourceId === ResourceIds.halfTime) {
        matchDetail.halfTimeAwayScore = result.awayValue;
        matchDetail.halfTimeHomeScore = result.homeValue;
      }
    });
  }
}