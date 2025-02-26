import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { inject } from "@angular/core";
import { MessageBoxService } from "../../../../shared/services";
import { ResultStatusId } from "../../../../shared/constants";

export class ConfirmUncalcFTHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);

  handle(storage: Storage): void {
    const halfTimeResult = storage.getHalfTimeResult();
    if (halfTimeResult.resultStatusId !== ResultStatusId.AutoCompleted && halfTimeResult.resultStatusId !== ResultStatusId.ManualCompleted) {
      storage.error(Language.soccer.CannotUncalculateFullTime);
      return;
    }
    storage.setConfirmMessage(Language.UncalculateFTConfirmMessage);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setConfirmMessage(Language.checkAgainUncalculateFTConfirmation);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        super.handle(storage);
      });
    });
  }
}