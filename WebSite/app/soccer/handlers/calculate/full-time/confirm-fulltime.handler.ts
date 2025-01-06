import { inject } from "@angular/core";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { AbstractHandler } from "../../abstract.handler";
import { CalculateAction } from "../../../../shared/constants";
import { Storage } from "../../../storage/storage.service";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";

export class ConfirmFullTimeHandler extends AbstractHandler {
  #verifyActionService = inject(VerifyActionService);
   #messageBoxService = inject(MessageBoxService);

  public async handle(storage: Storage): Promise<void> {
    const { matchDetail, childMatches } = storage.getMatch();
    const selectedChildMatches = childMatches.filter((childMatch) => childMatch.checked);
    const needConfirm = await this.#verifyActionService.isScoreChangedFullTime(matchDetail, storage.getIsResettleTicket());
    if (needConfirm) {
      this.autoCheckedReSettledTickets(storage);
    } else {
      const confirmRefundMessage = selectedChildMatches.length > 0
        ? Language.soccer.confirmAutoRefundChildMatch : "";

      storage.setConfirmMessage(`${Language.doubleCheckCalculateFullTime}${confirmRefundMessage}`);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setConfirmMessage(Language.checkAgainCalculateFullTime);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
          storage.setCalculateAction(CalculateAction.calculateFullTime);
          super.handle(storage);
        });
      });
    }
  }

  private autoCheckedReSettledTickets(storage: Storage) {
    storage.setConfirmMessage(Language.recalculateNotification)
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setIsResettleTicket(true);
    });
  }
}