import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "../../../storage/refund.storage";
import { VerifyMarkedTicketHandler } from "../../../handlers/refund/common/verify-marked-ticket.handler";
import { RefundHandler } from "../../../handlers/refund/common/refund.handler";

import { VerifyStatusHandler } from "../../../handlers/refund/common/verify-status.handler";
import { CalculateAction } from "../../../../shared/constants";
import { ConfirmBoxHandler } from "../../../handlers/refund/common/confirm-box.handler";
import { VerifyScoreFTHandler } from "../../../handlers/refund/full-time/verify-score-ft.handler";
import { VerifyGoalRecordFTHandler } from "../../../handlers/refund/full-time/verify-goal-record-ft.handler";
import { VerifyGoalRecordHTHandler } from "../../../handlers/refund/all/verify-goal-record-ht.handler";
import { VerifyScoreHTHandler } from "../../../handlers/refund/all/verify-score-ht.handler";
import { AbstractHandler } from "../../../handlers/abstract.handler.native";
import { UndoConfirmHandler } from "../../../handlers/refund/confirm-refund/undo-comfirm.handler.handler";
import { find } from "lodash";
import { ChangeConfirmSettingHandler } from "../../../handlers/refund/common/change-confirm-setting.handler";
import { DoubleCheckConfirmRefundHandler, } from "../../../handlers/refund/confirm-refund/double-check-confirm-refund.handler.handler";
import { VerifyStateConfirmedHandler } from "../../../handlers/refund/common/verify-state-confirmed.handler";
import { MarkedRefundAllHandler } from "../../../handlers/refund/common/marked-refund-all.handler";
import { SdtVerifyHandler } from "../../../handlers/refund/common/sdt-verify.handler";
import { VerifyHTStatusHandler } from "../../../handlers/refund/full-time/verify-ht-status.handler";
import { VerifyScoreHandler } from "../../../handlers/refund/confirm-refund/verify-score.handler";

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  readonly #refundStorage = inject(RefundStorage);
  refundHandler: AbstractHandler;
  undoConfirmChain: AbstractHandler;
  verifyRefundHalfTimeChain: AbstractHandler;
  verifyRefundFullTimeChain: AbstractHandler;
  verifyRefundAllChain: AbstractHandler;
  verifyRefundNotSdtChain: AbstractHandler;
  
  constructor() {
    this.refundHandler = this.buildChain(
      new MarkedRefundAllHandler(),
      new VerifyStateConfirmedHandler(),
      new SdtVerifyHandler(),
      new VerifyMarkedTicketHandler(),
      new ConfirmBoxHandler(),
      new RefundHandler()
    );
    this.undoConfirmChain = this.buildChain(
      new UndoConfirmHandler(),
      new DoubleCheckConfirmRefundHandler(),
      new ChangeConfirmSettingHandler()
    );
    
    this.verifyRefundHalfTimeChain = this.buildChain(
      new MarkedRefundAllHandler(),
      new SdtVerifyHandler(),
      new VerifyScoreHandler(), 
      new VerifyStatusHandler(),
      new DoubleCheckConfirmRefundHandler(),
      new ChangeConfirmSettingHandler()
    );
    
    this.verifyRefundFullTimeChain = this.buildChain(
      new MarkedRefundAllHandler(),
      new VerifyScoreFTHandler(),
      new SdtVerifyHandler(),
      new VerifyScoreHandler(), 
      new VerifyGoalRecordFTHandler(),
      new VerifyStatusHandler(),
      new DoubleCheckConfirmRefundHandler(),
      new ChangeConfirmSettingHandler()
    );
    
    this.verifyRefundAllChain = this.buildChain(
      new MarkedRefundAllHandler(),
      new VerifyScoreHTHandler(),
      new VerifyScoreHandler(), 
      new VerifyGoalRecordHTHandler(),
      new VerifyStatusHandler(),
      new DoubleCheckConfirmRefundHandler(),
      new ChangeConfirmSettingHandler()
    );
    
    this.verifyRefundNotSdtChain = this.buildChain(
      new MarkedRefundAllHandler(),
      new VerifyHTStatusHandler(),
      new VerifyScoreHandler(), 
      new VerifyStatusHandler(),
      new DoubleCheckConfirmRefundHandler(),
      new ChangeConfirmSettingHandler()
    );
  }

  confirmRefund(isSettleDetermined: boolean, actionName: string) {
    const {resultDetails} = this.#refundStorage.getMatch();
    const existResultConfirmed = find(resultDetails, item => 
      (item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt)
    );
    if(existResultConfirmed) {
      this.undoConfirmChain.handle(this.#refundStorage);
    } else {
       const chain = this.verifyRefund(actionName,isSettleDetermined) ;
       chain.handle(this.#refundStorage);
    }
  }

  private verifyRefund(actionName: string, settleDeterminableTickets: boolean): AbstractHandler{
     const { betDaq, betFair, matchDetail } = this.#refundStorage.getMatch();
     matchDetail.isSettleDetermined = settleDeterminableTickets;
     matchDetail.isSettleAbandonedMatchIBC = settleDeterminableTickets || betDaq.settleDeterminedBetDaq || betFair.settleDeterminedBetFair;
     
     switch (actionName) {
       case CalculateAction.refundHalfTime:
         return this.verifyRefundHalfTimeChain;
       case CalculateAction.refundFullTime:
         return settleDeterminableTickets ? this.verifyRefundFullTimeChain : this.verifyRefundNotSdtChain;
       case CalculateAction.refund:
         return settleDeterminableTickets ? this.verifyRefundAllChain : this.verifyRefundNotSdtChain;
       default:
         return null;
     }
  }

  private buildChain(...handlers: AbstractHandler[]): AbstractHandler {
    for (let i = 0; i < handlers.length - 1; i++) {
      handlers[i].setNextHandler(handlers[i + 1]);
    }
    return handlers[0];
  }



  refund(settleDeterminableTickets: boolean) {;
    const { matchDetail, betDaq, betFair } = this.#refundStorage.getMatch();
    matchDetail.isSettleAbandonedMatchIBC = settleDeterminableTickets || betDaq.settleDeterminedBetDaq || betFair.settleDeterminedBetFair;

    this.refundHandler.handle(this.#refundStorage);
  }
}
