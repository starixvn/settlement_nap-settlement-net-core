import { VerifyScoreGoalService } from './../../../components/calc/services/verify-score-goal.service';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { Storage } from '../../../storage/storage.service.native';
import { inject } from '@angular/core';
import { ResultDetail } from '../../../models';
export class VerifyScoreHandler extends AbstractHandler {
  #verifyScoreGoalService = inject(VerifyScoreGoalService);
  handle(storage: Storage) {
    const { resultDetails } = storage.getMatch();
    const resultSelected = resultDetails.filter((resultDetail) => resultDetail.checked);  
  
    if(this.verifyScore(resultSelected)) {
      storage.error(Language.warningInputScore);
    } else{
      super.handle(storage);
    }
  }

  private verifyScore(resultSelected: ResultDetail[]) {
    let existScoreInvalid = false;
    resultSelected.forEach((resultDetail) => {
      if(this.#verifyScoreGoalService.isEmptyScore(resultDetail.homeValue) || this.#verifyScoreGoalService.isEmptyScore(resultDetail.awayValue)) {
        existScoreInvalid = true;
        resultDetail.isHomeValueWarning = this.#verifyScoreGoalService.isEmptyScore(resultDetail.homeValue);
        resultDetail.isAwayValueWarning = this.#verifyScoreGoalService.isEmptyScore(resultDetail.awayValue);
      }
    });

    return existScoreInvalid;
  }
}