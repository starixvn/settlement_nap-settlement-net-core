import { AbstractHandler } from "../../abstract.handler.native";

import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { inject } from "@angular/core";
import { VerificationBaseService } from "../../../services/verification-base.service";

export class VerifyGoalRecordHTHandler extends AbstractHandler {
    readonly #verificationBaseService = inject(VerificationBaseService);
    
    public handle(storage: RefundBaseStorage): void {
        const { matchDetail } = storage.getMatch();
        if (this.#verificationBaseService.goalRecordExistSemicolon(matchDetail)) {
            storage.error(Language.soccer.noNeedSemicolonOnGoalRecord);
        } else if (matchDetail.applyGoalRecord && this.#verificationBaseService.isHtGoalRecordInvalid(matchDetail)) {
            storage.error(Language.soccer.halfTimeGoalRecordNotConsistent);
        }else if (matchDetail.isScoreInconsistent) {
            storage.error(Language.soccer.confirmWithInconsistentScore);
        } else {
            super.handle(storage);
        }
    }
}