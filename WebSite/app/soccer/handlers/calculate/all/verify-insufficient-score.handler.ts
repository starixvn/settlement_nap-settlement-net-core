import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { inject } from "@angular/core";
import { MessageBoxService } from "../../../../shared/services";
import { ResourceIds } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";

export class VerifyInsufficientScoreHandler extends AbstractHandler {
  readonly #verificationService = inject(VerificationBaseService);
  readonly #messageBoxService = inject(MessageBoxService);
  
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

