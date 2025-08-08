import { inject } from "@angular/core";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";

export class ConfirmFullTimeHandler extends AbstractHandler {
  readonly #verifyActionService = inject(VerifyActionService);
  readonly #messageBoxService = inject(MessageBoxService);

  public async handle(storage: CalculateBaseStorage): Promise<void> {
    const { matchDetail, childMatches } = storage.getMatch();
    const selectedChildMatches = childMatches.filter((childMatch) => childMatch.checked);
    const needConfirm = await this.#verifyActionService.isScoreChangedFullTime(matchDetail, storage.getIsResettleTicket(), storage.getFullTimeResult());
    if (needConfirm) {
      this.autoCheckedReSettledTickets(storage);
      return;
    }
    
    const confirmRefundMessage = selectedChildMatches.length > 0
      ? Language.soccer.confirmAutoRefundChildMatch : "";

      storage.setConfirmMessage(`${Language.doubleCheckCalculateFullTime}${confirmRefundMessage}`);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setConfirmMessage(Language.checkAgainCalculateFullTime);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
          super.handle(storage);
        });
      });
  }

  private autoCheckedReSettledTickets(storage: CalculateBaseStorage) {
    storage.setConfirmMessage(Language.recalculateNotification)
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setIsResettleTicket(true);
    });
  }
}