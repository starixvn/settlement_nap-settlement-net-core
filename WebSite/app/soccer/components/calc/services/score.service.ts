import { inject, Injectable } from "@angular/core";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { MessageBoxService } from "../../../../shared/services";
import { CalculateAction, SettlementStatusId } from "../../../../shared/constants";
import { isEqual, isNull } from "lodash";
import { ResultDetail } from "../../../models";

@Injectable()
export class ScoreService {
       #storage = inject(CalculateStorage);
       #messageBoxService = inject(MessageBoxService);

       confirmCopyScore(message: string, type: string) {
              const { matchDetail } = this.#storage.getMatch();
              this.#storage.dialogMessage.message = message;
              this.#messageBoxService.confirm(this.#storage.dialogMessage, () => {
                     if (isEqual(type, CalculateAction.copyHTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            this.#storage.setHaftTimeScore(matchDetail.exHTHomeScore, matchDetail.exHTAwayScore);
                            this.#storage.getHalfTimeResult().isMismatch = false;
                     }
                     if (isEqual(type, CalculateAction.copyFTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            this.#storage.setFullTimeScore(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
                            this.#storage.getFullTimeResult().isMismatch = false;
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
                     } else if (resultDetail.settlementStatusId === SettlementStatusId.Running || isNull(resultDetail.settlementStatusId)) {
                            resultDetail.resultState = '';
                     } else {
                            resultDetail.resultState = 'refunded';
                     }
       
                     if (resultDetail.isMismatch || matchDetail.isScoreInconsistent) {
                            resultDetail.resultState += ' mismatched';
                     }
              });
       
       }
}