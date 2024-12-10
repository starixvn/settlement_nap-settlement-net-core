import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "./refund.storage";
import { VerifySettleDetermineAndMercyHandler } from "../../handlers/refund/verify-settle-determine-mercy.handler";
import { ConfirmMercyHandler } from "../../handlers/refund/confirm-mercy.handler";
import { ConfirmSettleDetermineHandler } from "../../handlers/refund/confirm-settle-determine.handler";
import { ConfirmNormalHandler } from "../../handlers/refund/confirm-normal.handler";
import { ConfirmRefundHandler } from "../../handlers/refund/confirm-refund.handler";
import { UndoConfirmSettleDetermineHandler } from "../../handlers/refund/undo-confirm-settle-determine.handler";

@Injectable()

export class ConfirmRefundService {
  private readonly verifySettleDetermineAndMercy = new VerifySettleDetermineAndMercyHandler();
  private readonly confirmMercyHandler = new ConfirmMercyHandler();
  private readonly confirmSettleDetermineHandler = new ConfirmSettleDetermineHandler();
  private readonly confirmNormalHandler = new ConfirmNormalHandler();
  private readonly confirmRefundHandler = new ConfirmRefundHandler();
  
  private readonly undoConfirmSettleDetermineHandler = new UndoConfirmSettleDetermineHandler();
  
  #storage = inject(RefundStorage);
  
  constructor() {
    this.verifySettleDetermineAndMercy.setNextHandler(this.confirmMercyHandler);
    this.confirmMercyHandler.setNextHandler(this.confirmSettleDetermineHandler);
    this.confirmSettleDetermineHandler.setNextHandler(this.confirmNormalHandler);
    this.confirmNormalHandler.setNextHandler(this.confirmRefundHandler);     
  }

  confirmRefund() {
    this.verifySettleDetermineAndMercy.handle(this.#storage);
  }

  undoConfirmRefund() {
    this.undoConfirmSettleDetermineHandler.handle(this.#storage);
  }
}