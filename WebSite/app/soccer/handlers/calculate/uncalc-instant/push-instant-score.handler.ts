import { inject } from "@angular/core";
import { Language } from "../../../../shared/language.native";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";
import { InstantCalculationQuery } from "../../../components/calc/models/query.model";
import { RequestService } from "../../../components/calc/services/request.service";
import { isEmpty } from "lodash";

export class PushInstantScoreHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService)
  #requestService = inject(RequestService);
  #closePopupService = inject(ClosePopupService);
  async handle(storage: Storage) {
    const scoreResult = storage.getInstantScore();
    const { matchDetail} = storage.getMatch();
    const currentScore = `${scoreResult.homeScore}-${scoreResult.awayScore}`;
    const halfTime = scoreResult.isHt ? "(HT)" : "(FT)";
    const goalRecord = isEmpty(scoreResult.goalRecord) ? "" : scoreResult.goalRecord.toUpperCase();
    const message = `${Language.soccer.confirmUnCalcInstant} <b>${currentScore} [${goalRecord}] ${halfTime}</b>`;

    storage.setConfirmMessage(message);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), async () => {
      const query = new InstantCalculationQuery(matchDetail.matchId, scoreResult);
      const result = await this.#requestService.pushInstantScore(query);
      if (result.isSuccessful) {
        this.#closePopupService.closePopup();
      } else {
        storage.error(result.errMsg);
      }
    });
  }
}