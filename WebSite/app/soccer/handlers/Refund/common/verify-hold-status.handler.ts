import { RefundStorage } from "../../../storage/refund.storage";
import { AbstractHandler } from "../../abstract.handler.native";


export class VerifyHoldStatusHandler extends AbstractHandler {

  async handle(storage: RefundStorage) {
    const { matchDetail } = storage.getMatch();
  }
} 