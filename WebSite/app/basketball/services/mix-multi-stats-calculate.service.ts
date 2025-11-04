import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { MixCoreService } from './mix-core.service';
@Injectable()
export class MixMultiStatsCalculateService {
  readonly #mixCoreService = inject(MixCoreService);
  readonly #verificationBaseService = inject(VerificationBaseService);

  public calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypesWithMapping(resultDetails, reboundsAssistsResult.relatedCalResources, [PlayerBetTypes.assists, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.assists] || results[PlayerBetTypes.rebounds]) {
      this.updateMixResult(reboundsAssistsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.assists]);
    }
  }

  public calculateReboundsPointsValue(resultDetails: ResultDetail[], reboundsPointsResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypesWithMapping(resultDetails, reboundsPointsResult.relatedCalResources, [PlayerBetTypes.points, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.points] || results[PlayerBetTypes.rebounds]) {
      this.updateMixResult(reboundsPointsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.points]);
    }
  }

  public calculateReboundsAssistsPointsValue(resultDetails: ResultDetail[], reboundsAssistsPointsResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypesWithMapping(resultDetails, reboundsAssistsPointsResult.relatedCalResources, [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.points] || results[PlayerBetTypes.assists] || results[PlayerBetTypes.rebounds]) {
      this.updateTripleMixResult(reboundsAssistsPointsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.assists], results[PlayerBetTypes.points]);
    }
  }

  public calculateStealsBlocksValue(resultDetails: ResultDetail[], stealsBlocksResult: ResultDetail) {
    const results = this.#mixCoreService.findResultsByBetTypesWithMapping(resultDetails, stealsBlocksResult.relatedCalResources, [PlayerBetTypes.steals, PlayerBetTypes.blocks]);
    if (results[PlayerBetTypes.steals] || results[PlayerBetTypes.blocks]) {
      this.updateMixResult(stealsBlocksResult, results[PlayerBetTypes.steals], results[PlayerBetTypes.blocks]);
    }
  }


  private updateMixResult(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    const firstValue = firstResult?.homeValue || '';
    const secondValue = secondResult?.homeValue || '';

    if (!_.isEmpty(firstValue) && !_.isEmpty(secondValue)) {
      const totalValue = parseInt(firstValue) + parseInt(secondValue);
      targetResult.homeValue = totalValue.toString();
    
    } else {
      targetResult.homeValue = '';
    }
    
    targetResult.checked = true;
    this.updateExternalScores(targetResult, firstResult, secondResult);
    targetResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(targetResult);
  }

  private updateTripleMixResult(targetResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail, pointsResult: ResultDetail) {
    const reboundsValue = reboundsResult?.homeValue || '';
    const assistsValue = assistsResult?.homeValue || '';
    const pointsValue = pointsResult?.homeValue || '';

    if (!_.isEmpty(reboundsValue) && !_.isEmpty(assistsValue) && !_.isEmpty(pointsValue)) {
      const totalValue = parseInt(reboundsValue) + parseInt(assistsValue) + parseInt(pointsValue);
      targetResult.homeValue = totalValue.toString();
    } else {
      targetResult.homeValue = '';
    }

    targetResult.checked = true;
    this.updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);
    targetResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(targetResult);
  }

  private updateExternalScores(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    targetResult.externalScores.forEach((externalScore, index) => {
      const firstExternalScore = firstResult.externalScores[index];
      const secondExternalScore = secondResult.externalScores[index];

      if (this.#mixCoreService.hasValidHomeValue(firstExternalScore) 
        && this.#mixCoreService.hasValidHomeValue(secondExternalScore)) {
        const firstValue = parseInt(firstExternalScore.homeValue);
        const secondValue = parseInt(secondExternalScore.homeValue);
        externalScore.homeValue = (firstValue + secondValue).toString();
      }
    });
  }

  private updateTripleExternalScores(targetResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail, pointsResult: ResultDetail) {
    targetResult.externalScores.forEach((externalScore, index) => {
      const reboundsExternalScore = reboundsResult.externalScores[index];
      const assistsExternalScore = assistsResult.externalScores[index];
      const pointsExternalScore = pointsResult.externalScores[index];

      if (this.#mixCoreService.hasValidHomeValue(reboundsExternalScore) 
        && this.#mixCoreService.hasValidHomeValue(assistsExternalScore) 
      && this.#mixCoreService.hasValidHomeValue(pointsExternalScore)) {
        const reboundsValue = parseInt(reboundsExternalScore.homeValue);
        const assistsValue = parseInt(assistsExternalScore.homeValue);
        const pointsValue = parseInt(pointsExternalScore.homeValue);
        externalScore.homeValue = (reboundsValue + assistsValue + pointsValue).toString();
      }
    });
  }
}