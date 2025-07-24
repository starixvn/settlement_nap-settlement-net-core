import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ResultStatusId, TicketStatus, TicketStatusText } from "../../../../shared/constants";
import { ResultDetail } from "../../../models/result-detail.model";

export class VerifyHTStatusHandler extends AbstractHandler {
  public handle(storage: RefundBaseStorage): void {
    const halfTime = storage.getHalfTimeResult() as ResultDetail;

    if (halfTime.checked 
      || halfTime.resultStatusId === ResultStatusId.AutoCompleted 
      || halfTime.resultStatusId === ResultStatusId.ManualCompleted 
      || halfTime.ticketStatus === TicketStatusText.noTicket) {
      super.handle(storage);
    } else {
      storage.error(Language.soccer.halfTimeNotSettleYet);
    }
  }
}