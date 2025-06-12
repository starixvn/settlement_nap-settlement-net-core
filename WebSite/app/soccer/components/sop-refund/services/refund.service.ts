import { inject, Injectable } from "@angular/core";
import { RefundStorage } from "../../../storage/refund.storage";
import { VerificationBaseService } from "../../../services/verification-base.service";
import { SettlementStatusId } from "../../../../shared/constants";

@Injectable({
  providedIn: 'root'
})
export class RefundService {

  #refundStorage = inject(RefundStorage);
  #verificationBaseService = inject(VerificationBaseService);

  verifyScore(){
    const htExists = !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getHalfTimeResult().homeValue) && !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getHalfTimeResult().awayValue);
    const ftExists = !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getFullTimeResult().homeValue) && !this.#verificationBaseService.isEmptyScore(this.#refundStorage.getFullTimeResult().awayValue);
    const isInconsistent = Number(this.#refundStorage.getHalfTimeResult().homeValue) > Number(this.#refundStorage.getFullTimeResult().homeValue) || Number(this.#refundStorage.getHalfTimeResult().awayValue) > Number(this.#refundStorage.getFullTimeResult().awayValue);
    this.#refundStorage.getMatchDetail().isScoreInconsistent = htExists && ftExists && isInconsistent;
  }

  resetScore(){
    const halfTimeResult = this.#refundStorage.getHalfTimeResult();
    const fullTimeResult = this.#refundStorage.getFullTimeResult();

    if(halfTimeResult.settlementStatusId !== SettlementStatusId.Calculated && halfTimeResult.settlementStatusId !== SettlementStatusId.Abandoned1H){
      halfTimeResult.homeValue = "";
      halfTimeResult.awayValue = "";
    }

    if(fullTimeResult.settlementStatusId !== SettlementStatusId.Calculated && fullTimeResult.settlementStatusId !== SettlementStatusId.Abandoned2H){
      fullTimeResult.homeValue = "";
      fullTimeResult.awayValue = "";
    }
  }

  verifySettleDeterminableInput(){
    const halfTime = this.#refundStorage.getHalfTimeResult();
    const fullTime = this.#refundStorage.getFullTimeResult();

    if(halfTime.checked && fullTime.checked){
      fullTime.isEnabled = false;
      halfTime.isEnabled = true;
    }else{
      fullTime.isEnabled = fullTime.checked;
      halfTime.isEnabled = halfTime.checked;
    }
  }
}
