import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { Language } from '../../../../shared/language.native';
import { MessageBoxService } from '../../../../shared/services';

export class ConfirmHalfTimeHandler extends AbstractHandler {
   readonly #verifyActionService = inject(VerifyActionService);
    readonly #messageBoxService = inject(MessageBoxService);

  public async handle(storage: Storage): Promise<void> {
    const {matchDetail} = storage.getMatch();
    const needConfirm = await this.#verifyActionService.isScoreChangedFirstHalf(matchDetail, storage.getIsResettleTicket());
    if (needConfirm) {
      storage.setConfirmMessage(Language.recalculateNotification)
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setIsResettleTicket(true);
    });
    } else {
      storage.setConfirmMessage(Language.doubleCheckCalculateHalfTime);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setConfirmMessage( Language.checkAgainCalculateHalfTime);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
          super.handle(storage);
        });
      });
    }
  }

  
}