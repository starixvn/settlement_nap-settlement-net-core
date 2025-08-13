import { inject, Injectable } from "@angular/core";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { MessageBoxService } from "../../../../shared/services";
import { CalculateAction, ScoreSourceType, SettlementStatusId } from "../../../../shared/constants";
import { isEqual, isNull } from "lodash";
import { ResultDetail } from "../../../../shared/models/sportsbook-sop/result-detail.model";
import { VerificationBaseService } from "../../../../core/services/verification-base.service";

@Injectable()
export class ScoreService {
  readonly #storage = inject(CalculateStorage);
  readonly #messageBoxService = inject(MessageBoxService);
  readonly #verificationService = inject(VerificationBaseService);

       confirmCopyScore(message: string, type: string) {
              this.#storage.dialogMessage.message = message;
              this.#messageBoxService.confirm(this.#storage.dialogMessage, () => {
                     if (isEqual(type, CalculateAction.copyHTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            const halfTimeResult = this.#storage.getHalfTimeResult();
                            const providerResult = this.getProviderResult(halfTimeResult);
                            this.#storage.setHaftTimeScore(providerResult.homeValue, providerResult.awayValue);
                            this.#storage.getHalfTimeResult().isScoreMismatched =  this.#verificationService.isMismatchedWarning(halfTimeResult);
                     }
                     if (isEqual(type, CalculateAction.copyFTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            const fullTimeResult = this.#storage.getFullTimeResult();
                            const providerResult = this.getProviderResult(fullTimeResult);
                            this.#storage.setFullTimeScore(providerResult.homeValue, providerResult.awayValue);      
                            this.#storage.getFullTimeResult().isScoreMismatched =  this.#verificationService.isMismatchedWarning(fullTimeResult);
                     }
                     this.#storage.changeScore();
                     this.changeResultState();
              });
       }

       changeResultState() {
              const { matchDetail} = this.#storage.getMatch();
              const resultDetails = [this.#storage.getHalfTimeResult(), this.#storage.getFullTimeResult()];
              resultDetails.forEach(resultDetail => {
                     if (resultDetail.settlementStatusId === SettlementStatusId.Calculated) {
                            resultDetail.resultStatusState = 'calculated';
                            return;
                     }  
                     
                     if (resultDetail.settlementStatusId === SettlementStatusId.Running || isNull(resultDetail.settlementStatusId)) {
                            resultDetail.resultStatusState = '';
                     } else {
                            resultDetail.resultStatusState = 'refunded';
                            return;
                     }
       
                     if (resultDetail.isScoreMismatched || matchDetail.isScoreInconsistent) {
                            resultDetail.resultStatusState += ' mismatched';
                     }
              });
       
       }

       private getProviderResult(resultDetail: ResultDetail) {
              return resultDetail.externalScores.find(x => x.sourceId === ScoreSourceType.Sbo);
       }
}