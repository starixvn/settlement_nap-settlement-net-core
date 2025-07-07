import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";

export class MarkedRefundAllHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const halfTime = storage.getHalfTimeResult() as ResultDetail;
    const fullTime = storage.getFullTimeResult() as ResultDetail;
    if (matchDetail.isMarkedRefundAll && (!halfTime.checked || !fullTime.checked)) {
        storage.error(Language.confirmRefund.markedRefundAllErrorMessage);
      } else if(matchDetail.isMarkedRefundAll && matchDetail.isSettleDetermined) {
        storage.error(Language.confirmRefund.markedRefundAllSDTErrorMessage);
      }
      else {
        super.handle(storage);
    }
  }
}