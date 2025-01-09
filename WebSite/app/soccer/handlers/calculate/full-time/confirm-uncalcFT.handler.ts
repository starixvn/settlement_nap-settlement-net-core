import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { inject } from "@angular/core";
import { MessageBoxService } from "../../../../shared/services";

export class ConfirmUncalcFTHandler extends AbstractHandler {
 #messageBoxService = inject(MessageBoxService);
 
  handle(storage: Storage): void {
    storage.setConfirmMessage(Language.UncalculateFTConfirmMessage);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setConfirmMessage(Language.checkAgainUncalculateFTConfirmation);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        super.handle(storage);
      });
    });
  }
}