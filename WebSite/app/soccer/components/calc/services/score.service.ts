import { inject, Injectable } from "@angular/core";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { MessageBoxService } from "../../../../shared/services";
import { CalculateAction, SettlementStatusId } from "../../../../shared/constants";
import { isEqual, isNull } from "lodash";
import { ResultDetail } from "../../../models";
import { VerifyScoreGoalService } from "./verify-score-goal.service";

@Injectable()
export class ScoreService {
       #storage = inject(CalculateStorage);
       #messageBoxService = inject(MessageBoxService);
       #verifyScoreGoalService = inject(VerifyScoreGoalService);


       confirmCopyScore(message: string, type: string) {
              const { matchDetail } = this.#storage.getMatch();
              this.#storage.dialogMessage.message = message;
              this.#messageBoxService.confirm(this.#storage.dialogMessage, () => {
                     if (isEqual(type, CalculateAction.copyHTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            this.#storage.setHaftTimeScore(matchDetail.exHTHomeScore, matchDetail.exHTAwayScore);
                            const halfTimeResults = [this.#storage.getHalfTimeResult(),this.#storage.outsideHtResult,this.#storage.traderHtResult,this.#storage.providerHtResult] 
                           
                            this.#storage.getHalfTimeResult().isMismatch =  this.#verifyScoreGoalService.isMismatched(halfTimeResults);;
                     }
                     if (isEqual(type, CalculateAction.copyFTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            this.#storage.setFullTimeScore(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);      
                            const fullTimeResults = [this.#storage.getFullTimeResult(),this.#storage.outsideFtResult,this.#storage.traderFtResult,this.#storage.providerFtResult] 
                            this.#storage.getFullTimeResult().isMismatch =  this.#verifyScoreGoalService.isMismatched(fullTimeResults);;
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
                            resultDetail.resultState = 'calculated';
                            return;
                     }  
                     
                     if (resultDetail.settlementStatusId === SettlementStatusId.Running || isNull(resultDetail.settlementStatusId)) {
                            resultDetail.resultState = '';
                     } else {
                            resultDetail.resultState = 'refunded';
                            return;
                     }
       
                     if (resultDetail.isMismatch || matchDetail.isScoreInconsistent) {
                            resultDetail.resultState += ' mismatched';
                     }
              });
       
       }
}