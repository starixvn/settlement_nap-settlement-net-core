import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "../../../storage/refund.storage";
import { VerifyMarkedTicketHandler } from "../../../handlers/Refund/common/verify-marked-ticket.handler";
import { RefundHandler } from "../../../handlers/Refund/common/refund.handler";

import { VerifyStatusHandler } from "../../../handlers/Refund/half-time/verify-status.handler";
import { CalculateAction } from "../../../../shared/constants";
import { ConfirmBoxHTHandler } from "../../../handlers/Refund/half-time/confirm-box-ht.handler";
import { ConfirmBoxHandler } from "../../../handlers/Refund/common/confirm-box.handler";
import { VerifyScoreFTHandler } from "../../../handlers/Refund/full-time/verify-score-ft.handler";
import { VerifyGoalRecordFTHandler } from "../../../handlers/Refund/full-time/verify-goal-record-ft.handler";
import { VerifyGoalRecordHTHandler } from "../../../handlers/Refund/all/verify-goal-record-ht.handler";
import { VerifyScoreHTHandler } from "../../../handlers/Refund/all/verify-score-ht.handler";
import { AbstractHandler } from "../../../handlers/abstract.handler.native";

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  #refundStorage = inject(RefundStorage);
  refundHTChain: AbstractHandler;
  refundNotSdtChain: AbstractHandler;
  refundFTChain: AbstractHandler;
  refundAllChain: AbstractHandler;

  constructor() {
    this.refundHTChain = this.buildChain(
      new VerifyMarkedTicketHandler(),
      new VerifyStatusHandler(),
      new ConfirmBoxHTHandler(),
      new RefundHandler());
    this.refundNotSdtChain = this.buildChain(
      new VerifyMarkedTicketHandler(),
      new VerifyStatusHandler(),
      new ConfirmBoxHandler(),
      new RefundHandler());
    this.refundFTChain = this.buildChain(
      new VerifyScoreFTHandler(),
      new VerifyGoalRecordFTHandler(),
      new VerifyMarkedTicketHandler(),
      new VerifyStatusHandler(),
      new ConfirmBoxHandler(),
      new RefundHandler());
    this.refundAllChain = this.buildChain(
      new VerifyScoreHTHandler(),
      new VerifyGoalRecordHTHandler(),
      new VerifyMarkedTicketHandler(),
      new VerifyStatusHandler(),
      new ConfirmBoxHandler(),
      new RefundHandler());
  }

  private buildChain(...handlers: AbstractHandler[]): AbstractHandler {
    for (let i = 0; i < handlers.length - 1; i++) {
      handlers[i].setNextHandler(handlers[i + 1]);
    }
    return handlers[0];
  }

  refund(actionName: string, settleDeterminableTickets: boolean) {
    if (actionName === CalculateAction.refundHalfTime) {
      this.refundHalfTime();
    } else if (actionName === CalculateAction.refundFullTime) {
      this.refundFullTime(settleDeterminableTickets);
    } else if (actionName === CalculateAction.refund) {
      this.refundAll(settleDeterminableTickets);
    }
  }

  refundHalfTime() {
    this.refundHTChain.handle(this.#refundStorage);
  }

  refundFullTime(settleDeterminableTickets: boolean) {
    const { matchDetail, betDaq, betFair } = this.#refundStorage.getMatch();
    if (settleDeterminableTickets || betDaq.settleDeterminedBetDaq || betFair.settleDeterminedBetFair) {
      matchDetail.isSettleAbandonedMatchIBC = settleDeterminableTickets;
      this.refundFTChain.handle(this.#refundStorage);
    } else {
      this.refundNotSdtChain.handle(this.#refundStorage);
    }
  }

  refundAll(settleDeterminableTickets: boolean) {
    const { matchDetail, betDaq, betFair } = this.#refundStorage.getMatch();
    if (settleDeterminableTickets || betDaq.settleDeterminedBetDaq || betFair.settleDeterminedBetFair) {
      matchDetail.isSettleAbandonedMatchIBC = settleDeterminableTickets;
      this.refundAllChain.handle(this.#refundStorage);
    } else {
      this.refundNotSdtChain.handle(this.#refundStorage);
    }
  }
}
