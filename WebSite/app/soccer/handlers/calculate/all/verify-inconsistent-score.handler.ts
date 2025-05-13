
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import { ResourceIds, ScoreSourceType } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';
import * as _ from 'lodash';
import { inject } from '@angular/core';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { MessageBoxService } from '../../../../shared/services';
import { ExternalResultDetail } from "../../../../shared/models/sportsbook-sop";

export class VerifyInconsistentScoreHandler extends AbstractHandler {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly validSourceTypes = [ScoreSourceType.Sbo, ScoreSourceType.trader];
  private readonly messageBoxService = inject(MessageBoxService);

  async handle(storage: Storage) {
    const { permission, resultDetails } = storage.getMatch();
    const isIgnoreCheckHt = storage.getIsIgnoreCheckHt();
    const externalResultDetails = storage.getExternalResultDetails();

    if (this.isExistsInconsistentResult(resultDetails, isIgnoreCheckHt, externalResultDetails)) {
      if (!permission.isLeader) {
        storage.error(Language.eSports.nonLeader.mismatchedResult);
        return;
      }
      this.confirmInconsistentResult(storage);
      return;
    }

    super.handle(storage);
  }

  private confirmInconsistentResult(storage: Storage) {
    storage.setConfirmMessage(Language.eSports.leader.mismatchedResult);
    this.messageBoxService.confirm(storage.getConfirmMessage(), () => {
      super.handle(storage);
    })
  }

  private isExistsInconsistentResult(resultDetails: ResultDetail[], isIgnoreCheckHt: boolean, externalResultDetails: ExternalResultDetail[]) {
    const checkedResults = isIgnoreCheckHt
      ? this.getCheckedResults(resultDetails).filter(x => x.resourceId !== ResourceIds.halfTime)
      : this.getCheckedResults(resultDetails);

    for (const result of checkedResults) {
      const outsideResults = externalResultDetails.filter(y => y.resourceId === result.resourceId);
      const sourceResults = this.getValidSourceResults(resultDetails, result.resourceId);
      const [valid] = this.verifyScoreGoalService.tryGetValidResult(outsideResults, [...sourceResults, ...checkedResults]);

      if (!valid) {
        return true;
      }
    }

    return false;
  }

  private getCheckedResults(resultDetails: ResultDetail[]) {
    return resultDetails.filter(x => x.checked);
  }

  private getValidSourceResults(resultDetails: ResultDetail[], resourceId: string) {
    return resultDetails.filter(x => x.resourceId === resourceId
      && this.validSourceTypes.includes(x.sourceId)
      && this.verifyScoreGoalService.isValidResult(x));
  }
} 
