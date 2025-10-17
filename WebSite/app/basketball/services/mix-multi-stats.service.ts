import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { Resources, PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { SettlementStatusId } from '../../shared/constants';
@Injectable()
export class MixMultiStatsService {
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixReboundsAssists(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    this.handleReboundsAssistsMix(resultDetails, changedResultDetail);
    this.handleReboundsPointsMix(resultDetails, changedResultDetail);
    this.handleReboundsAssistsPointsMix(resultDetails, changedResultDetail);
    this.handleStealsBlocksMix(resultDetails, changedResultDetail);
  }

  private handleReboundsAssistsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssists.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsResult =this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssists);
    if (reboundsAssistsResult) {
      this.calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);
    }
  }

  private handleReboundsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsPointsResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsPoints);
    if (reboundsPointsResult) {
      this.calculateReboundsPointsValue(resultDetails, reboundsPointsResult);
    }
  }

  private handleReboundsAssistsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssistsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsPointsResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssistsPoints);
    if (reboundsAssistsPointsResult) {
      this.calculateReboundsAssistsPointsValue(resultDetails, reboundsAssistsPointsResult);
    }
  }

  private handleStealsBlocksMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixStealsBlocks.includes(changedResultDetail.betType)) {
      return;
    }

    const stealsBlocksResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.stealsBlocks);
    if (stealsBlocksResult) {
      this.calculateStealsBlocksValue(resultDetails, stealsBlocksResult);
    }
  }

  private findMixResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string) {
    return resultDetails.find(result => {
      if (!_.isEqual(result.betType, betType)) {
        return false;
      }

      if (!_.isEqual(result.settlementStatusId, SettlementStatusId.Running)) {
        return false;
      }

      if (!result.relatedCalResources || _.isEmpty(result.relatedCalResources)) {
        return false;
      }

      const relatedResourceIds = result.relatedCalResources.split(',').map(id => id.trim());
      return relatedResourceIds.includes(resourceId);
    });
  }

  private calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const results = this.findResultsByBetTypes(resultDetails, reboundsAssistsResult.relatedCalResources, [PlayerBetTypes.assists, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.assists] || results[PlayerBetTypes.rebounds]) {
      this.updateMixResult(reboundsAssistsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.assists]);
    }
  }

  private calculateReboundsPointsValue(resultDetails: ResultDetail[], reboundsPointsResult: ResultDetail) {
    const results = this.findResultsByBetTypes(resultDetails, reboundsPointsResult.relatedCalResources, [PlayerBetTypes.points, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.points] || results[PlayerBetTypes.rebounds]) {
      this.updateMixResult(reboundsPointsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.points]);
    }
  }

  private calculateReboundsAssistsPointsValue(resultDetails: ResultDetail[], reboundsAssistsPointsResult: ResultDetail) {
    const results = this.findResultsByBetTypes(resultDetails, reboundsAssistsPointsResult.relatedCalResources, [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds]);
    if (results[PlayerBetTypes.points] || results[PlayerBetTypes.assists] || results[PlayerBetTypes.rebounds]) {
      this.updateTripleMixResult(reboundsAssistsPointsResult, results[PlayerBetTypes.rebounds], results[PlayerBetTypes.assists], results[PlayerBetTypes.points]);
    }
  }

  private calculateStealsBlocksValue(resultDetails: ResultDetail[], stealsBlocksResult: ResultDetail) {
    const results = this.findResultsByBetTypes(resultDetails, stealsBlocksResult.relatedCalResources, [PlayerBetTypes.steals, PlayerBetTypes.blocks]);
    if (results[PlayerBetTypes.steals] || results[PlayerBetTypes.blocks]) {
      this.updateMixResult(stealsBlocksResult, results[PlayerBetTypes.steals], results[PlayerBetTypes.blocks]);
    }
  }

  private findResultsByBetTypes(resultDetails: ResultDetail[], relatedCalResources: string, betTypes: string[]): { [key: string]: ResultDetail } {
    const relatedResourceIds = relatedCalResources.split(',').map(id => id.trim());
    const results: { [key: string]: ResultDetail } = {};
    
    for (const resourceId of relatedResourceIds) {
      const result = resultDetails.find(r => _.isEqual(r.resourceId, resourceId));
      if (result) {
        for (const betType of betTypes) {
          if (_.isEqual(result.betType, betType)) {
            results[betType] = result;
            break;
          }
        }
      }
    }
    
    return results;
  }

  private updateMixResult(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    const firstValue = firstResult?.homeValue || '';
    const secondValue = secondResult?.homeValue || '';

    if (!_.isEmpty(firstValue) && !_.isEmpty(secondValue)) {
      const totalValue = parseInt(firstValue) + parseInt(secondValue);
      targetResult.homeValue = totalValue.toString();
      targetResult.checked = true;
    } else {
      targetResult.homeValue = '';
      targetResult.checked = false;
    }
    
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
      targetResult.checked = true;
    } else {
      targetResult.homeValue = '';
      targetResult.checked = false;
    }

    this.updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);
    targetResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(targetResult);
  }

  private updateExternalScores(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    targetResult.externalScores.forEach((externalScore, index) => {
      const firstExternalScore = firstResult.externalScores[index];
      const secondExternalScore = secondResult.externalScores[index];

      if (this.hasValidHomeValue(firstExternalScore) && this.hasValidHomeValue(secondExternalScore)) {
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

      if (this.hasValidHomeValue(reboundsExternalScore) && this.hasValidHomeValue(assistsExternalScore) && this.hasValidHomeValue(pointsExternalScore)) {
        const reboundsValue = parseInt(reboundsExternalScore.homeValue);
        const assistsValue = parseInt(assistsExternalScore.homeValue);
        const pointsValue = parseInt(pointsExternalScore.homeValue);
        externalScore.homeValue = (reboundsValue + assistsValue + pointsValue).toString();
      }
    });
  }

  private hasValidHomeValue(externalScore: ExternalResultDetail) {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}