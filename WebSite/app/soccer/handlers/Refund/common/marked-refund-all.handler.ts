import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";
import { EventStatus } from "../../../../shared/constants";
import { MatchDetail } from "../../../components/sop-refund/models/match.model";

export class MarkedRefundAllHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const halfTime = storage.getHalfTimeResult() as ResultDetail;
    const fullTime = storage.getFullTimeResult() as ResultDetail;
    if (this.mustRefundAll(matchDetail) && matchDetail.isSettleDetermined) {
        storage.error(Language.confirmRefund.markedRefundAllSDTErrorMessage);
      } else if (this.mustRefundAll(matchDetail) && (!halfTime.checked || !fullTime.checked)) {
        storage.error(Language.confirmRefund.markedRefundAllErrorMessage);
      }
      else {
        super.handle(storage);
    }
  }


  private mustRefundAll(matchDetail: MatchDetail) {
    return matchDetail.eventStatus.toLowerCase() == EventStatus.postponed.toLowerCase() || matchDetail.isMarkedRefundAll;
  }
}