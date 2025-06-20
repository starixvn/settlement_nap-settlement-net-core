import { AbstractHandler } from "../../abstract.handler.native";
import { inject } from "@angular/core";

import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { VerificationBaseService } from "../../../services/verification-base.service";
import { Language } from "../../../../shared/language.native";
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { VerifyService } from "../../../components/sop-refund/services/verify.service";

export class VerifyGoalRecordFTHandler extends AbstractHandler {
  #verifyService = inject(VerifyService);
  #verificationBaseService = inject(VerificationBaseService);
  public handle(storage: RefundBaseStorage): void {
    const { matchDetail } = storage.getMatch();
    const isRefundHalfTimeBetStatus = this.#verifyService.isRefundHalfTimeBetStatus(matchDetail);

    if(this.#verificationBaseService.goalRecordExistSemicolon(matchDetail) && isRefundHalfTimeBetStatus){
      storage.error(Language.soccer.noNeedSemicolonOnGoalRecord);
    }else if(!isRefundHalfTimeBetStatus && this.#verificationBaseService.goalRecordNotExistSemicolon(matchDetail)){
      storage.error(Language.soccer.needSemicolonOnGoalRecord);
    }else if(this.#verificationBaseService.isFullTimeGoalRecordInvalid(matchDetail)){
      matchDetail.isWarningGoalRecord = true;
      storage.error(Language.soccer.goalRecordNotConsistent);
    }else if (matchDetail.applyGoalRecord && this.#verificationBaseService.isHTGoalRecordConsistent(matchDetail)) {
      storage.error(Language.soccer.halfTimeGoalRecordNotConsistent);
    }else if (matchDetail.isScoreInconsistent) {
      storage.error(Language.soccer.confirmWithInconsistentScore);
    }else{
      super.handle(storage);
    }
  }
}