import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import * as _ from 'lodash';
import { inject } from '@angular/core';

import { MessageBoxService } from '../../../../shared/services';
import { ExternalResultDetail, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";
import { ResourceIds } from "../../../constants";

export class VerifyInconsistentScoreHandler extends AbstractHandler {
  #verificationService = inject(VerificationBaseService);
  #messageBoxService = inject(MessageBoxService);

  async handle(storage: CalculateBaseStorage) {
    const { permission, resultDetails } = storage.getMatch();
    const isIgnoreCheckHt = storage.getIsIgnoreCheckHt();
    const checkedResults = isIgnoreCheckHt
      ? resultDetails.filter(x => x.checked && x.resourceId !== ResourceIds.halfTime)
      : resultDetails.filter(x => x.checked);

    if (this.#verificationService.isExistMismatchScore(checkedResults)) {
      if (!permission.isLeader) {
        storage.error(Language.eSports.nonLeader.mismatchedScore);
      } else {
        storage.setConfirmMessage(Language.eSports.leader.mismatchedScore);
        this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
          super.handle(storage);
        });
      }
    } else {
      super.handle(storage);
    }
  }

} 
