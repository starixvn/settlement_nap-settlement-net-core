import { inject } from "@angular/core";
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { CalculateAction } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";

export class SdtHtVerifyHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const fullTime = storage.getFullTimeResult() as ResultDetail;
    if(matchDetail.isSettleDetermined && !fullTime.checked) {
      storage.error(Language.confirmRefund.sdtHalfTimeErrorMessage);
    } else {
      super.handle(storage);
    }
  }
} 