import { VerifyScoreGoalService } from './../../../components/calc/services/verify-score-goal.service';
import { Language } from '../../../../shared/language.native';
import { AbstractHandler } from '../../abstract.handler.native';
import { CalculateBaseStorage } from '../../../storage/storage.service.native';
import { inject } from '@angular/core';
import { ScoreSourceType } from '../../../../shared/constants';
import { ExternalResultDetail, ResultDetail } from '../../../../shared/models/sportsbook-sop';

export class VerifyTraderScoreHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);

  handle(storage: CalculateBaseStorage) {
    const { resultDetails } = storage.getMatch();
    const resultSelected = resultDetails.filter((resultDetail) => resultDetail.checked);
    const traderResults = this.getTraderResults(resultSelected);

    if(this.verifyScore(traderResults)) {
      storage.error(Language.warningInputScore);
    } else{
      super.handle(storage);
    }
  }

  private getTraderResults(selectedResults: ResultDetail[]): ExternalResultDetail[] {
    return selectedResults.flatMap(result => result.externalScores.filter(score => score.sourceId === ScoreSourceType.trader));
  }

  private verifyScore(resultSelected: ExternalResultDetail[]) {
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