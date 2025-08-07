import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";
import { EventStatus, ResourceIds } from "../../../../shared/constants";


export class VerifyStateConfirmedHandler extends AbstractHandler {
  public async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch()
    const selectedResources = storage.getSelectedResource() as ResultDetail[];;
    if(matchDetail.isMarkedRefundAll || matchDetail.eventStatus.toLowerCase() == EventStatus.postponed.toLowerCase()) {
      super.handle(storage);
      return;
    }
    
    if(selectedResources.some(item => !item.resultSettingData.isConfirmedRefundSdt && !item.resultSettingData.isConfirmedRefund)){
      storage.error(Language.confirmRefund.refundResultNotConfirmed);
      return;
    }

    if (matchDetail.isSettleDetermined) {
      const allConfirmed = selectedResources.every(item => item.resultSettingData.isConfirmedRefundSdt);
      allConfirmed && this.verifyGoalRecord(storage, selectedResources) && this.verifyStateConfirmed(storage, selectedResources) ? super.handle(storage) : this.showAlert(storage, matchDetail.isSettleDetermined, allConfirmed);
    } else {
      const allConfirmed = selectedResources.every(item => item.resultSettingData.isConfirmedRefund);
      allConfirmed && this.verifyGoalRecord(storage, selectedResources) ? super.handle(storage) : this.showAlert(storage, matchDetail.isSettleDetermined, allConfirmed);
    }
  }

  private verifyStateConfirmed(storage: RefundBaseStorage, selectedResources: ResultDetail[]) {
    const { externalResults } = storage.getMatch();
    const confirmedScores = externalResults.find(item => item.sourceId == 99);
    if (confirmedScores) {
      return selectedResources.every(item => {
        const confirmedScore = confirmedScores.resultDetails.find(r => r.resourceId === item.resourceId);
        return Number(confirmedScore.homeValue) === Number(item.homeValue) && Number(confirmedScore.awayValue) === Number(item.awayValue);
      });
    }
    return false;
  }

  private verifyGoalRecord(storage: RefundBaseStorage, selectedResources: ResultDetail[]) {
    const { matchDetail } = storage.getMatch();
    const { externalResults } = storage.getMatch();
    const confirmedResult = externalResults.find(item => item.sourceId == 99);
    const goalRecordConfirmed = confirmedResult?.resultDetails.find(item => item.resourceId == ResourceIds.goalRecord);
    if (goalRecordConfirmed) {  
      return matchDetail.applyGoalRecord && goalRecordConfirmed.homeValue == matchDetail.goalRecord;
    }
    return true;
  }

  private showAlert(storage: RefundBaseStorage, isSettleDetermined: boolean, allConfirmed: boolean) {
    if (isSettleDetermined) {
      storage.error(Language.confirmRefund.sdtErrorMessage);
    } else {
      storage.error(Language.confirmRefund.refundResultNotConfirmed);
    }
  }
}