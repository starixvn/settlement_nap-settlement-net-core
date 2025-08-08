import { inject } from "@angular/core";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";
import { SaveScoreQuery } from "../../../../shared/models/sportsbook-sop";
import { RequestService } from "../../../components/calc/services/request.service";
import { Language } from "../../../../shared/language.native";
import { MessageBoxService } from "../../../../shared/services";

export class SaveOutsideScoreHandler extends AbstractHandler {
    readonly #verificationService = inject(VerificationBaseService);
    readonly #requestService = inject(RequestService);
    readonly #messageBoxService = inject(MessageBoxService);

    async handle(storage: CalculateBaseStorage) {
        const { resultDetails, originalResultDetail, matchDetail } = storage.getMatch();
        const scoresToSave = this.#verificationService.getChangedScores(resultDetails, originalResultDetail);
        const checkedScores = this.#verificationService.getOutsideScores(resultDetails);
        const query: SaveScoreQuery = {
          matchId: matchDetail.matchId,
          scoresToSave,
          checkedScores,
          apiKey: ""
        };
        storage.setConfirmMessage(Language.sop.saveScore);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), async () => {
            const result = await this.#requestService.saveOutsideScore(query);
            if (result.isSuccessful) {
               resultDetails.forEach(x => {
                x.checked = false;
               });
            } else {
                storage.error(result.errMsg);
            }
        });
    }
}