import { inject } from "@angular/core";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { MessageBoxService } from "../../../../shared/services";
import { Language } from "../../../../shared/language.native";

export class ConfirmAllHandler extends AbstractHandler {
  readonly #verifyActionService = inject(VerifyActionService);
  readonly #messageBoxService = inject(MessageBoxService);

  async handle(storage: CalculateBaseStorage): Promise<void> {
    const { matchDetail, childMatches } = storage.getMatch();
    const selectedChildMatches = childMatches.filter((childMatch) => childMatch.checked);
    const needConfirm = await this.#verifyActionService.isScoreChangedAll(matchDetail, storage.getIsResettleTicket(), storage.getHalfTimeResult(), storage.getFullTimeResult());
    if (needConfirm) {
      this.autoCheckedReSettledTickets(storage);
    } else {
      const confirmRefundMessage = selectedChildMatches.length > 0
        ? Language.soccer.confirmAutoRefundChildMatch : "";

      storage.setConfirmMessage(`${Language.doubleCheckCalculateAll}${confirmRefundMessage}`);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setConfirmMessage(Language.checkAgainCalculateAll);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
          super.handle(storage);
        });
      });
    }
  }

  private autoCheckedReSettledTickets(storage: CalculateBaseStorage) {
    storage.setConfirmMessage(Language.recalculateNotification)
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setIsResettleTicket(true);
    });
  }
}