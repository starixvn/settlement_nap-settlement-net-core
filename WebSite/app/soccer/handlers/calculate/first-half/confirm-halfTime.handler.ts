import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { Language } from '../../../../shared/language.native';
import { MessageBoxService } from '../../../../shared/services';
import { SettlementStatusId } from "../../../../shared/constants";

export class ConfirmHalfTimeHandler extends AbstractHandler {
  readonly #verifyActionService = inject(VerifyActionService);
  readonly #messageBoxService = inject(MessageBoxService);

  public async handle(storage: CalculateBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const isFtCalculated = storage.getFullTimeResult().settlementStatusId === SettlementStatusId.Calculated;

    if (!storage.getFullTimeResult().checked && isFtCalculated) {
      storage.error(Language.sop.relatedResultsNotSelected);
      return;
    }

    const needConfirm = await this.#verifyActionService.isScoreChangedFirstHalf(matchDetail, storage.getIsResettleTicket(), storage.getHalfTimeResult());
    if (needConfirm) {
      storage.setConfirmMessage(Language.recalculateNotification)
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        storage.setIsResettleTicket(true);
      });
      return;
    }

    storage.setConfirmMessage(Language.doubleCheckCalculateHalfTime);
    this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
      storage.setConfirmMessage(Language.checkAgainCalculateHalfTime);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        super.handle(storage);
      });
    });
  }
}