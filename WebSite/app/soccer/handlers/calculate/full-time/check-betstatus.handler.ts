import { AbstractHandler } from "../../abstract.handler";
import { Storage } from "../../../storage/storage.service";
import { BetStatus, ResourceIds } from "../../../constants";
import { SettlementStatusId } from "../../../../shared/constants";
import { ResultDetail } from "../../../models";
import { Language } from "../../../../shared/language.native";
import { find, includes, isEqual } from "lodash";

export class CheckBetStatusHandler extends AbstractHandler {
  handle(storage: Storage): void {
    const { matchDetail, resultDetails } = storage.getMatch();
    const lowerBetStatus = matchDetail.betStatus?.toLocaleLowerCase();
    const resultHalfTime = find(resultDetails, item => item.resourceId === ResourceIds.halfTime) ?? new ResultDetail();

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