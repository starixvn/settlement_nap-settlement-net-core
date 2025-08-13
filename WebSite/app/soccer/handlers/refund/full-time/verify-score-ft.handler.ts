import { inject } from "@angular/core";
import { VerificationBaseService } from "../../../services/verification-base.service";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";


export class VerifyScoreFTHandler extends AbstractHandler {
  readonly #verificationBaseService = inject(VerificationBaseService);

  public handle(storage: RefundBaseStorage): void {
    const fullTime = storage.getFullTimeResult();
    const { matchDetail } = storage.getMatch();
    fullTime.isInvalidValue = this.#verificationBaseService.isEmptyScore(fullTime.homeValue) || this.#verificationBaseService.isEmptyScore(fullTime.awayValue);

    if (fullTime.isInvalidValue) {
      storage.error(Language.warningInputScore);
    } else {
      matchDetail.finalHomeScore = fullTime.homeValue;
      matchDetail.finalAwayScore = fullTime.awayValue;
      super.handle(storage);
    }
  }
}