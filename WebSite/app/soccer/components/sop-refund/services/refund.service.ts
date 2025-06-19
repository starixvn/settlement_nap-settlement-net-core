import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "../../../storage/refund.storage";
import { VerifyMarkedTicketHandler } from "../../../handlers/Refund/verify-marked-ticket.handler";
import { RefundHandler } from "../../../handlers/Refund/refund.handler";
import { ConfirmationHandler } from "../../../handlers/Refund/half-time/confirmation.handler";
import { VerifyStatusHandler } from "../../../handlers/Refund/half-time/verify-status.handler";
import { CalculateAction } from "../../../../shared/constants";

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  #refundStorage = inject(RefundStorage);

  //Refund HT
  #verifyMarkedTicketHandler = new VerifyMarkedTicketHandler();
  #refundHandler = new RefundHandler();
  #halfTimeConfirmationHandler = new ConfirmationHandler();
  #verifyStatusHandler = new VerifyStatusHandler();

  constructor(){
    this.#verifyMarkedTicketHandler.setNextHandler(this.#verifyStatusHandler);
    this.#verifyStatusHandler.setNextHandler(this.#halfTimeConfirmationHandler);
    this.#halfTimeConfirmationHandler.setNextHandler(this.#refundHandler);
  }

  refund(actionName: string){
    if(actionName === CalculateAction.refundHalfTime){
      this.refundHalfTime();
    }else if(actionName === CalculateAction.refundFullTime){
      this.refundFullTime();
    }
  }

  refundHalfTime(){
    this.#verifyMarkedTicketHandler.handle(this.#refundStorage);
  }

  refundFullTime(){
   
  }
}
