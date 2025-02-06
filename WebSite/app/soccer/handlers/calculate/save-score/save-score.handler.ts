import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";
import { RequestService } from "../../../components/calc/services/request.service";
import { Result } from "../../../../shared/models";

export class SaveScoreHandler extends AbstractHandler {
  #requestService = inject(RequestService);
  #messageBoxService = inject(MessageBoxService);
  handle(storage: Storage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const selectedResult = resultDetails.filter((result) => result.checked);
    storage.setConfirmMessage(Language.SaveTraderScore);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      this.#requestService.saveScore(matchDetail.matchId, selectedResult).then((result: Result) => {
        if (!result.isSuccessful) {
          storage.error(result.errMsg);
        }
      });
    });
  }
}
