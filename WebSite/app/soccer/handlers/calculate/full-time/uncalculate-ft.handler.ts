import { inject } from "@angular/core";
import { ClosePopupService } from "../../../../shared/services";
import { AbstractHandler } from "../../abstract.handler.native";
import { UncalculateFullTimeQuery } from "../../../components/calc/models/query.model";
import { RequestService } from "../../../components/calc/services/request.service";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ResultStatusId } from "../../../../shared/constants";

export class UncalculateFTHandler extends AbstractHandler {
  #closePopupService = inject(ClosePopupService);
  #requestService = inject(RequestService);

  async handle(storage: CalculateBaseStorage): Promise<void> {
    const { matchDetail, resultDetails, hedgeMatchDetail } = storage.getMatch();
    const checkedResultDetails = resultDetails.filter(x => x.checked);
    const hedgeMatchId = storage.isApplyHedgeMatch() ? hedgeMatchDetail.matchId : 0;
    const query = new UncalculateFullTimeQuery(matchDetail, checkedResultDetails, hedgeMatchId);
    const result = await this.#requestService.unCalculateFt(query);
    if (result.isSuccessful) {
      this.#closePopupService.closePopup();
    } else {
      storage.error(result.errMsg);
    }
  }
}
