import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "./refund.storage";
import { VerifySettleDetermineAndMercyHandler } from "../../handlers/refund/verify-settle-determine-mercy.handler";
import { ConfirmMercyHandler } from "../../handlers/refund/confirm-mercy.handler";
import { ConfirmSettleDetermineHandler } from "../../handlers/refund/confirm-settle-determine.handler";
import { RefundHandler } from "../../handlers/refund/refund.handler";
import { UndoConfirmSettleDetermineHandler } from "../../handlers/refund/undo-confirm-settle-determine.handler";

@Injectable()

export class RefundService {
  private readonly verifyHandler = new VerifySettleDetermineAndMercyHandler();
  private readonly confirmMercyHandler = new ConfirmMercyHandler();
  private readonly confirmSettleDetermineHandler = new ConfirmSettleDetermineHandler();
  private readonly refundHandler = new RefundHandler();
  private readonly undoConfirmSettleDetermineHandler = new UndoConfirmSettleDetermineHandler();
  #storage = inject(RefundStorage);
  constructor() {
    this.verifyHandler.setNextHandler(this.confirmMercyHandler);
    this.confirmMercyHandler.setNextHandler(this.confirmSettleDetermineHandler);
    this.confirmSettleDetermineHandler.setNextHandler(this.refundHandler);
  }

  confirmRefund() {
    this.verifyHandler.handle(this.#storage);
  }

  undoConfirmRefund() {
    this.undoConfirmSettleDetermineHandler.handle(this.#storage);
  }
}