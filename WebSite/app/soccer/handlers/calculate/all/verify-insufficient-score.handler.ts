import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { inject } from "@angular/core";
import { MessageBoxService } from "../../../../shared/services";
import { ResourceIds, ScoreSourceType } from "../../../../shared/constants";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { Language } from "../../../../shared/language.native";

export class VerifyInsufficientScoreHandler extends AbstractHandler {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly validSourceTypes = [ScoreSourceType.Sbo, ScoreSourceType.trader];
  private readonly messageBoxService = inject(MessageBoxService);
  
  async handle(storage: Storage) {
    const { permission, resultDetails } = storage.getMatch();
    const isIgnoreCheckHt = storage.getIsIgnoreCheckHt();

    if (this.isExistsInsufficientResult(resultDetails, isIgnoreCheckHt)) {
      if (!permission.isLeader) {
        storage.error(Language.eSports.nonLeader.insufficientSources);
        return;
      }
      this.confirmInsufficientResult(storage);
      return;
    }
    super.handle(storage);
  }

  private confirmInsufficientResult(storage: Storage) {
    storage.setConfirmMessage(Language.eSports.leader.insufficientSources);
    this.messageBoxService.confirm(storage.getConfirmMessage(), () => {
      super.handle(storage);
    })
  }

  private isExistsInsufficientResult(resultDetails: ResultDetail[], isIgnoreCheckHt: boolean) {
    const checkedResults = isIgnoreCheckHt
      ? this.getCheckedResults(resultDetails).filter(x => x.resourceId !== ResourceIds.halfTime)
      : this.getCheckedResults(resultDetails);

    for (const result of checkedResults) {
      const sourceResults = this.getValidSourceResults(resultDetails, result.resourceId);

      if (sourceResults.length === 0) {
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

