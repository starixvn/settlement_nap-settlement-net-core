import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";
import { RequestService } from "../../../components/calc/services/request.service";
import { Result } from "../../../../shared/models";
import { ScoreSourceType } from "../../../../shared/constants";

export class SaveScoreHandler extends AbstractHandler {
  #requestService = inject(RequestService);
  #messageBoxService = inject(MessageBoxService);
  handle(storage: Storage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const resultSelected = resultDetails.filter((resultDetail) => resultDetail.checked);
    const traderResults = resultDetails.flatMap(r => r.externalScores.filter((resultDetail) => resultDetail.sourceId === ScoreSourceType.trader && resultSelected.some((result) => result.resourceId === resultDetail.resourceId)));

  
    const goalRecord = matchDetail.applyGoalRecord ? matchDetail.goalRecord : "";
    matchDetail.offerLive ? storage.setConfirmMessage(Language.SaveTraderScoreLive) : storage.setConfirmMessage(Language.SaveTraderScore);
    const confirmMessage = {...storage.getConfirmMessage(), requireCheckbox: matchDetail.offerLive, checkboxLabel: Language.SaveTraderScoreLiveCheckboxLabel};
    this.#messageBoxService.confirm(confirmMessage, () => {
      this.#requestService.saveScore(matchDetail, goalRecord, traderResults).then((result: Result) => {
        if (!result.isSuccessful) {
          storage.error(result.errMsg);
        }
      });
    });
  }
}
