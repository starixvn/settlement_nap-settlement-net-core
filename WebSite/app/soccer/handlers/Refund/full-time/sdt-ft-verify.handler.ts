import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ResultDetail } from "../../../models";
import { ResultStatusId } from "../../../../shared/constants";

export class SdtFtVerifyHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const halfTime = storage.getHalfTimeResult() as ResultDetail;
    const halfTimeIsRunning = halfTime.resultStatusId != ResultStatusId.AutoCompleted && halfTime.resultStatusId != ResultStatusId.ManualCompleted;
    
    if(matchDetail.isSettleDetermined && halfTimeIsRunning) {
      storage.error(Language.confirmRefund.sdtFullTimeErrorMessage);
    } else {
      super.handle(storage);
    }
  }
}