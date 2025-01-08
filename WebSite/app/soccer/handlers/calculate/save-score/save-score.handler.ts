import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler";
import { RequestService } from "../../../../bet-builder/services";
import { Storage } from "../../../storage/storage.service";
import { Language } from "../../../../shared/language.native";
import { ClosePopupService, MessageBoxService } from "../../../../shared/services";

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
