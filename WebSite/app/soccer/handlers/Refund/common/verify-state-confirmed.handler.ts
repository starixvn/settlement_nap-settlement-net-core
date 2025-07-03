import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";
import { ResourceIds } from "../../../../shared/constants";


export class VerifyStateConfirmedHandler extends AbstractHandler {
  public async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    if(matchDetail.isMarkedRefundAll) {
      super.handle(storage);
      return;
    }

    const selectedResources = storage.getSelectedResource() as ResultDetail[];
    if (matchDetail.isSettleDetermined) {
      const allConfirmed = selectedResources.every(item => item.resultSettingData.isConfirmedRefundSdt);
      allConfirmed && this.verifyGoalRecord(storage, selectedResources) && this.verifyStateConfirmed(storage, selectedResources) ? super.handle(storage) : this.showAlert(storage, matchDetail.isSettleDetermined);
    } else {
      const allConfirmed = selectedResources.every(item => item.resultSettingData.isConfirmedRefund);
      allConfirmed && this.verifyGoalRecord(storage, selectedResources) ? super.handle(storage) : this.showAlert(storage, matchDetail.isSettleDetermined);

    }
  }

  private verifyStateConfirmed(storage: RefundBaseStorage, selectedResources: ResultDetail[]) {
    const { externalResults } = storage.getMatch();
    const confirmedScores = externalResults.find(item => item.sourceId == 99);
    if (confirmedScores) {
      return selectedResources.every(item => {
        const confirmedScore = confirmedScores.resultDetails.find(item => item.resourceId == item.resourceId);
        return confirmedScore && confirmedScore.homeValue == item.homeValue && confirmedScore.awayValue == item.awayValue;
      });
    }
    return false;
  }

  private verifyGoalRecord(storage: RefundBaseStorage, selectedResources: ResultDetail[]) {
    const { matchDetail } = storage.getMatch();
    const { externalResults } = storage.getMatch();
    const confirmedGoalRecord = externalResults.find(item => item.sourceId == 99);
    if (matchDetail.applyGoalRecord && confirmedGoalRecord) {
      const goalRecordConfirmed = confirmedGoalRecord.resultDetails.find(item => item.resourceId == ResourceIds.goalRecord);
      return goalRecordConfirmed && goalRecordConfirmed.homeValue == matchDetail.goalRecord;
    }
    return false;
  }

  private showAlert(storage: RefundBaseStorage, isSettleDetermined: boolean) {
    if (isSettleDetermined) {
      storage.error(Language.confirmRefund.sdtErrorMessage);
    } else {
      storage.error(Language.confirmRefund.refundResultNotConfirmed);
    }
  }
}