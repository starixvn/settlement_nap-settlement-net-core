import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { inject } from "@angular/core";
import { MessageBoxService } from "../../../../shared/services";
import { ResourceIds, ScoreSourceType } from "../../../../shared/constants";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { Language } from "../../../../shared/language.native";
import { ExternalResult, ExternalResultDetail, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";

export class VerifyInsufficientScoreHandler extends AbstractHandler {
  #verificationService = inject(VerificationBaseService);
  #messageBoxService = inject(MessageBoxService);
  
  async handle(storage: CalculateBaseStorage) {
    const { permission, resultDetails } = storage.getMatch();
    const isIgnoreCheckHt = storage.getIsIgnoreCheckHt();
    const checkedResults = isIgnoreCheckHt
      ? resultDetails.filter(x => x.checked && x.resourceId !== ResourceIds.halfTime)
      : resultDetails.filter(x => x.checked);

    if (this.#verificationService.allMapHaveScoreSources(checkedResults)) {
      super.handle(storage);
    } else if (permission.isLeader) {
      storage.setConfirmMessage(Language.eSports.leader.insufficientSources);
      this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
        super.handle(storage);
      });
    } else {
      storage.error(Language.eSports.nonLeader.insufficientSources);
    }
  }
}

