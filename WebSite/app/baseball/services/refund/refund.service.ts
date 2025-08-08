import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "./refund.storage";
import { ConfirmMercyHandler } from "../../handlers/refund/confirm-mercy.handler";
import { ConfirmSettleDetermineHandler } from "../../handlers/refund/confirm-settle-determine.handler";
import { VerifyRefundHandler } from "../../handlers/refund/verify-refund.handler";
import { RefundHandler } from "../../handlers/refund/refund.handler";

@Injectable()

export class RefundService {
  private readonly confirmMercyHandler = new ConfirmMercyHandler();
  private readonly confirmSettleDetermineHandler = new ConfirmSettleDetermineHandler();
  
  private readonly verifyRefundHandler = new VerifyRefundHandler();
  private readonly refundHandler = new RefundHandler();
  
  readonly #storage = inject(RefundStorage);
  
  constructor() {
    this.confirmMercyHandler.setNextHandler(this.confirmSettleDetermineHandler);
    this.confirmSettleDetermineHandler.setNextHandler(this.verifyRefundHandler);
    this.verifyRefundHandler.setNextHandler(this.refundHandler);
  }

  refund() {
    this.confirmMercyHandler.handle(this.#storage);
  }
}