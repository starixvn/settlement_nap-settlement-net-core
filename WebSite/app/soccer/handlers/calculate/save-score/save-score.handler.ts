import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";
import { RequestService } from "../../../components/calc/services/request.service";

export class SaveScoreHandler extends AbstractHandler {
  #requestService = inject(RequestService);
  #messageBoxService = inject(MessageBoxService);
  #closePopupService = inject(ClosePopupService);
  handle(storage: Storage) {
    storage.setConfirmMessage(Language.SaveTraderScore);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      // this.#requestService.saveScore(storage.getMatch().id).subscribe(() => {
        this.#closePopupService.closePopup();        
      // }
      });
    }
  }
