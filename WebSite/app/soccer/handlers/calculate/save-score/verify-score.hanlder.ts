import { VerifyScoreGoalService } from './../../../components/calc/services/verify-score-goal.service';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { Storage } from '../../../storage/storage.service.native';
import { inject } from '@angular/core';
import { ResultDetail } from '../../../models';
import { ScoreSourceType } from '../../../../shared/constants';
export class VerifyTraderScoreHandler extends AbstractHandler {
  #verifyScoreGoalService = inject(VerifyScoreGoalService);
  handle(storage: Storage) {
    const { resultDetails } = storage.getMatch();
    const resultSelected = resultDetails.filter((resultDetail) => resultDetail.checked);
    const traderResults = resultDetails.filter((resultDetail) => resultDetail.sourceId === ScoreSourceType.trader && resultSelected.some((result) => result.resourceId === resultDetail.resourceId));

  
    if(this.verifyScore(traderResults)) {
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
    console.log(resultSelected);

    return existScoreInvalid;
  }
}