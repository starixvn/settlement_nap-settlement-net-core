import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "../../../storage/refund.storage";
import { VerificationBaseService } from "../../../services/verification-base.service";
import { ResultDetail } from "../../../models";
import { MatchDetail } from "../../sop-refund/models/match.model";
import { EventStatus } from "../../../../shared/constants";
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class VerifyService {

  #refundStorage = inject(RefundStorage);
  #verificationBaseService = inject(VerificationBaseService);

  verifyScore(){
    const htExists = !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getHalfTimeResult().homeValue) && !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getHalfTimeResult().awayValue);
    const ftExists = !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getFullTimeResult().homeValue) && !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getFullTimeResult().awayValue);
    const isInconsistent = Number(this.#refundStorage.getHalfTimeResult().homeValue) > Number(this.#refundStorage.getFullTimeResult().homeValue) || Number(this.#refundStorage.getHalfTimeResult().awayValue) > Number(this.#refundStorage.getFullTimeResult().awayValue);
    this.#refundStorage.getMatchDetail().isScoreInconsistent = htExists && ftExists && isInconsistent;
  }

   isRefundHalfTimeBetStatus(matchDetail: MatchDetail) {
    return !_.isNil(matchDetail.betStatus) &&
      (_.includes(matchDetail.betStatus, `${EventStatus.refundHalftime};`) || _.includes(matchDetail.betStatus, `${EventStatus.refund};`));
  }

   isEmptyScore(value: string | number) {
    if (_.isNumber(value)) {
        return false;
    }
    return _.isNull(value) || _.isEmpty(value);
}
}