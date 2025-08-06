import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultStatusId, SettlementStatusId, TicketStatusText } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";

export class SdtVerifyHandler extends AbstractHandler {
  async handle(storage: RefundBaseStorage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const fullTime = storage.getFullTimeResult();
    const halfTime = storage.getHalfTimeResult();
    const halfTimeIsRunning = this.isHalfTimeIsRunning(halfTime);
    
    if(!matchDetail.isSettleDetermined){
      super.handle(storage);
      return;
    }

    if(halfTime.checked && !fullTime.checked) {
      storage.error(Language.confirmRefund.sdtHalfTimeErrorMessage);
      return;
    }

    if(halfTime.ticketStatus !== TicketStatusText.noTicket && halfTimeIsRunning && !halfTime.checked && fullTime.checked) {
      storage.error(Language.confirmRefund.sdtFullTimeErrorMessage);
      return;
    }

    if(halfTime.settlementStatusId === SettlementStatusId.Abandoned1H && !halfTime.checked){
      storage.error(Language.confirmRefund.sdtHalfTimeAbandonedErrorMessage);
      return;
    }

    super.handle(storage);
  }

  private isHalfTimeIsRunning(halfTime: ResultDetail): boolean {
    return halfTime.resultStatusId !== ResultStatusId.AutoCompleted && halfTime.resultStatusId !== ResultStatusId.ManualCompleted;
  }
} 