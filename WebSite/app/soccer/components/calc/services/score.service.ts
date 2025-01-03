import { inject, Injectable } from "@angular/core";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { MessageBoxService } from "../../../../shared/services";
import { CalculateAction } from "../../../../shared/constants";
import { MatchDetail } from "../models/match.model";
import { isEqual } from "lodash";

@Injectable()
export class ScoreService {
  #storage = inject(CalculateStorage);
  #messageBoxService = inject(MessageBoxService);
  
  confirmCopyScore(message: string, type: string) {
    const matchDetail = this.#storage.getMatchDetail() as MatchDetail;
           this.#storage.dialogMessage.message = message;
           this.#messageBoxService.confirm(this.#storage.dialogMessage, () => {
               if (isEqual(type, CalculateAction.copyHTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                  this.#storage.setHaftTimeScore(Number(matchDetail.exHTHomeScore), Number(matchDetail.exHTAwayScore));
  
               }
               if (isEqual(type, CalculateAction.copyFTScore) || isEqual(type, CalculateAction.copyAllScore)) {
                      this.#storage.setFullTimeScore(Number(matchDetail.exFTHomeScore), Number(matchDetail.exFTAwayScore));
               }
               this.#storage.changeScore();
           });
       }
}