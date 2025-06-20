import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { inject } from "@angular/core";
import { VerificationBaseService } from "../../../services/verification-base.service";
import { Language } from "../../../../shared/language.native";

export class VerifyScoreHTHandler extends AbstractHandler {
    #verificationBaseService = inject(VerificationBaseService);
    public handle(storage: RefundBaseStorage): void {
      const {matchDetail } = storage.getMatch();
        const halfTime = storage.getHalfTimeResult();
        halfTime.isInvalidValue = this.#verificationBaseService.isEmptyScore(halfTime.homeValue) || this.#verificationBaseService.isEmptyScore(halfTime.awayValue);

        if (halfTime.isInvalidValue) {
          storage.error(Language.warningInputScore);
        } else {
          matchDetail.halfTimeAwayScore = halfTime.awayValue;
          matchDetail.halfTimeHomeScore = halfTime.homeValue;
          super.handle(storage);
        }

    }
}