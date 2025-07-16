import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";

export class SdtVerifyHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const fullTime = storage.getFullTimeResult() as ResultDetail;
    const halfTime = storage.getHalfTimeResult() as ResultDetail;
    const halfTimeIsRunning = halfTime.resultStatusId != ResultStatusId.AutoCompleted && halfTime.resultStatusId != ResultStatusId.ManualCompleted;
    
    if(matchDetail.isSettleDetermined && halfTime.checked && !fullTime.checked) {
      storage.error(Language.confirmRefund.sdtHalfTimeErrorMessage);
      return;
    }

    if(matchDetail.isSettleDetermined && halfTimeIsRunning && !halfTime.checked && fullTime.checked) {
      storage.error(Language.confirmRefund.sdtFullTimeErrorMessage);
      return;
    }

    super.handle(storage);
  }
} 