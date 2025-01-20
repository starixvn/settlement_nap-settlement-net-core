import { inject } from "@angular/core";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateAction } from "../../../../shared/constants";

export class UncalculateHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);

  async handle(storage: Storage) {
    storage.setConfirmMessage(Language.UncalculationConfirmMessage);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setConfirmMessage(Language.checkAgainUnSettleConfirmation);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setCalculateAction(CalculateAction.unCalculate);
        super.handle(storage);
      });
    });
  }
}