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
                            this.changeResultState(this.#storage.getHalfTimeResult());
                     }
                     if (isEqual(type, CalculateAction.copyFTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                            this.#storage.setFullTimeScore(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
                            this.#storage.getFullTimeResult().isMismatch = false;
                            this.changeResultState(this.#storage.getFullTimeResult());
                     }
                     this.#storage.changeScore();
              });
       }

       changeResultState(resultDetail: ResultDetail) {
              if (resultDetail.settlementStatusId === SettlementStatusId.Calculated) {
                     resultDetail.resultState = 'calculated';
              } else if (resultDetail.settlementStatusId === SettlementStatusId.Running || isNull(resultDetail.settlementStatusId)) {
                     resultDetail.resultState = '';
              } else {
                     resultDetail.resultState = 'refunded';
              }

              if (resultDetail.isMismatch) {
                     resultDetail.resultState += ' mismatched';
              }
       }
}