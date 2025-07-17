import { AbstractHandler } from "../../abstract.handler.native";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { ResultStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models/result-detail.model";

export class VerifyHTStatusHandler extends AbstractHandler {
  public handle(storage: RefundBaseStorage): void {
    const halfTime = storage.getHalfTimeResult() as ResultDetail;
    const fullTime = storage.getFullTimeResult() as ResultDetail;

    if (halfTime.checked || fullTime.resultStatusId === ResultStatusId.AutoCompleted || fullTime.resultStatusId === ResultStatusId.ManualCompleted) {
      super.handle(storage);
    } else {
      storage.error(Language.soccer.halfTimeNotSettleYet);
    }
  }
}