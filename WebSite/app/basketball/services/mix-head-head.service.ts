import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { MixCoreService } from './mix-core.service';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';

@Injectable()
export class MixHeadHeadService {
  readonly targetBetTypes = [PlayerBetTypes.points, PlayerBetTypes.rebounds, PlayerBetTypes.steals, PlayerBetTypes.assists, PlayerBetTypes.shotsScored];
  readonly #mixCoreService = inject(MixCoreService);
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixHeadHead(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!this.targetBetTypes.includes(changedResultDetail.betType)) {
      return;
    }
    
    this.processMixHeadHeadComparison(resultDetails, changedResultDetail);
  }

  private processMixHeadHeadComparison(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    const betType = changedResultDetail.betType;
    
    const mixResultMapping = {
      [PlayerBetTypes.points]: PlayerBetTypes.mostPoints,
      [PlayerBetTypes.rebounds]: PlayerBetTypes.mostRebounds,
      [PlayerBetTypes.assists]: PlayerBetTypes.mostAssists,
      [PlayerBetTypes.steals]: PlayerBetTypes.mostSteals,
      [PlayerBetTypes.shotsScored]: PlayerBetTypes.mostPointShotsScored
    };

    const mixResultType = mixResultMapping[betType];
    if (mixResultType) {
      const mixResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, mixResultType);
      if (mixResult) {
        this.calculateMixHeadHeadValue(resultDetails, mixResult);
      }
    }
  }

  private calculateMixHeadHeadValue(resultDetails: ResultDetail[], mixResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypes(resultDetails, mixResult.relatedCalResources);
    
    if (this.#mixCoreService.hasAnyRefundedResult(results)) {
      mixResult.homeValue = this.#mixCoreService.noneValue;
      mixResult.externalScores[4].homeValue = this.#mixCoreService.noneValue;
      return;
    }
    
    if (results.length === 2) {
      const playerIdWinner = this.comparePlayerStatistics(results[0], results[1]);
      if (playerIdWinner > 0) {
        const winnerOddFlex = mixResult.oddFlex.find(odd => odd.info.playerId === playerIdWinner);
        mixResult.homeValue = winnerOddFlex.betChoice;
      } else {
        mixResult.homeValue = "";
      }
    }

    mixResult.checked = true;
    this.updateExternalScores(mixResult, results);
    mixResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(mixResult);
  }

  private comparePlayerStatistics(player1: ResultDetail, player2: ResultDetail) {
    const player1Value = player1.homeValue;
    const player2Value = player2.homeValue;
   
    if (_.isEmpty(player1Value) || _.isEmpty(player2Value)) {
      return null;
    }

    if (player1Value > player2Value) {
      return player1.oddFlex[0].info.playerId;
    } 
    else if (player2Value > player1Value) {
      return player2.oddFlex[0].info.playerId;
    }

    return null;
  }

  private updateExternalScores(targetResult: ResultDetail, results: ResultDetail[]) {
    if (results.length < 2) {
      return;
    }

    const player1 = results[0];
    const player2 = results[1];
    
    targetResult.externalScores.forEach((externalScore, index) => {
      const player1ExternalScore = player1.externalScores[index];
      const player2ExternalScore = player2.externalScores[index];
      externalScore.homeValue = this.calculateExternalScoreValue(player1, player2, player1ExternalScore, player2ExternalScore);
    });
  }

  private calculateExternalScoreValue(player1: ResultDetail, player2: ResultDetail, player1ExternalScore: ExternalResultDetail, player2ExternalScore: ExternalResultDetail) {
    if (this.#mixCoreService.hasValidHomeValue(player1ExternalScore) 
        && this.#mixCoreService.hasValidHomeValue(player2ExternalScore)) {
      const player1Value = parseInt(player1ExternalScore.homeValue);
      const player2Value = parseInt(player2ExternalScore.homeValue);
      
      if (player1Value > player2Value) {
        return this.getWinnerBetChoice(player1);
      } else if (player2Value > player1Value) {
        return this.getWinnerBetChoice(player2);
      } else {
        return '';
      }
    }

    return "";
  }

  private getWinnerBetChoice(winnerResult: ResultDetail): string {
    const winnerOddFlex = winnerResult.oddFlex.find(odd => odd.info.playerId === winnerResult.oddFlex[0].info.playerId);
    return winnerOddFlex ? winnerOddFlex.betChoice : '';
  }
}