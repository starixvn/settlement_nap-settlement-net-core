import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { BetStatus, ResourceIds } from "../../../constants";
import { SettlementStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";
import { find, includes, isEqual } from "lodash";

export class CheckBetStatusHandler extends AbstractHandler {
  handle(storage: Storage): void {
    const { matchDetail } = storage.getMatch();
    const lowerBetStatus = matchDetail.betStatus?.toLocaleLowerCase();
    const resultHalfTime = storage.getHalfTimeResult();

    if (
      includes(lowerBetStatus, BetStatus.abandoned1H) || (includes(lowerBetStatus, `${BetStatus.refunded};`) &&
        isEqual(resultHalfTime.settlementStatusId, SettlementStatusId.Refund))
    ) {
      storage.error(Language.CannotUncalculateFTMessage);
    } else {
      super.handle(storage);
    }
  }
}