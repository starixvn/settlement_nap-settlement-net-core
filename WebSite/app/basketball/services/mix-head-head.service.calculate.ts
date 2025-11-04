import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { MixCoreService } from './mix-core.service';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';

@Injectable()
export class MixHeadHeadCalculateService {
  readonly #mixCoreService = inject(MixCoreService);
  readonly #verificationBaseService = inject(VerificationBaseService);

  public calculateMixHeadHeadValue(resultDetails: ResultDetail[], mixResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypes(resultDetails, mixResult.relatedCalResources);
    
    if (results.length === 2) {
      mixResult.homeValue = this.comparePlayerStatistics(results[0], results[1], mixResult);
      this.updateExternalScores(mixResult, results);
    }

    mixResult.checked = true;
    mixResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(mixResult);
  }

  private comparePlayerStatistics(player1: ResultDetail, player2: ResultDetail, mixResult: ResultDetail) {
    
    if (_.isEmpty(player1.homeValue) || _.isEmpty(player2.homeValue)) {
      return "";
    }

    const player1Value = parseInt(player1.homeValue);
    const player2Value = parseInt(player2.homeValue);

    return this.determineWinner(player1Value, player2Value, player1, player2, mixResult);
  }
  
  private determineWinner(player1Value: number, player2Value: number, player1: ResultDetail, player2: ResultDetail, mixResult: ResultDetail) {
    if(this.#mixCoreService.hasAnyRefundedResult([player1, player2]) || player1Value === player2Value) {
      return this.#mixCoreService.noneValue;
    }

    const playerIdWinner = this.getPlayerIdWinner(player1Value, player2Value, player1, player2);
    return this.getWinnerBetChoice(mixResult, playerIdWinner);
  }

  private getWinnerBetChoice(mixResult: ResultDetail, playerIdWinner: number): string {
    const winnerOddFlex = mixResult.oddFlex.find(odd => odd.info.playerId === playerIdWinner);
    return winnerOddFlex ? winnerOddFlex.betChoice : '';
  }

  private getPlayerIdWinner(player1Value: number, player2Value: number, player1: ResultDetail, player2: ResultDetail) {
    return player1Value > player2Value 
          ? player1.oddFlex[0].info.playerId 
          : player2.oddFlex[0].info.playerId;
  }

  private updateExternalScores(mixResult: ResultDetail, results: ResultDetail[]) {
    const player1 = results[0];
    const player2 = results[1];

    mixResult.externalScores.forEach((externalScore, index) => {
      const player1ExternalScore = player1.externalScores[index];
      const player2ExternalScore = player2.externalScores[index];
      externalScore.homeValue = this.calculateExternalScoreValue(mixResult, player1, player2, player1ExternalScore, player2ExternalScore);
    });
  }

  private calculateExternalScoreValue(mixResult: ResultDetail,  player1: ResultDetail, player2: ResultDetail, player1ExternalScore: ExternalResultDetail, player2ExternalScore: ExternalResultDetail) {
    if (_.isEmpty(player1ExternalScore.homeValue) || _.isEmpty(player2ExternalScore.homeValue)) {
      return "";
    }
    
    const player1Value = parseInt(player1ExternalScore.homeValue);
    const player2Value = parseInt(player2ExternalScore.homeValue);
    
    return this.determineWinner(player1Value, player2Value, player1, player2, mixResult);
  }
}